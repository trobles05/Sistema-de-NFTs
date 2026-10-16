import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'

/**
 * Figma: mobile 50px, raio 10px, texto 16px (Mobile / Login); desktop 40px, raio 3px (Desktop / Perfil).
 * Foco = borda laranja (como o campo ativo do Figma) + contorno de foco visível para teclado.
 */
export const classesCampo = cn(
  'w-full min-w-0 border border-borda bg-transparent text-texto transition-colors',
  'h-[50px] rounded-campo-mobile px-4 text-f16 md:h-10 md:rounded-campo md:text-f15',
  'placeholder:text-f14 placeholder:text-texto-terciario',
  'focus-visible:border-primaria focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-destaque/60',
  'aria-invalid:border-coral',
  'disabled:cursor-not-allowed disabled:opacity-50',
)

/**
 * Medidas do Figma: mobile 60px de altura com raio 10px (Sign In / Confirm Button);
 * desktop 40px com raio 3px (Save Button). A troca acontece a partir de `md` (768px).
 */
export const variantesBotao = cva(
  [
    'inline-flex shrink-0 items-center justify-center gap-2 font-bold whitespace-nowrap transition-[background-color,color,opacity]',
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-destaque',
    'disabled:cursor-not-allowed disabled:opacity-50 aria-busy:cursor-progress',
  ],
  {
    variants: {
      variante: {
        primario: 'bg-primaria text-fundo hover:bg-destaque',
        contorno: 'border border-primaria text-destaque hover:bg-superficie-elevada',
        fantasma: 'text-texto hover:bg-superficie-elevada',
        link: 'h-auto px-0 font-regular text-destaque underline-offset-4 hover:underline',
      },
      tamanho: {
        padrao: 'h-[60px] rounded-campo-mobile px-6 text-f16 md:h-10 md:rounded-campo md:px-5 md:text-f14',
        compacto: 'h-10 rounded-campo px-5 text-f14',
        cabecalho: 'h-[35px] rounded-cabecalho px-3 text-f16 font-medium',
        icone: 'size-10 rounded-campo p-0',
      },
    },
    compoundVariants: [{ variante: 'link', className: 'h-auto px-0 md:h-auto md:px-0' }],
    defaultVariants: { variante: 'primario', tamanho: 'padrao' },
  },
)
