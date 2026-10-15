import DecimalBase from 'decimal.js-light'

/** Valor em ETH como string decimal: só dígitos e ponto, até 18 casas (wei). Ex.: "1.19". */
export type EthString = string

const CASAS_WEI = 18
const FORMATO_ETH = /^\d+(\.\d{1,18})?$/

// Precisão própria: o padrão da lib (20 dígitos significativos) cortaria valores com 18 casas.
const Decimal = DecimalBase.clone({ precision: 40, rounding: DecimalBase.ROUND_HALF_UP })
type Decimal = InstanceType<typeof Decimal>

export function ehEthValido(valor: unknown): valor is EthString {
  return typeof valor === 'string' && FORMATO_ETH.test(valor)
}

function paraDecimal(valor: EthString): Decimal {
  if (!ehEthValido(valor)) {
    throw new TypeError(`Valor em ETH inválido: "${String(valor)}"`)
  }
  return new Decimal(valor)
}

function paraEthString(valor: Decimal): EthString {
  if (valor.isNegative() && !valor.isZero()) {
    throw new RangeError(`Resultado negativo em ETH: ${valor.toFixed()}`)
  }
  const fixo = valor.toDecimalPlaces(CASAS_WEI).toFixed(CASAS_WEI)
  return fixo.replace(/\.?0+$/, '')
}

export function somarEth(...valores: EthString[]): EthString {
  return paraEthString(valores.reduce((total, v) => total.plus(paraDecimal(v)), new Decimal(0)))
}

export function subtrairEth(a: EthString, b: EthString): EthString {
  return paraEthString(paraDecimal(a).minus(paraDecimal(b)))
}

export function multiplicarEth(preco: EthString, quantidade: number): EthString {
  if (!Number.isSafeInteger(quantidade) || quantidade < 0) {
    throw new RangeError(`Quantidade deve ser inteira e não negativa: ${quantidade}`)
  }
  return paraEthString(paraDecimal(preco).times(quantidade))
}

/** Aplica um percentual (ex.: 10 = 10%) sobre o valor, arredondado em 18 casas. */
export function percentualEth(valor: EthString, percentual: number): EthString {
  if (!Number.isFinite(percentual) || percentual < 0 || percentual > 100) {
    throw new RangeError(`Percentual deve estar entre 0 e 100: ${percentual}`)
  }
  return paraEthString(paraDecimal(valor).times(percentual).dividedBy(100))
}

export function compararEth(a: EthString, b: EthString): -1 | 0 | 1 {
  return paraDecimal(a).cmp(paraDecimal(b))
}

/** Exibição: no mínimo 2 casas, sem zeros sobrando além disso. Ex.: "2" → "2.00", "26.8460" → "26.846". */
export function formatarEth(valor: EthString): string {
  const [inteiro, decimais = ''] = paraEthString(paraDecimal(valor)).split('.')
  return `${inteiro}.${decimais.padEnd(2, '0')}`
}
