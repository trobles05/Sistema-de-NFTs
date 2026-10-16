import { useQuery } from '@tanstack/react-query'
import { servicoCatalogo } from '@/services/catalogo'

export const chaveNft = (id: string) => ['catalogo', 'nft', id] as const

export function useNft(id: string) {
  return useQuery({ queryKey: chaveNft(id), queryFn: ({ signal }) => servicoCatalogo.detalhe(id, signal) })
}
