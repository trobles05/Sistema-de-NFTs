/** Controles expostos por src/mocks/iniciar.ts, usados dentro de page.evaluate. */
interface Window {
  __kurioMocks?: {
    cenario(): string
    cenarios: readonly string[]
    definirCenario(nome: string): string
    resetar(): void
  }
}
