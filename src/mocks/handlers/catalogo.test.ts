import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { DestaquesSchema, ErroApiSchema, NftSchema, PaginaCatalogoSchema } from '@/types'
import { estadoCenario } from '../cenarios'
import { banco } from '../db'
import { servidor } from '../node'

async function chamar(caminho: string) {
  const resposta = fetch(`http://kurio.test/api${caminho}`)
  await vi.runAllTimersAsync()
  return resposta
}

beforeAll(() => servidor.listen({ onUnhandledRequest: 'error' }))
beforeEach(() => {
  vi.useFakeTimers({ toFake: ['setTimeout'] })
  banco.resetar()
  estadoCenario.definirCenario('padrao')
})
afterEach(() => vi.useRealTimers())
afterAll(() => servidor.close())

describe('GET /api/nfts', () => {
  it('aceita listas repetindo a chave e responde no contrato', async () => {
    const resposta = await chamar('/nfts?categorias=musica&categorias=jogos&redes=ethereum&ordenacao=preco-asc&pagina=1')
    expect(resposta.status).toBe(200)
    const pagina = PaginaCatalogoSchema.parse(await resposta.json())
    for (const item of pagina.itens) {
      expect(['musica', 'jogos']).toContain(item.categoria)
      expect(item.rede).toBe('ethereum')
    }
  })

  it('parâmetros inválidos respondem 400 com o campo', async () => {
    for (const consulta of ['pagina=0', 'categorias=pintura', 'precoMin=12.30&precoMax=0.02', 'ordenacao=aleatoria']) {
      const resposta = await chamar(`/nfts?${consulta}`)
      expect(resposta.status, consulta).toBe(400)
      expect(ErroApiSchema.parse(await resposta.json()).erro.codigo).toBe('VALIDACAO')
    }
  })

  it('cenário catalogo-vazio devolve lista e contagens vazias', async () => {
    estadoCenario.definirCenario('catalogo-vazio')
    const pagina = PaginaCatalogoSchema.parse(await (await chamar('/nfts')).json())
    expect(pagina).toMatchObject({ itens: [], total: 0, totalPaginas: 0 })
    expect(Object.values(pagina.facetas.redes).every((n) => n === 0)).toBe(true)
  })
})

describe('GET /api/nfts/destaques e /api/nfts/:id', () => {
  it('destaques não são confundidos com um id', async () => {
    const { itens } = DestaquesSchema.parse(await (await chamar('/nfts/destaques')).json())
    expect(itens[0]?.nome).toBe('Emerald Ape #042')
  })

  it('detalhe por id responde o NFT completo', async () => {
    const nft = NftSchema.parse(await (await chamar('/nfts/nft-001')).json())
    expect(nft).toMatchObject({ nome: 'Emerald Ape #042', tokenId: '#0042' })
    expect(nft.edicoes.map((e) => e.rotulo)).toEqual(['1/1', '1/10', '1/50', 'ABERTA'])
  })

  it('NFT inexistente (ou catálogo vazio) responde 404', async () => {
    expect((await chamar('/nfts/nft-999')).status).toBe(404)
    estadoCenario.definirCenario('catalogo-vazio')
    const resposta = await chamar('/nfts/nft-001')
    expect(resposta.status).toBe(404)
    expect(ErroApiSchema.parse(await resposta.json()).erro.codigo).toBe('NAO_ENCONTRADO')
  })

  it('reflete o banco: mudança de preço aparece na próxima consulta e pode trocar a edição padrão', async () => {
    banco.alterar((db) => {
      db.nfts[0]!.edicoes.find((e) => e.rotulo === '1/50')!.preco = '1.15'
      db.nfts[0]!.versao += 1
    })
    const pagina = PaginaCatalogoSchema.parse(await (await chamar('/nfts')).json())
    expect(pagina.itens[0]).toMatchObject({ nome: 'Emerald Ape #042', preco: '1.15', versao: 2, edicaoPadraoId: 'nft-001-1-50' })

    // Mais cara que a ABERTA (1.20), a 1/50 deixa de ser a edição padrão do card.
    banco.alterar((db) => {
      db.nfts[0]!.edicoes.find((e) => e.rotulo === '1/50')!.preco = '1.29'
      db.nfts[0]!.versao += 1
    })
    const depois = PaginaCatalogoSchema.parse(await (await chamar('/nfts')).json())
    expect(depois.itens[0]).toMatchObject({ preco: '1.2', edicaoPadraoId: 'nft-001-aberta' })
  })
})
