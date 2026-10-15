import { z } from 'zod'
import { DataHoraSchema, EthSchema, IdSchema, QuantidadeSchema, RedePagamentoSchema } from './comum'

/** A cotação é calculada sobre o carrinho atual da conta no servidor. */
export const CotacaoEntradaSchema = z.object({
  rede: RedePagamentoSchema,
  cupom: z.string().trim().toUpperCase().min(1).max(30).optional(),
})
export type CotacaoEntrada = z.infer<typeof CotacaoEntradaSchema>

export const ItemCotacaoSchema = z.object({
  itemId: IdSchema,
  nftId: IdSchema,
  edicaoId: IdSchema,
  nome: z.string(),
  precoUnitario: EthSchema,
  quantidade: QuantidadeSchema,
  subtotal: EthSchema,
})

/** Referência para finalizar o pedido: vencida ou com `carrinhoVersao` diferente exige nova cotação. */
export const CotacaoSchema = z.object({
  id: IdSchema,
  itens: z.array(ItemCotacaoSchema).min(1),
  subtotal: EthSchema,
  cupom: z.object({ codigo: z.string(), percentual: z.number().min(0).max(100) }).nullable(),
  desconto: EthSchema,
  taxaRede: EthSchema,
  total: EthSchema,
  rede: RedePagamentoSchema,
  carrinhoVersao: z.int().min(0),
  criadaEm: DataHoraSchema,
  expiraEm: DataHoraSchema,
})
export type Cotacao = z.infer<typeof CotacaoSchema>
