export interface CupomFixture {
  codigo: string
  percentual: number
  /** ISO; `null` = sem validade. O "agora" vem de quem consulta, para os testes controlarem o relógio. */
  validoAte: string | null
}

/** Código fora desta lista responde CUPOM_INVALIDO; com validade passada, CUPOM_EXPIRADO. */
export const CUPONS: readonly CupomFixture[] = [
  { codigo: 'KURIO10', percentual: 10, validoAte: null },
  { codigo: 'LANCAMENTO5', percentual: 5, validoAte: '2027-12-31T23:59:59.000Z' },
  { codigo: 'EXPIRADO20', percentual: 20, validoAte: '2026-01-01T00:00:00.000Z' },
]
