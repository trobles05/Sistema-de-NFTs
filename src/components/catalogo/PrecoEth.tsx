import { cn } from '@/lib/utils'
import { formatarEth } from '@/utils/eth'

/** Preço em laranja + preço anterior riscado, como no card "Neon Vessel" do Figma. */
export function PrecoEth({ preco, precoAnterior, className }: { preco: string; precoAnterior?: string | null; className?: string }) {
  return (
    <p className={cn('flex flex-wrap items-baseline gap-x-3 text-f15', className)}>
      <span className="font-bold text-destaque">{formatarEth(preco)} ETH</span>
      {precoAnterior && (
        <del className="text-texto-terciario">
          <span className="sr-only">preço anterior: </span>
          {formatarEth(precoAnterior)} ETH
        </del>
      )}
    </p>
  )
}
