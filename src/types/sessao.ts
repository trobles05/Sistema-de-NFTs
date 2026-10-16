import { z } from 'zod'
import { DataHoraSchema, IdSchema } from './comum'

export const EmailSchema = z.email('Informe um e-mail válido')

export const SenhaSchema = z
  .string()
  .min(8, 'A senha deve ter pelo menos 8 caracteres')
  .max(72, 'A senha deve ter no máximo 72 caracteres')

export const NomeUsuarioSchema = z
  .string()
  .trim()
  .min(3, 'O nome de usuário deve ter pelo menos 3 caracteres')
  .max(30, 'O nome de usuário deve ter no máximo 30 caracteres')
  .regex(/^[a-zA-Z0-9_.]+$/, 'Use apenas letras, números, ponto e sublinhado')

export const UsuarioSchema = z.object({
  id: IdSchema,
  nomeUsuario: NomeUsuarioSchema,
  nomeExibicao: z.string(),
  email: EmailSchema,
  avatarUrl: z.string().nullable(),
})
export type Usuario = z.infer<typeof UsuarioSchema>

export const CadastroEntradaSchema = z
  .object({
    nomeUsuario: NomeUsuarioSchema,
    email: EmailSchema,
    senha: SenhaSchema,
    confirmarSenha: z.string().min(1, 'Confirme a senha'),
  })
  .refine((d) => d.senha === d.confirmarSenha, {
    message: 'As senhas não conferem',
    path: ['confirmarSenha'],
  })
export type CadastroEntrada = z.infer<typeof CadastroEntradaSchema>

export const LoginEntradaSchema = z.object({
  email: EmailSchema,
  senha: z.string().min(1, 'Informe a senha'),
})
export type LoginEntrada = z.infer<typeof LoginEntradaSchema>

/** Resposta de login/cadastro/consulta de sessão. O token vai no cabeçalho `Authorization: Bearer`. */
export const SessaoSchema = z.object({
  token: z.string().min(1),
  expiraEm: DataHoraSchema,
  usuario: UsuarioSchema,
})
export type Sessao = z.infer<typeof SessaoSchema>
