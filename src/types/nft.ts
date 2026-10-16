import { z } from 'zod'
import { compararEth } from '@/utils/eth'
import { DataHoraSchema, EthSchema, IdSchema, paginado, RedeSchema } from './comum'

export const CategoriaSchema = z.enum([
  'arte-digital',
  'fotografia',
  'musica',
  'arte-3d',
  'colecionaveis',
  'generativa',
  'jogos',
  'assinaturas',
  'utilidade',
])
export type Categoria = z.infer<typeof CategoriaSchema>

/** Chave da arte em src/assets/images/nfts (o catálogo reaproveita as 4 artes do Figma). */
export const ImagemNftSchema = z.enum(['ape-green-jacket', 'nomad-bucket-hat', 'baron-turtleneck', 'golden-headphones'])
export type ImagemNft = z.infer<typeof ImagemNftSchema>

export const RotuloEdicaoSchema = z.enum(['1/1', '1/10', '1/50', 'ABERTA'])
export type RotuloEdicao = z.infer<typeof RotuloEdicaoSchema>

/** Cada edição tem preço e estoque próprios. `disponivel` 0 = edição esgotada/indisponível. */
export const EdicaoSchema = z.object({
  id: IdSchema,
  rotulo: RotuloEdicaoSchema,
  preco: EthSchema,
  precoAnterior: EthSchema.nullable(),
  disponivel: z.int().min(0),
  limitePorPedido: z.int().min(1),
})
export type Edicao = z.infer<typeof EdicaoSchema>

export const NftSchema = z.object({
  id: IdSchema,
  nome: z.string(),
  tokenId: z.string(),
  colecao: z.string(),
  categoria: CategoriaSchema,
  rede: RedeSchema,
  imagem: ImagemNftSchema,
  descricao: z.string(),
  detalhes: z.array(z.string()),
  atributos: z.array(z.string()),
  contrato: z.object({
    endereco: z.string(),
    padrao: z.string(),
    royaltyPercentual: z.number().min(0).max(100),
  }),
  avaliacao: z.object({ media: z.number().min(0).max(5), total: z.int().min(0) }),
  raro: z.boolean(),
  emAlta: z.boolean(),
  lancadoEm: DataHoraSchema,
  edicoes: z.array(EdicaoSchema).min(1),
  /** Cresce a cada alteração; eventos com versão menor ou igual são descartados. */
  versao: z.int().min(1),
})
export type Nft = z.infer<typeof NftSchema>

/** Card do catálogo: o preço exibido é o da edição padrão (a mais acessível com estoque). */
export const NftResumoSchema = NftSchema.pick({
  id: true,
  nome: true,
  imagem: true,
  categoria: true,
  rede: true,
  raro: true,
  versao: true,
}).extend({
  edicaoPadraoId: IdSchema,
  preco: EthSchema,
  precoAnterior: EthSchema.nullable(),
  esgotado: z.boolean(),
})
export type NftResumo = z.infer<typeof NftResumoSchema>

export const AbaCatalogoSchema = z.enum(['todos', 'lancamentos', 'em-alta'])
export const OrdenacaoCatalogoSchema = z.enum(['recentes', 'preco-asc', 'preco-desc', 'avaliacao'])

/**
 * Parâmetros do catálogo. O mesmo schema valida a URL (TanStack Router) e a query da API,
 * por isso `pagina` aceita string e é convertida.
 */
export const FiltrosCatalogoSchema = z
  .object({
    busca: z.string().trim().max(100).optional(),
    categorias: z.array(CategoriaSchema).optional(),
    redes: z.array(RedeSchema).optional(),
    precoMin: EthSchema.optional(),
    precoMax: EthSchema.optional(),
    aba: AbaCatalogoSchema.default('todos'),
    ordenacao: OrdenacaoCatalogoSchema.default('recentes'),
    pagina: z.coerce.number().int().min(1).default(1),
  })
  .refine((f) => !f.precoMin || !f.precoMax || compararEth(f.precoMin, f.precoMax) <= 0, {
    message: 'O preço mínimo deve ser menor ou igual ao máximo',
    path: ['precoMin'],
  })
export type FiltrosCatalogo = z.infer<typeof FiltrosCatalogoSchema>

export const PaginaCatalogoSchema = paginado(NftResumoSchema).extend({
  /** Contagens para a sidebar de filtros (Coleções e Rede). */
  facetas: z.object({
    categorias: z.record(CategoriaSchema, z.int().min(0)),
    redes: z.record(RedeSchema, z.int().min(0)),
  }),
})
export type PaginaCatalogo = z.infer<typeof PaginaCatalogoSchema>

/** Resposta de GET /api/nfts/destaques (banner da Início). */
export const DestaquesSchema = z.object({
  itens: z.array(NftResumoSchema),
})
export type Destaques = z.infer<typeof DestaquesSchema>
