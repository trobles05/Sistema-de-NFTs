import { Slider } from 'radix-ui'
import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'

interface FaixaPrecoProps extends Omit<ComponentProps<typeof Slider.Root>, 'children'> {
  rotulosPontos?: readonly [string, string]
}

/**
 * Slider de dois pontos da "Faixa de preço". Figma: trilho e pontos brancos (Color/Background Elevated),
 * ponto com contorno escuro. Cada ponto é focável e ajustável pelas setas.
 */
export function FaixaPreco({ className, rotulosPontos = ['Preço mínimo', 'Preço máximo'], ...props }: FaixaPrecoProps) {
  return (
    <Slider.Root className={cn('relative flex h-5 w-full touch-none items-center select-none', className)} {...props}>
      <Slider.Track className="relative h-[3px] grow bg-fundo-claro">
        <Slider.Range className="absolute h-full bg-fundo-claro" />
      </Slider.Track>
      {rotulosPontos.map((rotulo) => (
        <Slider.Thumb
          key={rotulo}
          aria-label={rotulo}
          className="block size-4 rounded-full border-2 border-fundo bg-fundo-claro focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-destaque"
        />
      ))}
    </Slider.Root>
  )
}
