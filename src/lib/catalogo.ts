import { FiltrosCatalogoSchema, type Categoria, type FiltrosCatalogo, type Rede } from '@/types'

export const ROTULOS_CATEGORIA: Record<Categoria, string> = {
  'arte-digital': 'Arte digital',
  fotografia: 'Fotografia',
  musica: 'Música',
  'arte-3d': 'Arte 3D',
  colecionaveis: 'Colecionáveis',
  generativa: 'Generativa',
  jogos: 'Jogos',
  assinaturas: 'Assinaturas',
  utilidade: 'Utilidade',
}

export const ROTULOS_REDE: Record<Rede, string> = { ethereum: 'Ethereum', polygon: 'Polygon', solana: 'Solana' }

export const ROTULOS_ORDENACAO: Record<FiltrosCatalogo['ordenacao'], string> = {
  recentes: 'Listados recentemente',
  'preco-asc': 'Menor preço',
  'preco-desc': 'Maior preço',
  avaliacao: 'Mais bem avaliados',
}

export const FILTROS_PADRAO: FiltrosCatalogo = FiltrosCatalogoSchema.parse({})

/** Faixa do slider de preço, em centavos de ETH (0.02 a 12.30, como no Figma). */
export const FAIXA_PRECO_CENTAVOS = [2, 1230] as const

/** "1.25" → 125, sem passar por float. Casas além da segunda são descartadas (o slider anda de 0.01). */
export function ethParaCentavos(valor: string): number {
  const [inteiro = '0', decimais = ''] = valor.split('.')
  return Number(inteiro) * 100 + Number(decimais.padEnd(2, '0').slice(0, 2))
}

/** 125 → "1.25". */
export function centavosParaEth(centavos: number): string {
  return `${Math.floor(centavos / 100)}.${String(centavos % 100).padStart(2, '0')}`
}

/**
 * Parâmetros da URL → filtros válidos. Parâmetro inválido (colado à mão, link velho) não derruba a
 * tela: só ele é descartado e o resto da busca é mantido.
 */
export function filtrosDaUrl(bruto: Record<string, unknown>): FiltrosCatalogo {
  const tentativa = { ...bruto }
  for (let i = 0; i < 10; i++) {
    const resultado = FiltrosCatalogoSchema.safeParse(tentativa)
    if (resultado.success) return resultado.data
    for (const problema of resultado.error.issues) delete tentativa[String(problema.path[0])]
  }
  return FILTROS_PADRAO
}
