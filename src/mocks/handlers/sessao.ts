import { http, HttpResponse } from 'msw'
import { CadastroEntradaSchema, LoginEntradaSchema, type CadastroEntrada, type Sessao, type Usuario } from '@/types'
import { banco, proximoId, type EstadoBanco } from '../db'
import { gerarHashSenha, verificarSenha } from '../senha'
import { autenticar, DURACAO_SESSAO_MS, lerToken } from './autenticacao'
import { responderErro, validarCorpo } from './respostas'

function criarSessao(db: EstadoBanco, usuario: Usuario): Sessao {
  const token = `tok_${crypto.randomUUID()}`
  const expiraEm = new Date(Date.now() + DURACAO_SESSAO_MS).toISOString()
  db.sessoes[token] = { usuarioId: usuario.id, expiraEm }
  return { token, expiraEm, usuario }
}

/** Campos já em uso (e-mail e/ou nome de usuário), comparados sem diferenciar maiúsculas. */
function conflitosCadastro(db: Readonly<EstadoBanco>, email: string, nomeUsuario: string): Record<string, string> {
  const campos: Record<string, string> = {}
  if (db.usuarios.some((u) => u.usuario.email.toLowerCase() === email)) campos.email = 'Este e-mail já está cadastrado'
  if (db.usuarios.some((u) => u.usuario.nomeUsuario.toLowerCase() === nomeUsuario.toLowerCase())) {
    campos.nomeUsuario = 'Este nome de usuário já está em uso'
  }
  return campos
}

/** ENS inicial derivado do nome de usuário (só minúsculas, números e hífen). */
const ensInicial = (nomeUsuario: string) => nomeUsuario.toLowerCase().replace(/[^a-z0-9-]/g, '-').slice(0, 63)

export const handlersSessao = [
  http.post('*/api/auth/cadastro', async ({ request }) => {
    const dados = await validarCorpo<CadastroEntrada>(request, CadastroEntradaSchema)
    if (dados instanceof Response) return dados
    const email = dados.email.trim().toLowerCase()

    const conflitos = conflitosCadastro(banco.ler(), email, dados.nomeUsuario)
    if (Object.keys(conflitos).length) return responderErro(409, 'CONFLITO', 'Esses dados já estão em uso.', conflitos)

    // O hash é assíncrono, então acontece fora do `alterar`; o conflito é reconferido lá dentro.
    const senhaHash = await gerarHashSenha(dados.senha)
    const resultado = banco.alterar((db) => {
      const novosConflitos = conflitosCadastro(db, email, dados.nomeUsuario)
      if (Object.keys(novosConflitos).length) return { conflitos: novosConflitos }

      const usuario: Usuario = { id: proximoId(db, 'usr'), nomeUsuario: dados.nomeUsuario, nomeExibicao: dados.nomeUsuario, email, avatarUrl: null }
      db.usuarios.push({
        usuario,
        senhaHash,
        perfil: {
          nomeExibicao: usuario.nomeExibicao,
          nomeUsuario: usuario.nomeUsuario,
          email,
          nomeEns: { nome: ensInicial(usuario.nomeUsuario), sufixo: '.eth' },
          apelidoCarteira: 'Principal',
          avatarUrl: null,
        },
        carteiras: { principal: null, secundaria: null },
        favoritos: [],
      })
      return { sessao: criarSessao(db, usuario) }
    })

    if ('conflitos' in resultado) return responderErro(409, 'CONFLITO', 'Esses dados já estão em uso.', resultado.conflitos)
    return HttpResponse.json<Sessao>(resultado.sessao, { status: 201 })
  }),

  http.post('*/api/auth/login', async ({ request }) => {
    const dados = await validarCorpo(request, LoginEntradaSchema)
    if (dados instanceof Response) return dados

    const registro = banco.ler().usuarios.find((u) => u.usuario.email.toLowerCase() === dados.email.trim().toLowerCase())
    // Mesma resposta para e-mail inexistente e senha errada: não revela quais e-mails existem.
    if (!registro || !(await verificarSenha(dados.senha, registro.senhaHash))) {
      return responderErro(401, 'VALIDACAO', 'E-mail ou senha incorretos.')
    }
    return HttpResponse.json<Sessao>(banco.alterar((db) => criarSessao(db, registro.usuario)))
  }),

  http.get('*/api/auth/sessao', ({ request }) => {
    const usuario = autenticar(request)
    if (usuario instanceof Response) return usuario
    const token = lerToken(request)!
    return HttpResponse.json<Sessao>({ token, expiraEm: banco.ler().sessoes[token]!.expiraEm, usuario })
  }),

  http.post('*/api/auth/logout', ({ request }) => {
    const token = lerToken(request)
    if (token && banco.ler().sessoes[token]) {
      banco.alterar((db) => {
        delete db.sessoes[token]
      })
    }
    return new HttpResponse(null, { status: 204 })
  }),
]
