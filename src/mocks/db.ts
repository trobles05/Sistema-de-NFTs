import type { Cotacao, Nft, Pedido } from '@/types'
import { armazenamentoPadrao, type Armazenamento } from '@/lib/armazenamento'
import { criarNfts, criarUsuarios, type UsuarioFixture } from './fixtures'

export { criarArmazenamentoMemoria, type Armazenamento } from '@/lib/armazenamento'

/**
 * Mudar o formato do estado ou as fixtures exige subir esta versão: dados salvos de outra versão voltam às fixtures.
 * v2: raridade dos 9 NFTs do Figma igual ao Figma (T-015).
 */
export const VERSAO_ESQUEMA = 2
export const CHAVE_ARMAZENAMENTO = `kurio:mock-db:v${VERSAO_ESQUEMA}`

export interface ItemCarrinhoRegistro {
  id: string
  nftId: string
  edicaoId: string
  quantidade: number
}

export interface CarrinhoRegistro {
  itens: ItemCarrinhoRegistro[]
  versao: number
  atualizadoEm: string
}

export interface SessaoRegistro {
  usuarioId: string
  expiraEm: string
}

export type CotacaoRegistro = Cotacao & { usuarioId: string }
export type PedidoRegistro = Pedido & { usuarioId: string }

export interface IdempotenciaRegistro {
  usuarioId: string
  /** Assinatura do corpo da requisição: mesma chave com corpo diferente = conflito. */
  assinatura: string
  pedidoId: string
}

export interface EstadoBanco {
  versaoEsquema: number
  revisao: number
  nfts: Nft[]
  usuarios: UsuarioFixture[]
  carrinhos: Record<string, CarrinhoRegistro>
  sessoes: Record<string, SessaoRegistro>
  cotacoes: Record<string, CotacaoRegistro>
  pedidos: Record<string, PedidoRegistro>
  idempotencia: Record<string, IdempotenciaRegistro>
  sequencias: Record<string, number>
}

/** NFT ou pedido cuja `versao` mudou numa alteração (base dos eventos nft.updated/order.updated). */
export type Mudanca = { recurso: 'nft'; id: string } | { recurso: 'pedido'; id: string }

function estadoInicial(revisao: number): EstadoBanco {
  return {
    versaoEsquema: VERSAO_ESQUEMA,
    revisao,
    nfts: criarNfts(),
    usuarios: criarUsuarios(),
    carrinhos: {},
    sessoes: {},
    cotacoes: {},
    pedidos: {},
    idempotencia: {},
    sequencias: {},
  }
}

function ehEstadoValido(dado: unknown): dado is EstadoBanco {
  if (typeof dado !== 'object' || dado === null) return false
  const estado = dado as Partial<EstadoBanco>
  return (
    estado.versaoEsquema === VERSAO_ESQUEMA &&
    typeof estado.revisao === 'number' &&
    Array.isArray(estado.nfts) &&
    Array.isArray(estado.usuarios) &&
    ['carrinhos', 'sessoes', 'cotacoes', 'pedidos', 'idempotencia', 'sequencias'].every(
      (campo) => typeof estado[campo as keyof EstadoBanco] === 'object' && estado[campo as keyof EstadoBanco] !== null,
    )
  )
}

/** Gera ids sequenciais e previsíveis (`ped-0001`). Usar dentro de `alterar`, sobre o rascunho. */
export function proximoId(estado: EstadoBanco, prefixo: string): string {
  const numero = (estado.sequencias[prefixo] ?? 0) + 1
  estado.sequencias[prefixo] = numero
  return `${prefixo}-${String(numero).padStart(4, '0')}`
}

function detectarMudancas(antes: EstadoBanco, depois: EstadoBanco): Mudanca[] {
  const versoesNft = new Map(antes.nfts.map((nft) => [nft.id, nft.versao]))
  const mudancas: Mudanca[] = depois.nfts
    .filter((nft) => versoesNft.get(nft.id) !== nft.versao)
    .map((nft) => ({ recurso: 'nft', id: nft.id }))
  for (const pedido of Object.values(depois.pedidos)) {
    if (antes.pedidos[pedido.id]?.versao !== pedido.versao) mudancas.push({ recurso: 'pedido', id: pedido.id })
  }
  return mudancas
}

export function criarBanco(opcoes: { armazenamento?: Armazenamento; chave?: string } = {}) {
  const chave = opcoes.chave ?? CHAVE_ARMAZENAMENTO
  const chaveRevisao = `${chave}:revisao`
  // O armazenamento padrão só é resolvido no primeiro uso, não ao importar o módulo.
  let armazenamento = opcoes.armazenamento
  let estado: EstadoBanco | null = null
  const ouvintes = new Set<(mudanca: Mudanca) => void>()

  const storage = () => (armazenamento ??= armazenamentoPadrao())

  function gravar(novo: EstadoBanco) {
    estado = novo
    try {
      storage().setItem(chave, JSON.stringify(novo))
      storage().setItem(chaveRevisao, String(novo.revisao))
    } catch (erro) {
      console.warn('[mocks] Não foi possível persistir o banco simulado; seguindo em memória.', erro)
    }
  }

  function carregar(): EstadoBanco {
    const salvo = storage().getItem(chave)
    if (salvo) {
      try {
        const dado: unknown = JSON.parse(salvo)
        if (ehEstadoValido(dado)) return dado
      } catch {
        // JSON corrompido: cai para as fixtures abaixo.
      }
    }
    const inicial = estadoInicial(0)
    gravar(inicial)
    return inicial
  }

  /** Recarrega se outra aba (ou um reset) gravou uma revisão diferente da que está em memória. */
  function atual(): EstadoBanco {
    const revisaoSalva = storage().getItem(chaveRevisao)
    if (!estado || (revisaoSalva !== null && Number(revisaoSalva) !== estado.revisao)) estado = carregar()
    return estado
  }

  return {
    /** Estado atual, somente leitura. Para gravar, use `alterar`. */
    ler(): Readonly<EstadoBanco> {
      return atual()
    },

    /**
     * Única forma de gravar. A função recebe um rascunho; se lançar erro, nada é gravado.
     * Deve ser síncrona: trabalho assíncrono (ex.: hash de senha) acontece antes.
     */
    alterar<T>(fn: (rascunho: EstadoBanco) => T): T {
      const antes = atual()
      const rascunho = structuredClone(antes)
      const resultado = fn(rascunho)
      if (resultado instanceof Promise) throw new TypeError('banco.alterar não aceita função assíncrona')
      rascunho.revisao = antes.revisao + 1
      gravar(rascunho)
      for (const mudanca of detectarMudancas(antes, rascunho)) {
        for (const ouvinte of ouvintes) {
          try {
            ouvinte(mudanca)
          } catch (erro) {
            console.error('[mocks] Erro em ouvinte do banco simulado', erro)
          }
        }
      }
      return resultado
    },

    /** Volta integralmente às fixtures. Não notifica ouvintes: o cliente reconcilia via REST. */
    resetar(): void {
      const revisaoAnterior = estado?.revisao ?? Number(storage().getItem(chaveRevisao) ?? 0)
      gravar(estadoInicial(revisaoAnterior + 1))
    },

    /** Recebe cada NFT/pedido alterado. Devolve a função que cancela a assinatura. */
    assinar(ouvinte: (mudanca: Mudanca) => void): () => void {
      ouvintes.add(ouvinte)
      return () => ouvintes.delete(ouvinte)
    },
  }
}

export type Banco = ReturnType<typeof criarBanco>

/** Instância única usada pelos handlers do MSW. */
export const banco = criarBanco()
