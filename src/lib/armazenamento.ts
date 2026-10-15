export interface Armazenamento {
  getItem(chave: string): string | null
  setItem(chave: string, valor: string): void
  removeItem(chave: string): void
}

export function criarArmazenamentoMemoria(): Armazenamento {
  const dados = new Map<string, string>()
  return {
    getItem: (chave) => dados.get(chave) ?? null,
    setItem: (chave, valor) => void dados.set(chave, valor),
    removeItem: (chave) => void dados.delete(chave),
  }
}

export function armazenamentoPadrao(): Armazenamento {
  try {
    if (typeof window !== 'undefined' && window.localStorage) return window.localStorage
  } catch {
    // localStorage bloqueado (modo privado, política do navegador): segue só em memória.
  }
  return criarArmazenamentoMemoria()
}
