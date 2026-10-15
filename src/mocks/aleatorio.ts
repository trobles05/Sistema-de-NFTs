/** Gerador pseudoaleatório com semente fixa (mulberry32): mesma sequência em toda execução. */
export function criarSorteio(semente: number) {
  let estado = semente
  const proximo = () => {
    estado = (estado + 0x6d2b79f5) | 0
    let t = Math.imul(estado ^ (estado >>> 15), 1 | estado)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
  return {
    inteiro: (min: number, max: number) => min + Math.floor(proximo() * (max - min + 1)),
    item: <T,>(lista: readonly T[]): T => lista[Math.floor(proximo() * lista.length)] as T,
    chance: (probabilidade: number) => proximo() < probabilidade,
    hex: (tamanho: number) => Array.from({ length: tamanho }, () => Math.floor(proximo() * 16).toString(16)).join(''),
  }
}

export type Sorteio = ReturnType<typeof criarSorteio>
