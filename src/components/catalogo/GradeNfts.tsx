import type { NftResumo } from '@/types'
import { CartaoNft } from './CartaoNft'

/**
 * Desktop: 3 colunas (258px, espaço de 34/72px). Mobile: 2 colunas desencontradas, como no Figma —
 * a coluna da direita é só deslocada no visual, então a ordem de leitura continua a da lista.
 */
export function GradeNfts({ itens }: { itens: readonly NftResumo[] }) {
  return (
    <ul aria-label="NFTs" className="grid grid-cols-2 gap-x-4 gap-y-6 pb-8 md:gap-x-[34px] md:gap-y-[72px] md:pb-0 lg:grid-cols-3">
      {itens.map((nft, i) => (
        <li key={nft.id} className="max-md:even:translate-y-8">
          <CartaoNft nft={nft} prioritaria={i < 3} />
        </li>
      ))}
    </ul>
  )
}
