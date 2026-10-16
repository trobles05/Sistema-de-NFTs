import { useState } from 'react'
import { ImagemNft } from '@/components/catalogo/ImagemNft'
import { Icone } from '@/components/ui/Icone'
import { Modal, ModalConteudo, ModalGatilho } from '@/components/ui/Modal'
import { cn } from '@/lib/utils'
import type { Nft } from '@/types'

/**
 * Cada NFT tem uma arte só; o Figma repete a mesma imagem nas 4 miniaturas. Aqui as miniaturas são
 * enquadramentos diferentes da arte (inteira e três aproximações), para a galeria ter função.
 */
const VISTAS = [
  { rotulo: 'Arte completa', escala: 1, origem: '50% 50%' },
  { rotulo: 'Detalhe do rosto', escala: 1.8, origem: '50% 38%' },
  { rotulo: 'Detalhe do acessório', escala: 2, origem: '50% 78%' },
  { rotulo: 'Detalhe da textura', escala: 2.4, origem: '28% 62%' },
] as const

function Enquadramento({ nft, vista, sizes, prioritaria, className }: { nft: Nft; vista: (typeof VISTAS)[number]; sizes: string; prioritaria?: boolean; className?: string }) {
  return (
    <span className={cn('block overflow-hidden', className)}>
      <ImagemNft
        imagem={nft.imagem}
        alt={vista.escala === 1 ? nft.nome : `${nft.nome} — ${vista.rotulo.toLowerCase()}`}
        sizes={sizes}
        prioritaria={prioritaria}
        className="size-full transition-transform duration-300"
        estilo={{ transform: `scale(${vista.escala})`, transformOrigin: vista.origem }}
      />
    </span>
  )
}

/** Galeria do Figma: 4 miniaturas de 100px + imagem principal de 444px (arte de 404px) com zoom. */
export function GaleriaNft({ nft }: { nft: Nft }) {
  const [atual, setAtual] = useState(0)
  const vista = VISTAS[atual]!

  return (
    <div className="flex flex-col-reverse gap-4 md:flex-row md:gap-7">
      <div role="group" aria-label="Vistas da arte" className="flex gap-4 md:flex-col">
        {VISTAS.map((item, i) => (
          <button
            key={item.rotulo}
            type="button"
            aria-label={item.rotulo}
            aria-pressed={i === atual}
            onClick={() => setAtual(i)}
            className={cn(
              'size-[72px] shrink-0 overflow-hidden rounded-[8px] border-2 transition-colors md:size-[100px] md:rounded-none',
              'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-destaque',
              i === atual ? 'border-primaria' : 'border-transparent hover:border-borda-suave',
            )}
          >
            <Enquadramento nft={nft} vista={item} sizes="100px" className="size-full" />
          </button>
        ))}
      </div>

      <div className="relative grid aspect-square w-full place-items-center bg-superficie md:size-[444px]">
        <Enquadramento nft={nft} vista={vista} sizes="(min-width: 768px) 404px, 90vw" prioritaria className="aspect-square w-[91%] rounded-[15px]" />
        <Modal>
          <ModalGatilho
            aria-label={`Ampliar ${nft.nome}`}
            className="absolute top-3 right-3 grid size-[30px] place-items-center rounded-full bg-superficie text-texto hover:text-destaque focus-visible:outline-2 focus-visible:outline-destaque"
          >
            <Icone nome="busca" tamanho={20} />
          </ModalGatilho>
          <ModalConteudo titulo={nft.nome} tituloOculto className="max-w-[min(860px,calc(100%-32px))] border-b-0" classNameCorpo="p-4 pt-12">
            <Enquadramento nft={nft} vista={vista} sizes="(min-width: 860px) 800px, 100vw" className="aspect-square w-full rounded-[15px]" />
          </ModalConteudo>
        </Modal>
      </div>
    </div>
  )
}
