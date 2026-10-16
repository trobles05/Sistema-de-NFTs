import { describe, expect, it } from 'vitest'
import { centavosParaEth, ethParaCentavos, filtrosDaUrl } from './catalogo'

describe('conversão de preço do slider (sem float)', () => {
  it('ida e volta entre ETH decimal e centavos', () => {
    expect(ethParaCentavos('12.30')).toBe(1230)
    expect(ethParaCentavos('0.02')).toBe(2)
    expect(ethParaCentavos('1.5')).toBe(150)
    expect(ethParaCentavos('3')).toBe(300)
    expect(centavosParaEth(1230)).toBe('12.30')
    expect(centavosParaEth(2)).toBe('0.02')
  })
})

describe('filtrosDaUrl', () => {
  it('mantém os parâmetros válidos e descarta só o inválido', () => {
    expect(filtrosDaUrl({ busca: 'ape', categorias: ['musica', 'pintura'], pagina: '2' })).toEqual({
      busca: 'ape',
      aba: 'todos',
      ordenacao: 'recentes',
      pagina: 2,
    })
    expect(filtrosDaUrl({ pagina: '0', ordenacao: 'preco-asc' })).toMatchObject({ pagina: 1, ordenacao: 'preco-asc' })
    expect(filtrosDaUrl({ precoMin: '12.30', precoMax: '0.02' })).toMatchObject({ aba: 'todos' })
  })
})
