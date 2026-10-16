import type { VariantProps } from 'class-variance-authority'
import { Slot } from 'radix-ui'
import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'
import { variantesBotao } from './estilos'

interface BotaoProps extends ComponentProps<'button'>, VariantProps<typeof variantesBotao> {
  /** Renderiza o filho (ex.: <Link>) com o visual de botão. */
  asChild?: boolean
  /** Bloqueia novos cliques enquanto a ação está em andamento (evita envio duplicado). */
  carregando?: boolean
}

export function Botao({ className, variante, tamanho, asChild = false, carregando = false, disabled, children, ...props }: BotaoProps) {
  const Componente = asChild ? Slot.Root : 'button'
  return (
    <Componente
      className={cn(variantesBotao({ variante, tamanho }), className)}
      disabled={asChild ? undefined : disabled || carregando}
      aria-busy={carregando || undefined}
      {...props}
    >
      {carregando ? (
        <>
          <span className="size-4 animate-spin rounded-full border-2 border-current border-r-transparent" aria-hidden />
          {children}
        </>
      ) : (
        children
      )}
    </Componente>
  )
}
