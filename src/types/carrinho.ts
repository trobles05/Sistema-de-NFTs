import { z } from 'zod'
import { DataHoraSchema, EthSchema, IdSchema, QuantidadeSchema } from './comum'
import { ImagemNftSchema, RotuloEdicaoSchema } from './nft'

export const AdicionarItemEntradaSchema = z.object({
  nftId: IdSchema,
  edicaoId: IdSchema,
  quantidade: QuantidadeSchema,
})
export type AdicionarItemEntrada = z.infer<typeof AdicionarItemEntradaSchema>

export const AlterarItemEntradaSchema = z.object({
  quantidade: QuantidadeSchema,
})
export type AlterarItemEntrada = z.infer<typeof AlterarItemEntradaSchema>

/** Itens do visitante enviados ao autenticar, para mesclar com o carrinho da conta. */
export const MesclarCarrinhoEntradaSchema = z.object({
  itens: z.array(AdicionarItemEntradaSchema),
})
export type MesclarCarrinhoEntrada = z.infer<typeof MesclarCarrinhoEntradaSchema>

export const ItemCarrinhoSchema = z.object({
  id: IdSchema,
  nftId: IdSchema,
  edicaoId: IdSchema,
  nome: z.string(),
  tokenId: z.string(),
  imagem: ImagemNftSchema,
  rotuloEdicao: RotuloEdicaoSchema,
  precoUnitario: EthSchema,
  quantidade: QuantidadeSchema,
  disponivel: z.int().min(0),
  limitePorPedido: z.int().min(1),
  subtotal: EthSchema,
})
export type ItemCarrinho = z.infer<typeof ItemCarrinhoSchema>

export const CarrinhoSchema = z.object({
  itens: z.array(ItemCarrinhoSchema),
  quantidadeTotal: z.int().min(0),
  subtotal: EthSchema,
  versao: z.int().min(0),
  atualizadoEm: DataHoraSchema,
})
export type Carrinho = z.infer<typeof CarrinhoSchema>
