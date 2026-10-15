import { z } from 'zod'
import { DataHoraSchema, EthSchema, IdSchema } from './comum'
import { StatusPedidoSchema, TransacaoSchema } from './pedidos'

/** Nomes definidos no enunciado (§7). */
export const EVENTOS = {
  nftAtualizado: 'nft.updated',
  pedidoAtualizado: 'order.updated',
} as const

/**
 * `id` identifica o evento (descarta duplicatas); `versao` é a do recurso afetado
 * (descarta eventos antigos sem regredir estado).
 */
const EnvelopeBase = z.object({
  id: z.uuid(),
  versao: z.int().min(1),
  ocorridoEm: DataHoraSchema,
})

export const NftAtualizadoEventoSchema = EnvelopeBase.extend({
  tipo: z.literal(EVENTOS.nftAtualizado),
  recurso: z.object({ tipo: z.literal('nft'), id: IdSchema }),
  dados: z.object({
    edicoes: z
      .array(
        z.object({
          id: IdSchema,
          preco: EthSchema,
          precoAnterior: EthSchema.nullable(),
          disponivel: z.int().min(0),
        }),
      )
      .min(1),
  }),
})
export type NftAtualizadoEvento = z.infer<typeof NftAtualizadoEventoSchema>

/** Evento privado: o cliente descarta se `usuarioId` não for o da sessão atual. */
export const PedidoAtualizadoEventoSchema = EnvelopeBase.extend({
  tipo: z.literal(EVENTOS.pedidoAtualizado),
  recurso: z.object({ tipo: z.literal('pedido'), id: IdSchema }),
  usuarioId: IdSchema,
  dados: z.object({
    status: StatusPedidoSchema,
    transacao: TransacaoSchema.nullable(),
    motivoRecusa: z.string().nullable(),
  }),
})
export type PedidoAtualizadoEvento = z.infer<typeof PedidoAtualizadoEventoSchema>

export const EventoSchema = z.discriminatedUnion('tipo', [NftAtualizadoEventoSchema, PedidoAtualizadoEventoSchema])
export type Evento = z.infer<typeof EventoSchema>
