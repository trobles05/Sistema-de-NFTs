import { useId, type ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { Icone } from './Icone'
import { Rotulo } from './Rotulo'

/** Atributos que ligam o controle ao rótulo, à descrição e ao erro (§8). */
export interface PropsControle {
  id: string
  'aria-invalid': boolean
  'aria-describedby'?: string
  'aria-required'?: boolean
}

interface CampoProps {
  rotulo: ReactNode
  obrigatorio?: boolean
  descricao?: ReactNode
  /** Mensagem de erro (da validação local ou dos `campos` do ErroHttp). */
  erro?: string
  className?: string
  children: (controle: PropsControle) => ReactNode
}

/**
 * Rótulo + controle + descrição + erro, já associados por id/aria.
 * O erro aparece com ícone e texto, nunca só pela cor da borda.
 */
export function Campo({ rotulo, obrigatorio, descricao, erro, className, children }: CampoProps) {
  const id = useId()
  const idDescricao = descricao ? `${id}-descricao` : undefined
  const idErro = erro ? `${id}-erro` : undefined
  const descritores = [idDescricao, idErro].filter(Boolean).join(' ') || undefined

  return (
    <div className={cn('flex flex-col gap-2.5', className)}>
      <Rotulo htmlFor={id} obrigatorio={obrigatorio}>
        {rotulo}
      </Rotulo>
      {children({ id, 'aria-invalid': Boolean(erro), 'aria-describedby': descritores, 'aria-required': obrigatorio || undefined })}
      {descricao && (
        <p id={idDescricao} className="text-f13 text-texto-terciario">
          {descricao}
        </p>
      )}
      {erro && (
        <p id={idErro} className="flex items-center gap-1.5 text-f13 text-coral">
          <Icone nome="alerta" tamanho={16} />
          {erro}
        </p>
      )}
    </div>
  )
}
