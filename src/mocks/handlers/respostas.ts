import { HttpResponse } from 'msw'
import type { z } from 'zod'
import type { CodigoErro, ErroApi } from '@/types'

/** Tipada como `Response` para combinar com qualquer resposta de sucesso no mesmo handler. */
export function responderErro(status: number, codigo: CodigoErro, mensagem: string, campos?: Record<string, string>): Response {
  return HttpResponse.json<ErroApi>({ erro: { codigo, mensagem, ...(campos && { campos }) } }, { status })
}

/** Erros do zod viram `campos` (primeiro erro de cada campo), para o formulário mostrar no lugar certo. */
export function camposDoErro(erro: z.ZodError): Record<string, string> {
  const campos: Record<string, string> = {}
  for (const problema of erro.issues) {
    const campo = problema.path.join('.') || 'corpo'
    campos[campo] ??= problema.message
  }
  return campos
}

/**
 * Valida o corpo com o mesmo schema do formulário. Devolve os dados ou a resposta 400 pronta.
 * Uso: `const corpo = await validarCorpo(request, Schema); if (corpo instanceof Response) return corpo`.
 */
export async function validarCorpo<T>(request: Request, schema: z.ZodType<T>): Promise<T | Response> {
  const json: unknown = await request.json().catch(() => undefined)
  const resultado = schema.safeParse(json)
  if (resultado.success) return resultado.data
  return responderErro(400, 'VALIDACAO', 'Confira os dados informados.', camposDoErro(resultado.error))
}
