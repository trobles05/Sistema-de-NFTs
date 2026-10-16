import { createFileRoute } from '@tanstack/react-router'
import { PaginaInicio } from '@/components/catalogo/PaginaInicio'

export const Route = createFileRoute('/_loja/')({
  staticData: { secao: 'inicio', divisor: true, barraAbas: true },
  component: PaginaInicio,
})
