import { Link } from '@tanstack/react-router'
import { Esqueleto } from '@/components/ui/Esqueleto'
import { useDestaques } from '@/hooks/useCatalogo'
import { ImagemNft } from './ImagemNft'

/** "NFT EM DESTAQUE / OFERTA LIMITADA" sob os filtros (desktop): o segundo destaque, como no Figma. */
export function CartaoDestaqueLateral() {
  const { data, isPending } = useDestaques()
  const nft = data?.itens[1]
  if (isPending) return <Esqueleto className="mt-[104px] aspect-[310/368] w-full rounded-[15px]" />
  if (!nft) return null
  return (
    <Link to="/nft/$id" params={{ id: nft.id }} className="group mt-6 flex flex-col gap-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-destaque">
      <p className="px-5 text-f24 font-bold tracking-[0.06em] text-destaque uppercase">NFT em destaque</p>
      <p className="px-5 text-center text-f16 font-bold tracking-[0.06em] uppercase">Oferta limitada</p>
      <ImagemNft imagem={nft.imagem} alt={nft.nome} sizes="310px" className="aspect-[310/368] w-full rounded-[15px] object-cover transition-transform group-hover:scale-[1.02]" />
    </Link>
  )
}
