import { worker } from './browser'
import { estadoCenario, NOMES_CENARIO, type NomeCenario } from './cenarios'
import { banco } from './db'

/** Controles do servidor simulado, para testes Playwright e para quem avalia (console do navegador). */
export interface ControlesMocks {
  cenario(): NomeCenario
  cenarios: readonly NomeCenario[]
  definirCenario(nome: string): NomeCenario
  resetar(): void
}

declare global {
  interface Window {
    __kurioMocks?: ControlesMocks
  }
}

function resetar() {
  banco.resetar()
  estadoCenario.reiniciarContadores()
}

export async function iniciarMocks() {
  const url = new URL(window.location.href)
  const { resetar: pediuReset } = estadoCenario.selecionarPelaUrl(url)
  if (pediuReset) resetar()

  // Tira os parâmetros já aplicados, para um refresh não resetar de novo.
  if (url.searchParams.has('cenario') || url.searchParams.has('reset-mocks')) {
    url.searchParams.delete('cenario')
    url.searchParams.delete('reset-mocks')
    window.history.replaceState(window.history.state, '', url)
  }

  window.__kurioMocks = {
    cenario: () => estadoCenario.cenarioAtual().nome,
    cenarios: NOMES_CENARIO,
    definirCenario: (nome) => estadoCenario.definirCenario(nome).nome,
    resetar,
  }

  await worker.start({
    serviceWorker: { url: `${import.meta.env.BASE_URL}mockServiceWorker.js` },
    quiet: !import.meta.env.DEV,
    onUnhandledRequest(requisicao, print) {
      // Assets, fontes e o próprio Vite passam direto; só /api sem handler merece aviso.
      if (new URL(requisicao.url).pathname.startsWith('/api/')) print.warning()
    },
  })
}
