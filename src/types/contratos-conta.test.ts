import { describe, expect, it } from 'vitest'
import {
  AlterarSenhaEntradaSchema,
  CadastroEntradaSchema,
  CarteiraEntradaSchema,
  ErroApiSchema,
  EthSchema,
  QuantidadeSchema,
  SessaoSchema,
  type CarteiraEntrada,
} from '@/types'

function erroDoCampo(resultado: { success: boolean; error?: { issues: { path: PropertyKey[]; message: string }[] } }, campo: string) {
  return resultado.error?.issues.find((i) => i.path[0] === campo)?.message
}

describe('comum', () => {
  it('EthSchema aceita string decimal e recusa number, vírgula e notação científica', () => {
    expect(EthSchema.safeParse('1.19').success).toBe(true)
    expect(EthSchema.safeParse(1.19).success).toBe(false)
    expect(EthSchema.safeParse('1,19').success).toBe(false)
    expect(EthSchema.safeParse('1e-6').success).toBe(false)
  })

  it('QuantidadeSchema exige inteiro a partir de 1', () => {
    expect(QuantidadeSchema.safeParse(2).success).toBe(true)
    expect(QuantidadeSchema.safeParse(1.5).success).toBe(false)
    expect(QuantidadeSchema.safeParse(0).success).toBe(false)
  })

  it('ErroApiSchema valida o corpo de erro com campos e recusa código desconhecido', () => {
    expect(
      ErroApiSchema.safeParse({
        erro: { codigo: 'VALIDACAO', mensagem: 'Dados inválidos', campos: { email: 'Já cadastrado' } },
      }).success,
    ).toBe(true)
    expect(ErroApiSchema.safeParse({ erro: { codigo: 'QUALQUER', mensagem: 'x' } }).success).toBe(false)
  })
})

describe('sessao', () => {
  const cadastro = { nomeUsuario: 'colecionador_01', email: 'ana@kurio.dev', senha: 'senha-forte', confirmarSenha: 'senha-forte' }

  it('aceita cadastro válido', () => {
    expect(CadastroEntradaSchema.safeParse(cadastro).success).toBe(true)
  })

  it('associa o erro de confirmação ao campo confirmarSenha', () => {
    const r = CadastroEntradaSchema.safeParse({ ...cadastro, confirmarSenha: 'outra-senha' })
    expect(erroDoCampo(r, 'confirmarSenha')).toBe('As senhas não conferem')
  })

  it('recusa senha curta e e-mail inválido', () => {
    const r = CadastroEntradaSchema.safeParse({ ...cadastro, email: 'ana', senha: '123', confirmarSenha: '123' })
    expect(erroDoCampo(r, 'email')).toBe('Informe um e-mail válido')
    expect(erroDoCampo(r, 'senha')).toBe('A senha deve ter pelo menos 8 caracteres')
  })

  it('sessão não carrega senha', () => {
    const sessao = SessaoSchema.parse({
      token: 'tok',
      expiraEm: '2026-10-15T20:00:00.000Z',
      usuario: { id: 'u1', nomeUsuario: 'ana', nomeExibicao: 'Ana', email: 'ana@kurio.dev', avatarUrl: null, senha: 'x' },
    })
    expect(sessao.usuario).not.toHaveProperty('senha')
  })
})

describe('perfil', () => {
  it('exige nova senha diferente da atual e confirmação igual', () => {
    const igualAtual = AlterarSenhaEntradaSchema.safeParse({ senhaAtual: 'senha-forte', novaSenha: 'senha-forte', confirmarNovaSenha: 'senha-forte' })
    expect(erroDoCampo(igualAtual, 'novaSenha')).toBe('A nova senha deve ser diferente da atual')

    const naoConfere = AlterarSenhaEntradaSchema.safeParse({ senhaAtual: 'antiga-123', novaSenha: 'nova-senha', confirmarNovaSenha: 'nova-senhx' })
    expect(erroDoCampo(naoConfere, 'confirmarNovaSenha')).toBe('As senhas não conferem')
  })
})

describe('carteiras', () => {
  const carteira: CarteiraEntrada = {
    nomeExibicao: 'Ana Souza',
    apelido: 'Principal',
    rede: 'ethereum',
    nomePerfil: 'ana',
    endereco: '0xA91F4c2b7d0E3f5a6B8c9D1e2F3a4B5c6D7eE82C',
    tipoCarteira: 'metamask',
    codigoIndicacao: 'KURIO10',
    email: 'ana@kurio.dev',
    nomeEns: { nome: 'ana', sufixo: '.eth' },
  }

  it('aceita carteira válida', () => {
    expect(CarteiraEntradaSchema.safeParse(carteira).success).toBe(true)
  })

  it('recusa endereço fora do padrão 0x + 40 hexadecimais', () => {
    for (const endereco of ['0x123', 'A91F4c2b7d0E3f5a6B8c9D1e2F3a4B5c6D7eE82C', '0xZZ1F4c2b7d0E3f5a6B8c9D1e2F3a4B5c6D7eE82C']) {
      expect(erroDoCampo(CarteiraEntradaSchema.safeParse({ ...carteira, endereco }), 'endereco')).toMatch(/0x/)
    }
  })

  it('aceita só redes EVM no pagamento', () => {
    expect(CarteiraEntradaSchema.safeParse({ ...carteira, rede: 'solana' }).success).toBe(false)
  })
})
