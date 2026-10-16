import { describe, expect, it } from 'vitest'
import { FiltrosCatalogoSchema, PaginaCatalogoSchema, type FiltrosCatalogo } from '@/types'
import { compararEth } from '@/utils/eth'
import { consultarCatalogo, destaques, edicaoPadrao, POR_PAGINA, QUANTIDADE_LANCAMENTOS } from './catalogo'
import { criarNfts } from './fixtures'

const nfts = criarNfts()
const consultar = (filtros: Partial<FiltrosCatalogo> = {}) => consultarCatalogo(nfts, FiltrosCatalogoSchema.parse(filtros))
const todosOsResultados = (filtros: Partial<FiltrosCatalogo>) => {
  const primeira = consultar(filtros)
  return Array.from({ length: primeira.totalPaginas }, (_, i) => consultar({ ...filtros, pagina: i + 1 }).itens).flat()
}

describe('listagem', () => {
  it('padrão: 9 por página, mais recentes primeiro, começando pelos NFTs do Figma, e no contrato', () => {
    const pagina = consultar()
    expect(PaginaCatalogoSchema.safeParse(pagina).success).toBe(true)
    expect(pagina).toMatchObject({ pagina: 1, porPagina: POR_PAGINA, total: 60, totalPaginas: 7 })
    expect(pagina.itens.slice(0, 3).map((i) => i.nome)).toEqual(['Emerald Ape #042', 'Sage Nomad #009', 'Neon Vessel #552'])
    expect(pagina.itens[2]).toMatchObject({ preco: '1.99', precoAnterior: '2.29', raro: true })
  })

  it('pagina até o fim e devolve vazio além da última página', () => {
    expect(consultar({ pagina: 7 }).itens).toHaveLength(60 - 6 * POR_PAGINA)
    expect(consultar({ pagina: 8 })).toMatchObject({ itens: [], total: 60 })
    expect(new Set(todosOsResultados({}).map((i) => i.id)).size).toBe(60)
  })
})

describe('busca', () => {
  it('ignora maiúsculas e acentos e procura em nome, coleção, token e atributos', () => {
    expect(todosOsResultados({ busca: 'ESMERALDA' }).length).toBe(nfts.filter((n) => n.atributos.includes('Esmeralda')).length)
    expect(todosOsResultados({ busca: 'oculos' }).length).toBe(todosOsResultados({ busca: 'Óculos' }).length)
    expect(todosOsResultados({ busca: '#0042' }).map((i) => i.nome)).toEqual(['Emerald Ape #042'])
    expect(consultar({ busca: 'kurio barons' }).total).toBe(nfts.filter((n) => n.colecao === 'Kurio Barons').length)
  })

  it('busca sem resultado devolve vazio com total zero', () => {
    expect(consultar({ busca: 'nada-com-isso' })).toMatchObject({ itens: [], total: 0, totalPaginas: 0 })
  })
})

describe('filtros combináveis', () => {
  it('OU dentro do grupo e E entre grupos', () => {
    const resultado = todosOsResultados({ categorias: ['musica', 'jogos'], redes: ['ethereum'] })
    const esperado = nfts.filter((n) => ['musica', 'jogos'].includes(n.categoria) && n.rede === 'ethereum')
    expect(resultado.map((i) => i.id).sort()).toEqual(esperado.map((n) => n.id).sort())
  })

  it('faixa de preço usa a edição padrão e compara como decimal', () => {
    const resultado = todosOsResultados({ precoMin: '1.0', precoMax: '2' })
    expect(resultado.length).toBe(nfts.filter((n) => compararEth(edicaoPadrao(n).preco, '1') >= 0 && compararEth(edicaoPadrao(n).preco, '2') <= 0).length)
    for (const item of resultado) expect(compararEth(item.preco, '1') >= 0 && compararEth(item.preco, '2') <= 0).toBe(true)
  })

  it('contagem de cada grupo ignora o próprio grupo (não zera as outras coleções)', () => {
    const { facetas } = consultar({ categorias: ['musica'], redes: ['polygon'] })
    expect(facetas.categorias.jogos).toBe(nfts.filter((n) => n.categoria === 'jogos' && n.rede === 'polygon').length)
    expect(facetas.redes.ethereum).toBe(nfts.filter((n) => n.categoria === 'musica' && n.rede === 'ethereum').length)
    expect(Object.values(consultar().facetas.categorias).reduce((a, b) => a + b, 0)).toBe(60)
  })

  it('abas: "lançamentos" são os 12 mais recentes e "em alta" segue a marcação', () => {
    expect(consultar({ aba: 'lancamentos' }).total).toBe(QUANTIDADE_LANCAMENTOS)
    expect(todosOsResultados({ aba: 'lancamentos' })[0]?.nome).toBe('Emerald Ape #042')
    expect(consultar({ aba: 'em-alta' }).total).toBe(nfts.filter((n) => n.emAlta).length)
  })
})

describe('ordenação', () => {
  it('menor e maior preço em ordem decimal, com desempate estável por id', () => {
    const asc = todosOsResultados({ ordenacao: 'preco-asc' })
    for (let i = 1; i < asc.length; i++) expect(compararEth(asc[i - 1]!.preco, asc[i]!.preco)).toBeLessThanOrEqual(0)
    const desc = todosOsResultados({ ordenacao: 'preco-desc' })
    expect(desc[0]!.preco).toBe(asc.at(-1)!.preco)
    expect(todosOsResultados({ ordenacao: 'preco-asc' })).toEqual(asc)
  })

  it('mais bem avaliados primeiro', () => {
    const porAvaliacao = todosOsResultados({ ordenacao: 'avaliacao' }).map((i) => nfts.find((n) => n.id === i.id)!.avaliacao.media)
    expect(porAvaliacao).toEqual([...porAvaliacao].sort((a, b) => b - a))
  })
})

describe('card e destaques', () => {
  it('edição padrão é a mais barata com estoque; esgotado só se nenhuma tiver estoque', () => {
    const nft = structuredClone(nfts[0]!)
    const padrao = edicaoPadrao(nft)
    expect(padrao.rotulo).toBe('1/50')
    nft.edicoes.forEach((e) => (e.disponivel = 0))
    expect(consultarCatalogo([nft], FiltrosCatalogoSchema.parse({})).itens[0]?.esgotado).toBe(true)
  })

  it('destaques são os 3 lançamentos mais recentes', () => {
    expect(destaques(nfts).map((i) => i.nome)).toEqual(['Emerald Ape #042', 'Sage Nomad #009', 'Neon Vessel #552'])
  })
})
