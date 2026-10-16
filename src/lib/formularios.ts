import type { FieldValues, Path, UseFormSetError } from 'react-hook-form'
import { ErroHttp, mensagemAmigavel } from './erros'

/**
 * Leva o erro da API para o formulário: `campos` do ErroHttp vão para o campo certo (só os que
 * existem no formulário); o resto vira mensagem geral. Devolve a mensagem geral, se houver.
 */
export function aplicarErrosDoServidor<T extends FieldValues>(erro: unknown, setError: UseFormSetError<T>, camposDoFormulario: readonly Path<T>[]): string | undefined {
  if (erro instanceof ErroHttp) {
    const campos = Object.entries(erro.campos).filter(([campo]) => camposDoFormulario.includes(campo as Path<T>))
    campos.forEach(([campo, mensagem], i) => setError(campo as Path<T>, { type: 'servidor', message: mensagem }, { shouldFocus: i === 0 }))
    if (campos.length > 0) return undefined
  }
  return mensagemAmigavel(erro)
}
