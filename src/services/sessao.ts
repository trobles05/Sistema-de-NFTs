import { lerDados, http } from '@/lib/http'
import { SessaoSchema, type CadastroEntrada, type LoginEntrada } from '@/types'

export const servicoSessao = {
  entrar: (dados: LoginEntrada) => lerDados(SessaoSchema, http.post('/auth/login', dados)),
  cadastrar: (dados: CadastroEntrada) => lerDados(SessaoSchema, http.post('/auth/cadastro', dados)),
  consultar: (signal?: AbortSignal) => lerDados(SessaoSchema, http.get('/auth/sessao', { signal })),
  sair: () => http.post('/auth/logout'),
}
