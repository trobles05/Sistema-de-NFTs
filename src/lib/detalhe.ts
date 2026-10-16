import type { Edicao, Nft } from '@/types'
import { edicaoPadraoDe } from './edicoes'

export interface SelecaoEdicao {
  edicao: Edicao
  /** Edição escolhida (pela URL) sem estoque: a compra fica bloqueada. */
  esgotada: boolean
}

/** Edição da URL se existir no NFT; senão a edição padrão (a mais barata com estoque, a mesma do card). */
export function selecionarEdicao(nft: Nft, edicaoId: string | undefined): SelecaoEdicao {
  const edicao = nft.edicoes.find((e) => e.id === edicaoId) ?? edicaoPadraoDe(nft)
  return { edicao, esgotada: edicao.disponivel === 0 }
}

/** Quantidade máxima: o menor entre o estoque e o limite por pedido (0 se esgotada). */
export function limiteQuantidade(edicao: Edicao): number {
  return Math.min(edicao.disponivel, edicao.limitePorPedido)
}

/** Explica o limite ao colecionador. */
export function motivoLimite(edicao: Edicao): string {
  if (edicao.disponivel === 0) return 'Esta edição está esgotada.'
  if (edicao.disponivel <= edicao.limitePorPedido) return edicao.disponivel === 1 ? 'Resta 1 unidade.' : `Restam ${edicao.disponivel} unidades.`
  return `Limite de ${edicao.limitePorPedido} por pedido.`
}
