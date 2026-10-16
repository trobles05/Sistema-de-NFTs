import { createFileRoute, redirect } from '@tanstack/react-router'
import { z } from 'zod'
import { PaginaAutenticacao } from '@/components/conta/PaginaAutenticacao'
import { destinoSeguro } from '@/lib/redirecionamento'
import { obterSessao } from '@/lib/sessao'

export const Route = createFileRoute('/_loja/entrar')({
  validateSearch: z.object({ redirect: z.string().optional() }),
  // Já logado: não mostra o login, segue para o destino.
  beforeLoad: ({ search }) => {
    if (obterSessao()) throw redirect({ href: destinoSeguro(search.redirect) })
  },
  staticData: { secao: 'inicio', divisor: true, barraAbas: false, telaCheiaMobile: true },
  component: function Pagina() {
    const { redirect } = Route.useSearch()
    return <PaginaAutenticacao modo="entrar" redirect={redirect} />
  },
})
