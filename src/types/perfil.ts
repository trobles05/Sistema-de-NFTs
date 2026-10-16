import { z } from 'zod'
import { NomeEnsSchema } from './comum'
import { EmailSchema, NomeUsuarioSchema, SenhaSchema } from './sessao'

const NomeExibicaoSchema = z.string().trim().min(2, 'Informe o nome de exibição').max(50)
const ApelidoCarteiraSchema = z.string().trim().min(2, 'Informe o apelido da carteira').max(30)

export const PerfilSchema = z.object({
  nomeExibicao: NomeExibicaoSchema,
  nomeUsuario: NomeUsuarioSchema,
  email: EmailSchema,
  nomeEns: NomeEnsSchema,
  apelidoCarteira: ApelidoCarteiraSchema,
  avatarUrl: z.string().nullable(),
})
export type Perfil = z.infer<typeof PerfilSchema>

export const AtualizarPerfilEntradaSchema = PerfilSchema.omit({ avatarUrl: true })
export type AtualizarPerfilEntrada = z.infer<typeof AtualizarPerfilEntradaSchema>

const AVATAR_TAMANHO_MAXIMO = 2 * 1024 * 1024

/** Avatar enviado como data URL (png, jpeg ou webp), até ~2 MB. `null` remove o avatar. */
export const AvatarEntradaSchema = z.object({
  imagem: z
    .string()
    .regex(/^data:image\/(png|jpeg|webp);base64,/, 'Use uma imagem PNG, JPEG ou WebP')
    .max(Math.ceil((AVATAR_TAMANHO_MAXIMO * 4) / 3) + 32, 'A imagem deve ter no máximo 2 MB')
    .nullable(),
})
export type AvatarEntrada = z.infer<typeof AvatarEntradaSchema>

export const AlterarSenhaEntradaSchema = z
  .object({
    senhaAtual: z.string().min(1, 'Informe a senha atual'),
    novaSenha: SenhaSchema,
    confirmarNovaSenha: z.string().min(1, 'Confirme a nova senha'),
  })
  .refine((d) => d.novaSenha === d.confirmarNovaSenha, {
    message: 'As senhas não conferem',
    path: ['confirmarNovaSenha'],
  })
  .refine((d) => d.novaSenha !== d.senhaAtual, {
    message: 'A nova senha deve ser diferente da atual',
    path: ['novaSenha'],
  })
export type AlterarSenhaEntrada = z.infer<typeof AlterarSenhaEntradaSchema>
