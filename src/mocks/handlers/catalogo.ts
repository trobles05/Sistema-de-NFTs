import { http, HttpResponse } from 'msw'
import { FiltrosCatalogoSchema, type Destaques, type Nft, type PaginaCatalogo } from '@/types'
import { estadoCenario } from '../cenarios'
import { consultarCatalogo, destaques } from '../catalogo'
import { banco } from '../db'
import { camposDoErro, responderErro } from './respostas'

/** Catálogo visível: vazio no cenário "catalogo-vazio". */
function catalogo(): readonly Nft[] {
  return estadoCenario.cenarioAtual().flags.catalogoVazio ? [] : banco.ler().nfts
}

/** Listas chegam repetindo a chave (`categorias=musica&categorias=jogos`); ausentes ficam `undefined`. */
function lerFiltros(url: URL) {
  const p = url.searchParams
  const lista = (chave: string) => (p.getAll(chave).length ? p.getAll(chave) : undefined)
  const valor = (chave: string) => p.get(chave) ?? undefined
  return FiltrosCatalogoSchema.safeParse({
    busca: valor('busca'),
    categorias: lista('categorias'),
    redes: lista('redes'),
    precoMin: valor('precoMin'),
    precoMax: valor('precoMax'),
    aba: valor('aba'),
    ordenacao: valor('ordenacao'),
    pagina: valor('pagina'),
  })
}

export const handlersCatalogo = [
  http.get('*/api/nfts', ({ request }) => {
    const filtros = lerFiltros(new URL(request.url))
    if (!filtros.success) return responderErro(400, 'VALIDACAO', 'Parâmetros de busca inválidos.', camposDoErro(filtros.error))
    return HttpResponse.json<PaginaCatalogo>(consultarCatalogo(catalogo(), filtros.data))
  }),

  // Antes de "/api/nfts/:id", senão "destaques" seria lido como id.
  http.get('*/api/nfts/destaques', () => HttpResponse.json<Destaques>({ itens: destaques(catalogo()) })),

  http.get('*/api/nfts/:id', ({ params }) => {
    const nft = catalogo().find((item) => item.id === params.id)
    if (!nft) return responderErro(404, 'NAO_ENCONTRADO', 'Este NFT não existe ou foi removido.')
    return HttpResponse.json<Nft>(nft)
  }),
]
