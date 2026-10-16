import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { obterSessao } from '@/lib/sessao'

/**
 * Rotas que exigem autenticação (§3): sem sessão, vai para o login guardando o caminho de volta.
 * A validade real do token é conferida pela API; um 401 derruba a sessão (T-008/T-034).
 */
export const Route = createFileRoute('/_loja/_privado')({
  beforeLoad: ({ location }) => {
    if (!obterSessao()) throw redirect({ to: '/entrar', search: { redirect: location.href } })
  },
  component: Outlet,
})
