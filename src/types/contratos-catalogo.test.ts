import { describe, expect, it } from 'vitest'
import {
  AdicionarItemEntradaSchema,
  CotacaoEntradaSchema,
  EdicaoSchema,
  FiltrosCatalogoSchema,
  PaginaCatalogoSchema,
  type NftResumo,
} from '@/types'

describe('nft', () => {
  it('FiltrosCatalogo aplica padrões e converte a página vinda da URL', () => {
    expect(FiltrosCatalogoSchema.parse({ pagina: '3' })).toEqual({ aba: 'todos', ordenacao: 'recentes', pagina: 3 })
  })

  it('FiltrosCatalogo recusa página inválida, categoria desconhecida e faixa de preço invertida', () => {
    expect(FiltrosCatalogoSchema.safeParse({ pagina: '0' }).success).toBe(false)
    expect(FiltrosCatalogoSchema.safeParse({ categorias: ['pintura'] }).success).toBe(false)
    const invertido = FiltrosCatalogoSchema.safeParse({ precoMin: '12.30', precoMax: '0.02' })
    expect(invertido.error?.issues[0]?.path).toEqual(['precoMin'])
  })

  it('FiltrosCatalogo compara faixa de preço pelo valor, não pelo texto', () => {
    expect(FiltrosCatalogoSchema.safeParse({ precoMin: '9.99', precoMax: '10.0' }).success).toBe(true)
  })

  it('Edicao aceita estoque zero (indisponível) e exige limite por pedido', () => {
    const edicao = { id: 'e1', rotulo: '1/50', preco: '1.19', precoAnterior: null, disponivel: 0, limitePorPedido: 5 }
    expect(EdicaoSchema.safeParse(edicao).success).toBe(true)
    expect(EdicaoSchema.safeParse({ ...edicao, limitePorPedido: 0 }).success).toBe(false)
    expect(EdicaoSchema.safeParse({ ...edicao, rotulo: '1/100' }).success).toBe(false)
  })

  it('PaginaCatalogo exige contagem para todas as categorias e redes', () => {
    const item: NftResumo = {
      id: 'n1', nome: 'Emerald Ape #042', imagem: 'ape-green-jacket', categoria: 'arte-digital', rede: 'ethereum',
      raro: true, versao: 1, edicaoPadraoId: 'e1', preco: '1.19', precoAnterior: null, esgotado: false,
    }
    const categorias = { 'arte-digital': 1, fotografia: 0, musica: 0, 'arte-3d': 0, colecionaveis: 0, generativa: 0, jogos: 0, assinaturas: 0, utilidade: 0 }
    const pagina = { itens: [item], pagina: 1, porPagina: 9, total: 1, totalPaginas: 1, facetas: { categorias, redes: { ethereum: 1, polygon: 0, solana: 0 } } }
    expect(PaginaCatalogoSchema.safeParse(pagina).success).toBe(true)
    expect(PaginaCatalogoSchema.safeParse({ ...pagina, facetas: { categorias: {}, redes: {} } }).success).toBe(false)
  })
})

describe('carrinho e cotação', () => {
  it('item do carrinho exige quantidade inteira', () => {
    expect(AdicionarItemEntradaSchema.safeParse({ nftId: 'n1', edicaoId: 'e1', quantidade: 2 }).success).toBe(true)
    expect(AdicionarItemEntradaSchema.safeParse({ nftId: 'n1', edicaoId: 'e1', quantidade: 2.5 }).success).toBe(false)
  })

  it('cupom é normalizado em maiúsculas e a rede precisa ser de pagamento', () => {
    expect(CotacaoEntradaSchema.parse({ rede: 'polygon', cupom: ' kurio10 ' }).cupom).toBe('KURIO10')
    expect(CotacaoEntradaSchema.safeParse({ rede: 'solana' }).success).toBe(false)
  })
})
