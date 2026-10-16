import { clsx, type ClassValue } from 'clsx'
import { extendTailwindMerge } from 'tailwind-merge'

/**
 * Os tamanhos de fonte do Figma viram utilitários `text-f14` etc. Sem declarar isso, o tailwind-merge
 * os confunde com cor (`text-destaque`) e descarta um dos dois.
 */
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-size': [{ text: ['f9', 'f10', 'f12', 'f13', 'f14', 'f15', 'f16', 'f17', 'f18', 'f20', 'f22', 'f24', 'f32', 'f43'] }],
      rounded: [{ rounded: ['campo', 'campo-mobile', 'cabecalho', 'social'] }],
    },
  },
})

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
