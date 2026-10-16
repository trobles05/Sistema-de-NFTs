import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { PaginaAutenticacao } from '@/components/conta/PaginaAutenticacao'

export const Route = createFileRoute('/_loja/entrar')({
  validateSearch: z.object({ redirect: z.string().optional() }),
  staticData: { secao: 'inicio', divisor: true, barraAbas: false, telaCheiaMobile: true },
  component: function Pagina() {
    const { redirect } = Route.useSearch()
    return <PaginaAutenticacao modo="entrar" redirect={redirect} />
  },
})
