import type { RedePagamento } from '@/types'
import type { EthString } from '@/utils/eth'

/** Taxa de rede estimada por pedido. Ethereum = valor do Figma. */
export const TAXAS_REDE: Readonly<Record<RedePagamento, EthString>> = {
  ethereum: '0.016',
  polygon: '0.002',
}
