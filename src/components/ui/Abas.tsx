import { Tabs } from 'radix-ui'
import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'

export const Abas = Tabs.Root
export const AbaConteudo = Tabs.Content

export function ListaAbas({ className, ...props }: ComponentProps<typeof Tabs.List>) {
  return <Tabs.List className={cn('flex gap-6 overflow-x-auto', className)} {...props} />
}

/** Aba ativa: texto laranja em negrito com o sublinhado laranja do Figma. */
export function Aba({ className, ...props }: ComponentProps<typeof Tabs.Trigger>) {
  return (
    <Tabs.Trigger
      className={cn(
        'shrink-0 border-b-2 border-transparent pb-1.5 text-f15 whitespace-nowrap text-texto transition-colors md:text-f16',
        'hover:text-destaque focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-destaque',
        'data-[state=active]:border-primaria data-[state=active]:font-bold data-[state=active]:text-destaque',
        className,
      )}
      {...props}
    />
  )
}
