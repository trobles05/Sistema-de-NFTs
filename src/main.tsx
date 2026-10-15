import { QueryClientProvider } from '@tanstack/react-query'
import { createRouter, RouterProvider } from '@tanstack/react-router'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@/assets/css/index.css'
import { queryClient } from '@/lib/queryClient'
import { routeTree } from './routeTree.gen'

const router = createRouter({
  routeTree,
  context: { queryClient },
  defaultPreload: 'intent',
  scrollRestoration: true,
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

async function iniciar() {
  // Com VITE_API_MOCKS diferente de "true", o código dos mocks nem entra no bundle.
  if (import.meta.env.VITE_API_MOCKS === 'true') {
    const { iniciarMocks } = await import('@/mocks/iniciar')
    await iniciarMocks()
  }

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </StrictMode>,
  )
}

void iniciar()
