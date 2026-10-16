import ape400 from '@/assets/images/nfts/ape-green-jacket-400.webp'
import ape800 from '@/assets/images/nfts/ape-green-jacket-800.webp'
import baron400 from '@/assets/images/nfts/baron-turtleneck-400.webp'
import baron800 from '@/assets/images/nfts/baron-turtleneck-800.webp'
import golden400 from '@/assets/images/nfts/golden-headphones-400.webp'
import golden800 from '@/assets/images/nfts/golden-headphones-800.webp'
import nomad400 from '@/assets/images/nfts/nomad-bucket-hat-400.webp'
import nomad800 from '@/assets/images/nfts/nomad-bucket-hat-800.webp'
import type { CSSProperties } from 'react'
import { cn } from '@/lib/utils'
import type { ImagemNft as ChaveImagem } from '@/types'

const FONTES: Record<ChaveImagem, readonly [string, string]> = {
  'ape-green-jacket': [ape400, ape800],
  'baron-turtleneck': [baron400, baron800],
  'golden-headphones': [golden400, golden800],
  'nomad-bucket-hat': [nomad400, nomad800],
}

interface ImagemNftProps {
  imagem: ChaveImagem
  alt: string
  /** Largura exibida, para o navegador escolher 400w ou 800w (ex.: "(min-width: 768px) 250px, 168px"). */
  sizes: string
  /** Imagem principal acima da dobra (LCP): carrega já, com prioridade. */
  prioritaria?: boolean
  className?: string
  estilo?: CSSProperties
}

/** Arte do NFT em WebP responsivo; quadrada, com largura/altura declaradas para não deslocar o layout. */
export function ImagemNft({ imagem, alt, sizes, prioritaria = false, className, estilo }: ImagemNftProps) {
  const [pequena, grande] = FONTES[imagem]
  return (
    <img
      src={pequena}
      srcSet={`${pequena} 400w, ${grande} 800w`}
      sizes={sizes}
      alt={alt}
      width={400}
      height={400}
      loading={prioritaria ? 'eager' : 'lazy'}
      fetchPriority={prioritaria ? 'high' : 'auto'}
      decoding="async"
      className={cn('aspect-square object-cover', className)}
      style={estilo}
    />
  )
}
