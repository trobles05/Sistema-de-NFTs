import { cn } from '@/lib/utils'
import { Icone } from './Icone'

/** Figma: círculo de 50px em #2F1D15 com o ícone de imagem quando não há foto. */
export function Avatar({ src, nome, className }: { src?: string | null; nome: string; className?: string }) {
  return (
    <span className={cn('grid size-[50px] shrink-0 place-items-center overflow-hidden rounded-full border border-borda bg-superficie-elevada text-primaria', className)}>
      {src ? <img src={src} alt={`Avatar de ${nome}`} className="size-full object-cover" /> : <Icone nome="imagem" tamanho={24} rotulo={`${nome} ainda não tem avatar`} />}
    </span>
  )
}
