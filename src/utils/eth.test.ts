import { describe, expect, it } from 'vitest'
import {
  compararEth,
  ehEthValido,
  formatarEth,
  multiplicarEth,
  percentualEth,
  somarEth,
  subtrairEth,
} from './eth'

describe('ehEthValido', () => {
  it('aceita decimais com ponto e até 18 casas', () => {
    expect(ehEthValido('1.19')).toBe(true)
    expect(ehEthValido('0')).toBe(true)
    expect(ehEthValido('0.000000000000000001')).toBe(true)
  })

  it('rejeita vírgula, sinal, notação científica, mais de 18 casas e não-strings', () => {
    for (const invalido of ['1,19', '-1', '1e-6', '.5', '1.', '0.0000000000000000001', '', 'abc', 1.19, null]) {
      expect(ehEthValido(invalido)).toBe(false)
    }
  })
})

describe('somarEth', () => {
  it('não sofre erro de ponto flutuante', () => {
    expect(somarEth('0.1', '0.2')).toBe('0.3')
  })

  it('bate com o subtotal e o total do carrinho desktop do Figma', () => {
    const subtotal = somarEth('2.38', '8.34', '16.11')
    expect(subtotal).toBe('26.83')
    expect(somarEth(subtotal, '0.016')).toBe('26.846')
  })

  it('mantém as 18 casas e valores grandes sem notação científica', () => {
    expect(somarEth('0.000000000000000001', '0.000000000000000002')).toBe('0.000000000000000003')
    expect(somarEth('123456789.123456789123456789', '0.000000000000000001')).toBe('123456789.12345678912345679')
    expect(somarEth()).toBe('0')
  })
})

describe('multiplicarEth', () => {
  it('multiplica preço por quantidade como no Figma', () => {
    expect(multiplicarEth('1.19', 2)).toBe('2.38')
    expect(multiplicarEth('1.39', 6)).toBe('8.34')
    expect(multiplicarEth('1.79', 9)).toBe('16.11')
    expect(multiplicarEth('1.19', 0)).toBe('0')
  })

  it('exige quantidade inteira e não negativa', () => {
    expect(() => multiplicarEth('1.19', 1.5)).toThrow(RangeError)
    expect(() => multiplicarEth('1.19', -1)).toThrow(RangeError)
    expect(() => multiplicarEth('1.19', Number.NaN)).toThrow(RangeError)
  })
})

describe('subtrairEth e percentualEth', () => {
  it('aplica desconto percentual e subtrai do subtotal', () => {
    const desconto = percentualEth('26.83', 10)
    expect(desconto).toBe('2.683')
    expect(subtrairEth('26.83', desconto)).toBe('24.147')
  })

  it('arredonda o percentual em 18 casas', () => {
    expect(percentualEth('0.000000000000000001', 50)).toBe('0.000000000000000001')
  })

  it('recusa resultado negativo e percentual fora de 0..100', () => {
    expect(() => subtrairEth('1', '2')).toThrow(RangeError)
    expect(() => percentualEth('1', 101)).toThrow(RangeError)
  })
})

describe('compararEth', () => {
  it('compara pelo valor, não pelo texto', () => {
    expect(compararEth('10.0', '9.99')).toBe(1)
    expect(compararEth('1.190', '1.19')).toBe(0)
    expect(compararEth('0.39', '1.29')).toBe(-1)
  })
})

describe('formatarEth', () => {
  it('exibe no mínimo 2 casas, como no Figma', () => {
    expect(formatarEth('1.19')).toBe('1.19')
    expect(formatarEth('26.846')).toBe('26.846')
    expect(formatarEth('0.016')).toBe('0.016')
    expect(formatarEth('2')).toBe('2.00')
    expect(formatarEth('1.5000')).toBe('1.50')
  })

  it('recusa valor inválido em vez de exibir NaN', () => {
    expect(() => formatarEth('1,19')).toThrow(TypeError)
  })
})
