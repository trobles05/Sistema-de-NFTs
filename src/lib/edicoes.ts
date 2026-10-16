import type { Edicao, Nft } from '@/types'
import { compararEth } from '@/utils/eth'

/** Edição padrão: a mais barata com estoque; se todas esgotaram, a mais barata. Mesma regra da API. */
export function edicaoPadraoDe(nft: Pick<Nft, 'edicoes'>): Edicao {
  const porPreco = [...nft.edicoes].sort((a, b) => compararEth(a.preco, b.preco))
  return porPreco.find((edicao) => edicao.disponivel > 0) ?? porPreco[0]!
}
