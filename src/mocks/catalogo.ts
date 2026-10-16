import {
  CategoriaSchema,
  RedeSchema,
  type Categoria,
  type Edicao,
  type FiltrosCatalogo,
  type Nft,
  type NftResumo,
  type PaginaCatalogo,
  type Rede,
} from '@/types'
import { POR_PAGINA_CATALOGO } from '@/lib/catalogo'
import { compararEth } from '@/utils/eth'

export const POR_PAGINA = POR_PAGINA_CATALOGO
/** "Novos lançamentos" = os N lançados mais recentemente (os dados são fixos; uma janela de dias esvaziaria com o tempo). */
export const QUANTIDADE_LANCAMENTOS = 12
export const QUANTIDADE_DESTAQUES = 3

/** Edição exibida no card: a mais barata com estoque; se todas esgotaram, a mais barata. */
export function edicaoPadrao(nft: Nft): Edicao {
  const porPreco = [...nft.edicoes].sort((a, b) => compararEth(a.preco, b.preco))
  return porPreco.find((edicao) => edicao.disponivel > 0) ?? porPreco[0]!
}

export function paraResumo(nft: Nft): NftResumo {
  const edicao = edicaoPadrao(nft)
  return {
    id: nft.id,
    nome: nft.nome,
    imagem: nft.imagem,
    categoria: nft.categoria,
    rede: nft.rede,
    raro: nft.raro,
    versao: nft.versao,
    edicaoPadraoId: edicao.id,
    preco: edicao.preco,
    precoAnterior: edicao.precoAnterior,
    esgotado: nft.edicoes.every((e) => e.disponivel === 0),
  }
}

/** Sem acento e em minúsculas: "Esmeralda" e "esmeralda" casam. */
const normalizar = (texto: string) => texto.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase()

function casaBusca(nft: Nft, busca: string | undefined) {
  const termo = normalizar(busca?.trim() ?? '')
  if (!termo) return true
  return [nft.nome, nft.colecao, nft.tokenId, ...nft.atributos].some((campo) => normalizar(campo).includes(termo))
}

function casaPreco(nft: Nft, minimo: string | undefined, maximo: string | undefined) {
  const preco = edicaoPadrao(nft).preco
  return (!minimo || compararEth(preco, minimo) >= 0) && (!maximo || compararEth(preco, maximo) <= 0)
}

const maisRecentesPrimeiro = (a: Nft, b: Nft) => Date.parse(b.lancadoEm) - Date.parse(a.lancadoEm) || a.id.localeCompare(b.id)

function ordenar(nfts: Nft[], ordenacao: FiltrosCatalogo['ordenacao']): Nft[] {
  const comparadores: Record<FiltrosCatalogo['ordenacao'], (a: Nft, b: Nft) => number> = {
    recentes: maisRecentesPrimeiro,
    'preco-asc': (a, b) => compararEth(edicaoPadrao(a).preco, edicaoPadrao(b).preco) || a.id.localeCompare(b.id),
    'preco-desc': (a, b) => compararEth(edicaoPadrao(b).preco, edicaoPadrao(a).preco) || a.id.localeCompare(b.id),
    avaliacao: (a, b) => b.avaliacao.media - a.avaliacao.media || b.avaliacao.total - a.avaliacao.total || a.id.localeCompare(b.id),
  }
  return [...nfts].sort(comparadores[ordenacao])
}

function porAba(nfts: Nft[], aba: FiltrosCatalogo['aba']): Nft[] {
  if (aba === 'em-alta') return nfts.filter((nft) => nft.emAlta)
  if (aba === 'lancamentos') {
    const recentes = new Set([...nfts].sort(maisRecentesPrimeiro).slice(0, QUANTIDADE_LANCAMENTOS).map((nft) => nft.id))
    return nfts.filter((nft) => recentes.has(nft.id))
  }
  return nfts
}

function contar<T extends string>(opcoes: readonly T[], valores: T[]): Record<T, number> {
  const contagem = Object.fromEntries(opcoes.map((opcao) => [opcao, 0])) as Record<T, number>
  for (const valor of valores) contagem[valor] += 1
  return contagem
}

/**
 * Filtros combináveis: dentro do mesmo grupo é "OU" (Música ou Jogos), entre grupos é "E".
 * As contagens de cada grupo ignoram o próprio grupo, para a sidebar mostrar quanto cada opção somaria.
 */
export function consultarCatalogo(todos: readonly Nft[], filtros: FiltrosCatalogo): PaginaCatalogo {
  const categorias = new Set<Categoria>(filtros.categorias ?? [])
  const redes = new Set<Rede>(filtros.redes ?? [])
  const casaCategoria = (nft: Nft) => categorias.size === 0 || categorias.has(nft.categoria)
  const casaRede = (nft: Nft) => redes.size === 0 || redes.has(nft.rede)

  const base = porAba([...todos], filtros.aba).filter((nft) => casaBusca(nft, filtros.busca) && casaPreco(nft, filtros.precoMin, filtros.precoMax))
  const resultado = ordenar(base.filter((nft) => casaCategoria(nft) && casaRede(nft)), filtros.ordenacao)

  const totalPaginas = Math.ceil(resultado.length / POR_PAGINA)
  const inicio = (filtros.pagina - 1) * POR_PAGINA

  return {
    itens: resultado.slice(inicio, inicio + POR_PAGINA).map(paraResumo),
    pagina: filtros.pagina,
    porPagina: POR_PAGINA,
    total: resultado.length,
    totalPaginas,
    facetas: {
      categorias: contar(CategoriaSchema.options, base.filter(casaRede).map((nft) => nft.categoria)),
      redes: contar(RedeSchema.options, base.filter(casaCategoria).map((nft) => nft.rede)),
    },
  }
}

/** Banner da Início: os lançamentos mais recentes (no Figma, Emerald Ape em destaque). */
export function destaques(todos: readonly Nft[]): NftResumo[] {
  return [...todos].sort(maisRecentesPrimeiro).slice(0, QUANTIDADE_DESTAQUES).map(paraResumo)
}
