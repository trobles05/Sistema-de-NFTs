interface ImportMetaEnv {
  /** "true" liga o servidor simulado (MSW) no navegador. */
  readonly VITE_API_MOCKS?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
