import axios from 'axios'
import { ErroApiSchema, type CodigoErro } from '@/types'

/** Códigos gerados pelo próprio cliente, quando não há resposta válida da API. */
export type CodigoErroCliente = 'SEM_CONEXAO' | 'TIMEOUT' | 'CANCELADO' | 'RESPOSTA_INVALIDA' | 'DESCONHECIDO'
export type CodigoErroHttp = CodigoErro | CodigoErroCliente

/** Único tipo de erro que sai da camada HTTP. A interface decide pelo `codigo`, nunca pela mensagem. */
export class ErroHttp extends Error {
  override readonly name = 'ErroHttp'

  constructor(
    readonly codigo: CodigoErroHttp,
    mensagem: string,
    /** Status HTTP; `null` quando não houve resposta (rede, timeout, cancelamento). */
    readonly status: number | null = null,
    /** Erros por campo do formulário: nome do campo → mensagem. */
    readonly campos: Readonly<Record<string, string>> = {},
  ) {
    super(mensagem)
  }
}

const TRANSITORIOS: ReadonlySet<CodigoErroHttp> = new Set(['FALHA_TRANSITORIA', 'SEM_CONEXAO', 'TIMEOUT'])

/** Falha que pode passar sozinha: só estas justificam nova tentativa. */
export function ehErroTransitorio(erro: unknown): boolean {
  return erro instanceof ErroHttp && TRANSITORIOS.has(erro.codigo)
}

const MENSAGENS: Record<CodigoErroHttp, string> = {
  VALIDACAO: 'Confira os dados informados.',
  SESSAO_INVALIDA: 'Sua sessão expirou. Entre novamente para continuar.',
  SEM_PERMISSAO: 'Você não tem permissão para esta ação.',
  NAO_ENCONTRADO: 'Não encontramos o que você procurava.',
  CONFLITO: 'Esses dados já estão em uso.',
  CONFLITO_DISPONIBILIDADE: 'A disponibilidade deste item mudou.',
  CUPOM_INVALIDO: 'Cupom inválido.',
  CUPOM_EXPIRADO: 'Este cupom expirou.',
  IDEMPOTENCIA_CONFLITO: 'Este pedido já foi enviado com outros dados.',
  FALHA_TRANSITORIA: 'O serviço está instável no momento. Tente novamente.',
  SEM_CONEXAO: 'Sem conexão. Verifique sua internet e tente novamente.',
  TIMEOUT: 'A resposta demorou demais. Tente novamente.',
  CANCELADO: 'A operação foi cancelada.',
  RESPOSTA_INVALIDA: 'Recebemos uma resposta inesperada. Tente novamente.',
  DESCONHECIDO: 'Algo deu errado. Tente novamente.',
}

/** Texto para toasts e avisos: a mensagem da API quando houver, senão a padrão do código. */
export function mensagemAmigavel(erro: unknown): string {
  if (erro instanceof ErroHttp) return erro.status !== null && erro.message ? erro.message : MENSAGENS[erro.codigo]
  return MENSAGENS.DESCONHECIDO
}

/** Converte qualquer falha vinda do Axios em ErroHttp. */
export function normalizarErro(erro: unknown): ErroHttp {
  if (erro instanceof ErroHttp) return erro
  if (axios.isCancel(erro)) return new ErroHttp('CANCELADO', MENSAGENS.CANCELADO)
  if (!axios.isAxiosError(erro)) return new ErroHttp('DESCONHECIDO', MENSAGENS.DESCONHECIDO)

  const { response } = erro
  if (response) {
    const corpo = ErroApiSchema.safeParse(response.data)
    if (corpo.success) {
      const { codigo, mensagem, campos } = corpo.data.erro
      return new ErroHttp(codigo, mensagem, response.status, campos)
    }
    const codigo = response.status >= 500 ? 'FALHA_TRANSITORIA' : 'DESCONHECIDO'
    return new ErroHttp(codigo, MENSAGENS[codigo], response.status)
  }
  if (erro.code === 'ETIMEDOUT' || erro.code === 'ECONNABORTED') return new ErroHttp('TIMEOUT', MENSAGENS.TIMEOUT)
  return new ErroHttp('SEM_CONEXAO', MENSAGENS.SEM_CONEXAO)
}
