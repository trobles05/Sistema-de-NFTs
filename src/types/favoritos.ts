import { z } from 'zod'
import { IdSchema } from './comum'

/** Resposta de GET /api/favoritos e das mutations PUT/DELETE /api/favoritos/:nftId. */
export const ListaFavoritosSchema = z.object({
  nftIds: z.array(IdSchema),
})
export type ListaFavoritos = z.infer<typeof ListaFavoritosSchema>
