import { http, lerDados } from '@/lib/http'
import { DestaquesSchema, NftSchema, PaginaCatalogoSchema, type FiltrosCatalogo } from '@/types'

export const servicoCatalogo = {
  listar: (filtros: FiltrosCatalogo, signal?: AbortSignal) => lerDados(PaginaCatalogoSchema, http.get('/nfts', { params: filtros, signal })),
  destaques: (signal?: AbortSignal) => lerDados(DestaquesSchema, http.get('/nfts/destaques', { signal })),
  detalhe: (id: string, signal?: AbortSignal) => lerDados(NftSchema, http.get(`/nfts/${encodeURIComponent(id)}`, { signal })),
}
