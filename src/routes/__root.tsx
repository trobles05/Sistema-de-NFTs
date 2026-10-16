import type { QueryClient } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { createRootRouteWithContext, Link, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { SincronizacaoSessao } from '@/components/conta/SincronizacaoSessao'
import { Avisos } from '@/components/ui/Avisos'

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  component: RootLayout,
  notFoundComponent: NotFound,
})

function RootLayout() {
  return (
    <>
      <Outlet />
      <Avisos />
      <SincronizacaoSessao />
      {import.meta.env.DEV && (
        <>
          <ReactQueryDevtools buttonPosition="bottom-left" />
          <TanStackRouterDevtools position="bottom-right" />
        </>
      )}
    </>
  )
}

function NotFound() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-[1200px] flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-f24 font-bold">Página não encontrada</h1>
      <Link to="/" className="text-f14 text-destaque underline-offset-4 hover:underline">
        Voltar para o início
      </Link>
    </main>
  )
}
