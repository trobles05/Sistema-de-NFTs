import { Esqueleto } from '@/components/ui/Esqueleto'
import { POR_PAGINA_CATALOGO } from '@/lib/catalogo'

/** Mesmas proporções do CartaoNft (175×200 mobile / 258×300 desktop) + nome e preço: nada pula quando os dados chegam. */
export function EsqueletoCartaoNft() {
  return (
    <div className="flex flex-col gap-2 md:gap-3">
      <Esqueleto className="aspect-[175/200] w-full rounded-[20px] md:aspect-[258/300] md:rounded-none" />
      <div className="flex flex-col gap-1 px-2 md:gap-1.5 md:px-0">
        <Esqueleto className="h-[22px] w-3/4" />
        <Esqueleto className="h-[22px] w-1/3" />
      </div>
    </div>
  )
}

/** Uma página inteira de skeletons, na mesma grade (e no mesmo desencontro do mobile) que a GradeNfts. */
export function GradeEsqueleto() {
  return (
    <ul aria-hidden className="grid grid-cols-2 gap-x-4 gap-y-6 pb-8 md:gap-x-[34px] md:gap-y-[72px] md:pb-0 lg:grid-cols-3">
      {Array.from({ length: POR_PAGINA_CATALOGO }, (_, i) => (
        <li key={i} className="max-md:even:translate-y-8">
          <EsqueletoCartaoNft />
        </li>
      ))}
    </ul>
  )
}
