import { Select as SelectRadix } from 'radix-ui'
import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'
import { Icone } from './Icone'
import { classesCampo } from './estilos'

export const Select = SelectRadix.Root
export const SelectValor = SelectRadix.Value

export function SelectGatilho({ className, children, ...props }: ComponentProps<typeof SelectRadix.Trigger>) {
  return (
    <SelectRadix.Trigger
      className={cn(classesCampo, 'flex items-center justify-between gap-2 text-left data-placeholder:text-f14 data-placeholder:text-texto-terciario', className)}
      {...props}
    >
      {children}
      <SelectRadix.Icon asChild>
        <Icone nome="seta-baixo" tamanho={20} className="text-texto" />
      </SelectRadix.Icon>
    </SelectRadix.Trigger>
  )
}

export function SelectConteudo({ className, children, ...props }: ComponentProps<typeof SelectRadix.Content>) {
  return (
    <SelectRadix.Portal>
      <SelectRadix.Content
        position="popper"
        sideOffset={4}
        className={cn(
          'z-50 max-h-(--radix-select-content-available-height) min-w-(--radix-select-trigger-width) overflow-hidden',
          'rounded-campo border border-borda-suave bg-superficie text-texto shadow-lg',
          'data-[state=open]:animate-in data-[state=open]:fade-in-0',
          className,
        )}
        {...props}
      >
        <SelectRadix.Viewport className="p-1">{children}</SelectRadix.Viewport>
      </SelectRadix.Content>
    </SelectRadix.Portal>
  )
}

export function SelectItem({ className, children, ...props }: ComponentProps<typeof SelectRadix.Item>) {
  return (
    <SelectRadix.Item
      className={cn(
        'relative flex cursor-pointer items-center rounded-campo py-2.5 pr-8 pl-3 text-f15 outline-none select-none',
        'data-highlighted:bg-superficie-elevada data-[state=checked]:text-destaque data-disabled:pointer-events-none data-disabled:opacity-50',
        className,
      )}
      {...props}
    >
      <SelectRadix.ItemText>{children}</SelectRadix.ItemText>
      <SelectRadix.ItemIndicator className="absolute right-3 size-2 rounded-full bg-primaria" />
    </SelectRadix.Item>
  )
}
