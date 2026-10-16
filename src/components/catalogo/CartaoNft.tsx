import { Link } from '@tanstack/react-router'
import { Selo } from '@/components/ui/Selo'
import type { NftResumo } from '@/types'
import { ImagemNft } from './ImagemNft'
import { PrecoEth } from './PrecoEth'

/**
 * Card do catálogo (Figma: 258×300 no desktop com a arte de 250px; 175×200 no mobile com 168px).
 * O card inteiro leva ao detalhe; o nome é o título acessível.
 */
export function CartaoNft({ nft, prioritaria = false }: { nft: NftResumo; prioritaria?: boolean }) {
  return (
    <Link
      to="/nft/$id"
      params={{ id: nft.id }}
      className="group flex flex-col gap-2 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-destaque md:gap-3"
    >
      <div className="relative grid aspect-[175/200] place-items-center overflow-hidden rounded-[20px] bg-superficie md:aspect-[258/300] md:rounded-none">
        <ImagemNft
          imagem={nft.imagem}
          alt=""
          sizes="(min-width: 768px) 250px, 168px"
          prioritaria={prioritaria}
          className="w-[96%] rounded-[15px] transition-transform duration-300 group-hover:scale-[1.03] md:w-[96.9%]"
        />
        {nft.raro && <Selo className="absolute top-3 left-0 md:top-3.5">Raro</Selo>}
        {nft.esgotado && (
          <span className="absolute inset-x-0 bottom-0 bg-fundo/80 py-1.5 text-center text-f13 font-bold tracking-[0.1em] text-texto uppercase">Esgotado</span>
        )}
      </div>
      <div className="flex flex-col gap-1 px-2 md:gap-1.5 md:px-0">
        <h3 className="truncate text-f15 text-texto group-hover:text-destaque">{nft.nome}</h3>
        <PrecoEth preco={nft.preco} precoAnterior={nft.precoAnterior} />
      </div>
    </Link>
  )
}
