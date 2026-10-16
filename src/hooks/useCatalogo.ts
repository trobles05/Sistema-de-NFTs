import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { servicoCatalogo } from '@/services/catalogo'
import type { FiltrosCatalogo } from '@/types'

export const chavesCatalogo = {
  todas: ['catalogo'] as const,
  lista: (filtros: FiltrosCatalogo) => ['catalogo', 'lista', filtros] as const,
  destaques: ['catalogo', 'destaques'] as const,
}

/**
 * Uma entrada de cache por combinação de filtros: resposta atrasada de uma busca antiga cai na chave
 * dela e nunca sobrescreve a atual. Ao trocar de filtro, a lista anterior fica visível até a nova chegar.
 */
export function useCatalogo(filtros: FiltrosCatalogo) {
  return useQuery({
    queryKey: chavesCatalogo.lista(filtros),
    queryFn: ({ signal }) => servicoCatalogo.listar(filtros, signal),
    placeholderData: keepPreviousData,
  })
}

export function useDestaques() {
  return useQuery({ queryKey: chavesCatalogo.destaques, queryFn: ({ signal }) => servicoCatalogo.destaques(signal) })
}
