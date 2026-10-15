import { z } from 'zod'
import { ehEthValido } from '@/utils/eth'

export const IdSchema = z.string().min(1)
export const DataHoraSchema = z.iso.datetime()

/** ETH sempre como string decimal (até 18 casas); aritmética só via utils/eth. */
export const EthSchema = z.string().refine(ehEthValido, 'Valor em ETH inválido')

export const QuantidadeSchema = z.int('A quantidade deve ser um número inteiro').min(1, 'A quantidade mínima é 1')

export const RedeSchema = z.enum(['ethereum', 'polygon', 'solana'])
export type Rede = z.infer<typeof RedeSchema>

/** Redes aceitas no pagamento e nas carteiras (EVM, endereço 0x). */
export const RedePagamentoSchema = z.enum(['ethereum', 'polygon'])
export type RedePagamento = z.infer<typeof RedePagamentoSchema>

export const NomeEnsSchema = z.object({
  nome: z
    .string()
    .trim()
    .min(3, 'O nome ENS deve ter pelo menos 3 caracteres')
    .max(63)
    .regex(/^[a-z0-9-]+$/, 'Use apenas letras minúsculas, números e hífen'),
  sufixo: z.literal('.eth'),
})
export type NomeEns = z.infer<typeof NomeEnsSchema>

export const CodigoErroSchema = z.enum([
  'VALIDACAO',
  'SESSAO_INVALIDA',
  'SEM_PERMISSAO',
  'NAO_ENCONTRADO',
  'CONFLITO',
  'CONFLITO_DISPONIBILIDADE',
  'CUPOM_INVALIDO',
  'CUPOM_EXPIRADO',
  'IDEMPOTENCIA_CONFLITO',
  'FALHA_TRANSITORIA',
])
export type CodigoErro = z.infer<typeof CodigoErroSchema>

/** Corpo de toda resposta de erro da API. A interface decide pelo `codigo`, nunca pelo texto. */
export const ErroApiSchema = z.object({
  erro: z.object({
    codigo: CodigoErroSchema,
    mensagem: z.string(),
    /** Erros por campo do formulário: nome do campo → mensagem. */
    campos: z.record(z.string(), z.string()).optional(),
  }),
})
export type ErroApi = z.infer<typeof ErroApiSchema>

export function paginado<T extends z.ZodType>(item: T) {
  return z.object({
    itens: z.array(item),
    pagina: z.int().min(1),
    porPagina: z.int().min(1),
    total: z.int().min(0),
    totalPaginas: z.int().min(0),
  })
}
