import { z } from 'zod'
import { DataHoraSchema, IdSchema, NomeEnsSchema, RedePagamentoSchema } from './comum'
import { EmailSchema } from './sessao'

export const EnderecoCarteiraSchema = z
  .string()
  .trim()
  .regex(/^0x[0-9a-fA-F]{40}$/, 'O endereço deve começar com 0x e ter 40 caracteres hexadecimais')

export const TipoCarteiraSchema = z.enum(['metamask', 'walletconnect', 'coinbase'])
export type TipoCarteira = z.infer<typeof TipoCarteiraSchema>

export const PapelCarteiraSchema = z.enum(['principal', 'secundaria'])
export type PapelCarteira = z.infer<typeof PapelCarteiraSchema>

/** Campos do formulário de carteira do Figma (Desktop / Carteiras). */
export const CarteiraEntradaSchema = z.object({
  nomeExibicao: z.string().trim().min(2, 'Informe o nome de exibição').max(50),
  apelido: z.string().trim().min(2, 'Informe o apelido da carteira').max(30),
  rede: RedePagamentoSchema,
  nomePerfil: z.string().trim().min(2, 'Informe o nome do perfil').max(50),
  endereco: EnderecoCarteiraSchema,
  /** "ENS ou carteira secundária (opcional)". */
  enderecoAlternativo: z.string().trim().max(100).optional(),
  tipoCarteira: TipoCarteiraSchema,
  codigoIndicacao: z.string().trim().min(1, 'Informe o código de indicação').max(30),
  email: EmailSchema,
  nomeEns: NomeEnsSchema,
})
export type CarteiraEntrada = z.infer<typeof CarteiraEntradaSchema>

export const CarteiraSchema = CarteiraEntradaSchema.extend({
  id: IdSchema,
  papel: PapelCarteiraSchema,
  atualizadaEm: DataHoraSchema,
})
export type Carteira = z.infer<typeof CarteiraSchema>

export const CriarCarteiraEntradaSchema = CarteiraEntradaSchema.extend({ papel: PapelCarteiraSchema })
export type CriarCarteiraEntrada = z.infer<typeof CriarCarteiraEntradaSchema>

export const AtualizarCarteiraEntradaSchema = CarteiraEntradaSchema.partial()
export type AtualizarCarteiraEntrada = z.infer<typeof AtualizarCarteiraEntradaSchema>

export const ListaCarteirasSchema = z.object({
  principal: CarteiraSchema.nullable(),
  secundaria: CarteiraSchema.nullable(),
})
export type ListaCarteiras = z.infer<typeof ListaCarteirasSchema>
