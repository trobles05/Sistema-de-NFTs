import { Dialog } from 'radix-ui'
import type { ComponentProps, ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { IconeFechar } from './Fechar'

export const Gaveta = Dialog.Root
export const GavetaGatilho = Dialog.Trigger
export const GavetaFechar = Dialog.Close

const LADOS = {
  baixo: 'inset-x-0 bottom-0 max-h-[85dvh] rounded-t-[30px] data-[state=open]:slide-in-from-bottom',
  direita: 'inset-y-0 right-0 h-dvh w-[min(360px,100%)] data-[state=open]:slide-in-from-right',
  esquerda: 'inset-y-0 left-0 h-dvh w-[min(360px,100%)] data-[state=open]:slide-in-from-left',
} as const

interface GavetaConteudoProps extends ComponentProps<typeof Dialog.Content> {
  titulo: ReactNode
  lado?: keyof typeof LADOS
}

/** Painel deslizante (filtros no mobile). Mesmo comportamento de foco do Modal. */
export function GavetaConteudo({ className, titulo, lado = 'baixo', children, ...props }: GavetaConteudoProps) {
  return (
    <Dialog.Portal>
      <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 data-[state=open]:animate-in data-[state=open]:fade-in-0" />
      <Dialog.Content
        className={cn('fixed z-50 flex flex-col overflow-y-auto bg-superficie text-texto shadow-2xl data-[state=open]:animate-in', LADOS[lado], className)}
        {...props}
      >
        <div className="flex items-center justify-between px-6 pt-6 pb-4">
          <Dialog.Title className="text-f18 font-bold">{titulo}</Dialog.Title>
          <Dialog.Close className="grid size-8 place-items-center rounded-campo text-primaria focus-visible:outline-2 focus-visible:outline-destaque" aria-label="Fechar">
            <IconeFechar />
          </Dialog.Close>
        </div>
        <Dialog.Description className="sr-only">{titulo}</Dialog.Description>
        <div className="px-6 pb-8">{children}</div>
      </Dialog.Content>
    </Dialog.Portal>
  )
}
