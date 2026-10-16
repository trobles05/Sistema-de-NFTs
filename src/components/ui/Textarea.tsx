import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'
import { classesCampo } from './estilos'

export function Textarea({ className, ...props }: ComponentProps<'textarea'>) {
  return <textarea className={cn(classesCampo, 'h-auto min-h-[150px] resize-y py-3 md:h-auto', className)} {...props} />
}
