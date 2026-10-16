import { Dialog } from 'radix-ui'
import type { ComponentProps, ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { IconeFechar } from './Fechar'

export const Modal = Dialog.Root
export const ModalGatilho = Dialog.Trigger
export const ModalFechar = Dialog.Close

interface ModalConteudoProps extends ComponentProps<typeof Dialog.Content> {
  titulo: ReactNode
  /** Esconde o título visualmente (continua anunciado ao leitor de tela). */
  tituloOculto?: boolean
  descricao?: ReactNode
}

/**
 * Modal do Figma (login, cadastro, confirmação): superfície #241612, até 500px (desktop) e a barra
 * laranja na base. O Radix prende o foco dentro, fecha com ESC/clique fora e devolve o foco ao gatilho.
 */
export function ModalConteudo({ className, titulo, tituloOculto, descricao, children, ...props }: ModalConteudoProps) {
  return (
    <Dialog.Portal>
      <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 data-[state=open]:animate-in data-[state=open]:fade-in-0" />
      <Dialog.Content
        className={cn(
          'fixed top-1/2 left-1/2 z-50 flex max-h-[calc(100dvh-32px)] w-[calc(100%-32px)] max-w-[500px] -translate-x-1/2 -translate-y-1/2 flex-col',
          'overflow-y-auto border-b-8 border-primaria bg-superficie text-texto shadow-2xl',
          'data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95',
          className,
        )}
        {...props}
      >
        <Dialog.Title className={cn('px-6 pt-12 text-center text-f18 font-bold', tituloOculto && 'sr-only')}>{titulo}</Dialog.Title>
        {descricao ? (
          <Dialog.Description className="px-6 pt-4 text-center text-f13 leading-[16px]">{descricao}</Dialog.Description>
        ) : (
          <Dialog.Description className="sr-only">{titulo}</Dialog.Description>
        )}
        <div className="px-6 pt-8 pb-10">{children}</div>
        <Dialog.Close
          className="absolute top-4 right-4 grid size-8 place-items-center rounded-campo text-primaria focus-visible:outline-2 focus-visible:outline-destaque"
          aria-label="Fechar"
        >
          <IconeFechar />
        </Dialog.Close>
      </Dialog.Content>
    </Dialog.Portal>
  )
}
