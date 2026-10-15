import type { CodigoErro } from '@/types'

/**
 * Regra aplicada pelo handler de rede antes dos handlers de negócio.
 * `rota` = "MÉTODO /caminho", com `*` (qualquer trecho) e `:param` (um segmento). Ex.: "GET /api/nfts/:id".
 */
export interface RegraRede {
  rota: string
  /** Faixa de latência; o valor exato sai do gerador com semente (reproduzível). */
  latenciaMs?: readonly [number, number]
  /** Latência por ordem de chegada, em ciclo. Ex.: [1200, 200] faz a 1ª resposta chegar depois da 2ª. */
  sequenciaLatenciaMs?: readonly number[]
  /** Responde erro HTTP no formato ErroApi. */
  erro?: { status: number; codigo: CodigoErro; mensagem: string }
  /** Simula rede caída (o Axios recebe erro de conexão, sem resposta). */
  falhaDeRede?: boolean
  /** Aplica a falha só nas primeiras N chamadas de cada rota concreta; depois deixa passar. */
  vezes?: number
}

/** Comportamentos lidos pelos handlers de negócio. */
export interface FlagsCenario {
  catalogoVazio: boolean
  /** A primeira chamada autenticada responde 401 SESSAO_INVALIDA. */
  expirarSessao: boolean
  resultadoPagamento: 'confirmado' | 'recusado'
  /** Tempo até o pedido sair de pendente (via order.updated). */
  atrasoConfirmacaoMs: number
  /** Atraso da resposta de POST /api/pedidos depois de o pedido já ter sido criado. */
  atrasoRespostaPedidoMs: number
  alterarPrecoAposCotacao: boolean
  esgotarNaCompra: boolean
}

export interface Cenario {
  nome: NomeCenario
  descricao: string
  regras: readonly RegraRede[]
  flags: FlagsCenario
}

const FLAGS_PADRAO: FlagsCenario = {
  catalogoVazio: false,
  expirarSessao: false,
  resultadoPagamento: 'confirmado',
  atrasoConfirmacaoMs: 2000,
  atrasoRespostaPedidoMs: 0,
  alterarPrecoAposCotacao: false,
  esgotarNaCompra: false,
}

const LATENCIA_NORMAL: RegraRede = { rota: '* /api/*', latenciaMs: [150, 400] }

export const NOMES_CENARIO = [
  'padrao',
  'lento',
  'instavel',
  'offline',
  'erro-servidor',
  'fora-de-ordem',
  'catalogo-vazio',
  'sessao-expirada',
  'pagamento-recusado',
  'timeout-pedido',
  'preco-alterado',
  'esgotado-na-compra',
] as const
export type NomeCenario = (typeof NOMES_CENARIO)[number]

type DefinicaoCenario = Omit<Cenario, 'nome' | 'flags'> & { flags?: Partial<FlagsCenario> }

const DEFINICOES: Record<NomeCenario, DefinicaoCenario> = {
  padrao: {
    descricao: 'Latência normal, tudo funciona e o pagamento confirma.',
    regras: [LATENCIA_NORMAL],
  },
  lento: {
    descricao: 'Latência de 1,5 a 3 s em todas as chamadas (skeletons visíveis).',
    regras: [{ rota: '* /api/*', latenciaMs: [1500, 3000] }],
  },
  instavel: {
    descricao: 'A primeira chamada de cada rota falha com 503; a nova tentativa funciona.',
    regras: [
      { rota: '* /api/*', vezes: 1, erro: { status: 503, codigo: 'FALHA_TRANSITORIA', mensagem: 'Serviço temporariamente indisponível. Tente novamente.' } },
      LATENCIA_NORMAL,
    ],
  },
  offline: {
    descricao: 'Toda chamada falha como se a conexão tivesse caído.',
    regras: [{ rota: '* /api/*', falhaDeRede: true }],
  },
  'erro-servidor': {
    descricao: 'Catálogo e detalhe respondem 500 sempre.',
    regras: [
      { rota: 'GET /api/nfts*', erro: { status: 500, codigo: 'FALHA_TRANSITORIA', mensagem: 'Erro interno ao carregar o catálogo.' } },
      LATENCIA_NORMAL,
    ],
  },
  'fora-de-ordem': {
    descricao: 'Respostas da listagem do catálogo chegam fora de ordem (a 1ª busca responde depois da 2ª).',
    regras: [{ rota: 'GET /api/nfts', sequenciaLatenciaMs: [1200, 200] }, LATENCIA_NORMAL],
  },
  'catalogo-vazio': {
    descricao: 'O catálogo não tem nenhum NFT.',
    regras: [LATENCIA_NORMAL],
    flags: { catalogoVazio: true },
  },
  'sessao-expirada': {
    descricao: 'A primeira chamada autenticada responde 401 de sessão expirada.',
    regras: [LATENCIA_NORMAL],
    flags: { expirarSessao: true },
  },
  'pagamento-recusado': {
    descricao: 'O pedido é criado e termina recusado.',
    regras: [LATENCIA_NORMAL],
    flags: { resultadoPagamento: 'recusado' },
  },
  'timeout-pedido': {
    descricao: 'O pedido é criado, mas a resposta demora mais que o timeout do app; a nova tentativa recupera o mesmo pedido.',
    regras: [LATENCIA_NORMAL],
    flags: { atrasoRespostaPedidoMs: 15_000 },
  },
  'preco-alterado': {
    descricao: 'O preço de um item do carrinho muda logo após a cotação.',
    regras: [LATENCIA_NORMAL],
    flags: { alterarPrecoAposCotacao: true },
  },
  'esgotado-na-compra': {
    descricao: 'A edição esgota no momento de criar o pedido.',
    regras: [LATENCIA_NORMAL],
    flags: { esgotarNaCompra: true },
  },
}

export const CENARIOS: Readonly<Record<NomeCenario, Cenario>> = Object.fromEntries(
  NOMES_CENARIO.map((nome) => {
    const { flags, ...definicao } = DEFINICOES[nome]
    return [nome, { nome, ...definicao, flags: { ...FLAGS_PADRAO, ...flags } }]
  }),
) as Record<NomeCenario, Cenario>

export function ehNomeCenario(nome: string): nome is NomeCenario {
  return (NOMES_CENARIO as readonly string[]).includes(nome)
}
