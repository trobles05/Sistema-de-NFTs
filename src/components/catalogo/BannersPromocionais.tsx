import { Link } from '@tanstack/react-router'
import type { FiltrosCatalogo, ImagemNft as ChaveImagem } from '@/types'
import { ImagemNft } from './ImagemNft'

const BANNERS: readonly { titulo: [string, string]; texto: string; imagem: ChaveImagem; filtros: Partial<FiltrosCatalogo> }[] = [
  {
    titulo: ['Lançamentos gênesis', 'de edição limitada'],
    texto: 'Colecione edições escassas diretamente dos criadores antes da revelação pública.',
    imagem: 'ape-green-jacket',
    filtros: { aba: 'lancamentos' },
  },
  {
    titulo: ['Arte digital selecionada', 'e muito mais'],
    texto: 'Explore novos artistas, coleções verificadas e obras digitais que definem a cultura.',
    imagem: 'baron-turtleneck',
    filtros: { categorias: ['arte-digital'] },
  },
]

/** Os 2 cards promocionais do Figma (586×250). "Explorar" leva ao catálogo já filtrado de forma coerente. */
export function BannersPromocionais() {
  return (
    <section aria-label="Coleções em destaque" className="mx-auto grid w-full max-w-[1200px] gap-7 px-4 md:grid-cols-2 xl:px-0">
      {BANNERS.map((banner) => (
        <article key={banner.imagem} className="relative flex min-h-[250px] overflow-hidden bg-superficie">
          <ImagemNft imagem={banner.imagem} alt="" sizes="(min-width: 768px) 292px, 45vw" className="aspect-auto h-auto w-1/2 object-cover" />
          <span aria-hidden className="pointer-events-none absolute top-[142px] -left-[191px] size-64 rounded-full border border-primaria/50" />
          <span aria-hidden className="pointer-events-none absolute top-[134px] -left-[199px] size-64 rounded-full border border-primaria/30" />
          <div className="flex w-1/2 flex-col items-end justify-center gap-3 p-5 text-right md:pr-[30px]">
            <h2 className="text-f16 leading-6 font-bold md:text-f18">
              {banner.titulo[0]}
              <br />
              {banner.titulo[1]}
            </h2>
            <p className="text-f13 leading-[15px] text-texto-secundario">{banner.texto}</p>
            <Link
              to="/"
              search={banner.filtros}
              hash="catalogo"
              className="mt-3 flex h-10 w-[140px] items-center justify-center gap-1 rounded-campo bg-primaria text-f16 font-bold text-fundo hover:bg-destaque focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-destaque"
            >
              Explorar <span aria-hidden>→</span>
            </Link>
          </div>
        </article>
      ))}
    </section>
  )
}
