import { z } from 'zod'
import { DataHoraSchema, EthSchema, IdSchema, QuantidadeSchema, RedePagamentoSchema } from './comum'
import { CarteiraEntradaSchema, EnderecoCarteiraSchema, TipoCarteiraSchema } from './carteiras'
import { ImagemNftSchema, RotuloEdicaoSchema } from './nft'
import { NomeUsuarioSchema } from './sessao'

/** Cabeçalho obrigatório em POST /api/pedidos. Mesma chave + mesmo corpo = mesmo pedido; corpo diferente = 409. */
export const CABECALHO_IDEMPOTENCIA = 'Idempotency-Key'

/** Formulário "Perfil do colecionador" da tela de pagamento (Figma). */
export const DadosColecionadorSchema = CarteiraEntradaSchema.extend({
  nomeUsuario: NomeUsuarioSchema,
  observacao: z.string().trim().max(500, 'A observação deve ter no máximo 500 caracteres').optional(),
})
export type DadosColecionador = z.infer<typeof DadosColecionadorSchema>

export const CriarPedidoEntradaSchema = z.object({
  cotacaoId: IdSchema,
  carteiraId: IdSchema,
  dadosColecionador: DadosColecionadorSchema,
})
export type CriarPedidoEntrada = z.infer<typeof CriarPedidoEntradaSchema>

/** `confirmado` e `recusado` são terminais. */
export const StatusPedidoSchema = z.enum(['pendente', 'confirmado', 'recusado'])
export type StatusPedido = z.infer<typeof StatusPedidoSchema>

export const TransacaoSchema = z.object({
  hash: z.string().regex(/^0x[0-9a-f]{64}$/),
  explorerUrl: z.url(),
})
export type Transacao = z.infer<typeof TransacaoSchema>

export const ItemPedidoSchema = z.object({
  nftId: IdSchema,
  edicaoId: IdSchema,
  nome: z.string(),
  tokenId: z.string(),
  imagem: ImagemNftSchema,
  rotuloEdicao: RotuloEdicaoSchema,
  precoUnitario: EthSchema,
  quantidade: QuantidadeSchema,
  subtotal: EthSchema,
})
export type ItemPedido = z.infer<typeof ItemPedidoSchema>

/**
 * Itens, valores e carteira são um snapshot do momento da compra:
 * alterações posteriores no catálogo não mudam o recibo.
 */
export const PedidoSchema = z.object({
  id: IdSchema,
  status: StatusPedidoSchema,
  cotacaoId: IdSchema,
  itens: z.array(ItemPedidoSchema).min(1),
  subtotal: EthSchema,
  cupom: z.object({ codigo: z.string(), percentual: z.number().min(0).max(100) }).nullable(),
  desconto: EthSchema,
  taxaRede: EthSchema,
  total: EthSchema,
  rede: RedePagamentoSchema,
  carteira: z.object({
    id: IdSchema,
    tipoCarteira: TipoCarteiraSchema,
    endereco: EnderecoCarteiraSchema,
    apelido: z.string(),
  }),
  transacao: TransacaoSchema.nullable(),
  motivoRecusa: z.string().nullable(),
  criadoEm: DataHoraSchema,
  atualizadoEm: DataHoraSchema,
  versao: z.int().min(1),
})
export type Pedido = z.infer<typeof PedidoSchema>
