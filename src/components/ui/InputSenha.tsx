import { useState, type ComponentProps } from 'react'
import { cn } from '@/lib/utils'
import { Icone } from './Icone'
import { Input } from './Input'

/**
 * Campo de senha com alternância de visibilidade. O Figma só desenhou o ícone "olho riscado";
 * com a senha visível ele fica laranja, e o estado vai para leitor de tela via aria-pressed.
 */
export function InputSenha({ className, ...props }: Omit<ComponentProps<'input'>, 'type'>) {
  const [visivel, setVisivel] = useState(false)
  return (
    <div className="relative w-full">
      <Input type={visivel ? 'text' : 'password'} className={cn('pr-12', className)} {...props} />
      <button
        type="button"
        onClick={() => setVisivel((v) => !v)}
        aria-label={visivel ? 'Ocultar senha' : 'Mostrar senha'}
        aria-pressed={visivel}
        disabled={props.disabled}
        className={cn(
          'absolute top-1/2 right-2 grid size-9 -translate-y-1/2 place-items-center rounded-campo transition-colors',
          'focus-visible:outline-2 focus-visible:outline-destaque',
          visivel ? 'text-primaria' : 'text-borda-suave md:text-texto-terciario',
        )}
      >
        <Icone nome="olho-oculto" tamanho={20} />
      </button>
    </div>
  )
}
