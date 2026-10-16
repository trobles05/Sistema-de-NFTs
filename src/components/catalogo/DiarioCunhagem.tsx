import { Link } from '@tanstack/react-router'
import type { ImagemNft as ChaveImagem } from '@/types'
import { ImagemNft } from './ImagemNft'

const ARTIGOS: readonly { data: string; leitura: string; titulo: string; resumo: string; imagem: ChaveImagem }[] = [
  { data: '12 de setembro', leitura: 'Leitura de 6 min', titulo: 'Como funciona a propriedade de NFTs', resumo: 'Aprenda a colecionar, negociar e verificar ativos digitais.', imagem: 'baron-turtleneck' },
  { data: '13 de setembro', leitura: 'Leitura de 2 min', titulo: '10 artistas digitais para acompanhar', resumo: 'Conheça criadores que moldam a cultura digital.', imagem: 'ape-green-jacket' },
  { data: '15 de setembro', leitura: 'Leitura de 3 min', titulo: 'Raridade, atributos e procedência', resumo: 'Entenda raridade, procedência, direitos autorais e utilidade.', imagem: 'nomad-bucket-hat' },
  { data: '15 de setembro', leitura: 'Leitura de 2 min', titulo: 'Como proteger sua carteira', resumo: 'Proteja sua carteira, seus ativos e sua identidade.', imagem: 'golden-headphones' },
]

/**
 * "Diário da Cunhagem" do Figma. Conteúdo editorial está fora da entrega (README §3): os cards ficam
 * fiéis ao layout e "Ler mais" leva à página "em breve", sem simular um blog.
 */
export function DiarioCunhagem() {
  return (
    <section aria-labelledby="titulo-diario" className="mx-auto flex w-full max-w-[1200px] flex-col gap-10 px-4 xl:px-0">
      <header className="flex flex-col gap-3 text-center">
        <h2 id="titulo-diario" className="text-f24 font-bold md:text-[2rem]">
          Diário da Cunhagem
        </h2>
        <p className="text-f13 text-texto-secundario">Histórias, guias e insights para colecionadores sobre o universo da propriedade digital.</p>
      </header>
      <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:justify-items-start">
        {ARTIGOS.map((artigo) => (
          <li key={artigo.titulo} className="w-full lg:max-w-[268px]">
            <article className="flex h-full flex-col overflow-hidden rounded-[10px] bg-superficie">
              <ImagemNft imagem={artigo.imagem} alt="" sizes="(min-width: 1024px) 268px, 50vw" className="aspect-[268/195] w-full object-cover" />
              <div className="flex flex-1 flex-col gap-2 p-4">
                <p className="text-f10 leading-4 text-texto-secundario">
                  {artigo.data} <span aria-hidden>|</span> {artigo.leitura}
                </p>
                <h3 className="text-f14 leading-[21px] font-bold">{artigo.titulo}</h3>
                <p className="text-f12 leading-4 text-texto-secundario">{artigo.resumo}</p>
                <Link to="/em-breve" search={{ secao: artigo.titulo }} className="mt-auto pt-2 text-f12 font-bold text-destaque hover:underline focus-visible:outline-2 focus-visible:outline-destaque">
                  Ler mais <span aria-hidden>→</span>
                  <span className="sr-only">: {artigo.titulo}</span>
                </Link>
              </div>
            </article>
          </li>
        ))}
      </ul>
    </section>
  )
}
