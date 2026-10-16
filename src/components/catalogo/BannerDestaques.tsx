import { Link } from '@tanstack/react-router'
import { useState } from 'react'
import { Esqueleto } from '@/components/ui/Esqueleto'
import { useDestaques } from '@/hooks/useCatalogo'
import { cn } from '@/lib/utils'
import type { NftResumo } from '@/types'
import { ImagemNft } from './ImagemNft'

/** Pontinhos do carrossel: troca manual (sem rotação automática, que atrapalha leitura e "reduzir movimento"). */
function Pontos({ total, atual, aoEscolher, className }: { total: number; atual: number; aoEscolher: (i: number) => void; className?: string }) {
  return (
    <div role="group" aria-label="Destaques" className={cn('flex gap-1.5', className)}>
      {Array.from({ length: total }, (_, i) => (
        <button
          key={i}
          type="button"
          aria-label={`Mostrar destaque ${i + 1} de ${total}`}
          aria-current={i === atual}
          onClick={() => aoEscolher(i)}
          className={cn('size-2 rounded-full transition-opacity focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-destaque', i === atual ? 'bg-destaque' : 'bg-destaque/40 hover:bg-destaque/70')}
        />
      ))}
    </div>
  )
}

function Desktop({ itens, atual, setAtual }: { itens: NftResumo[]; atual: number; setAtual: (i: number) => void }) {
  const destaque = itens[atual]
  return (
    <div className="mx-auto hidden h-[450px] w-full max-w-[1200px] items-stretch justify-between gap-10 px-4 md:flex xl:pr-0 xl:pl-10">
      <div className="relative flex max-w-[600px] flex-col justify-center gap-8">
        <div className="flex flex-col gap-1">
          <p className="text-f16 tracking-[0.1em]">Bem-vindo à Kurio</p>
          <h1 className="text-[length:var(--f43)] leading-[70px] font-bold tracking-[0.06em] uppercase">Seja dono do futuro da arte digital</h1>
          <p className="max-w-[557px] text-f14 leading-6 text-texto-secundario">
            Descubra NFTs selecionados de criadores emergentes e consagrados. Colecione arte digital rara, apoie artistas e tenha uma parte da cultura da internet.
          </p>
        </div>
        <Link to="/" hash="catalogo" className="grid h-10 w-[140px] place-items-center rounded-campo bg-primaria text-f16 font-bold text-fundo hover:bg-destaque focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-destaque">
          EXPLORAR
        </Link>
        <Pontos total={itens.length} atual={atual} aoEscolher={setAtual} className="absolute right-0 bottom-11" />
      </div>
      {destaque && (
        <Link to="/nft/$id" params={{ id: destaque.id }} aria-label={`Ver ${destaque.nome}`} className="shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-destaque">
          <ImagemNft imagem={destaque.imagem} alt={destaque.nome} sizes="450px" prioritaria className="size-[min(450px,40vw)] rounded-[20px]" />
        </Link>
      )}
    </div>
  )
}

function Mobile({ itens, atual, setAtual }: { itens: NftResumo[]; atual: number; setAtual: (i: number) => void }) {
  const principal = itens[atual]
  const secundario = itens[(atual + 1) % itens.length]
  return (
    <div className="relative mx-6 h-[190px] overflow-hidden rounded-[24px] bg-superficie md:hidden">
      <span aria-hidden className="absolute -top-8 -left-20 size-[248px] rounded-full bg-superficie-escura/50" />
      <span aria-hidden className="absolute -top-2.5 left-[73px] size-[248px] rounded-full bg-superficie-escura/40" />
      <div className="relative flex h-full items-start justify-between gap-2 px-4 pt-1.5">
        <div className="flex w-[188px] shrink-0 flex-col gap-1.5">
          <p className="text-f12 font-bold">Bem-vindo à Kurio</p>
          <h1 className="text-f20 leading-[29px] font-bold uppercase">Seja dono da cultura digital</h1>
          <p className="text-f13 leading-[18px] text-texto-secundario">Descubra NFTs selecionados de criadores do mundo todo.</p>
          <Link to="/" hash="catalogo" className="flex items-center gap-2 text-f13 font-bold text-destaque focus-visible:outline-2 focus-visible:outline-destaque">
            EXPLORAR <span aria-hidden>→</span>
          </Link>
        </div>
        {principal && (
          <Link to="/nft/$id" params={{ id: principal.id }} aria-label={`Ver ${principal.nome}`} className="relative mt-1 shrink-0 focus-visible:outline-2 focus-visible:outline-destaque">
            <ImagemNft imagem={principal.imagem} alt={principal.nome} sizes="138px" prioritaria className="size-[138px] rounded-[15px]" />
            {secundario && <ImagemNft imagem={secundario.imagem} alt="" sizes="58px" className="absolute top-[88px] left-[14px] size-[58px] rounded-[10px] border-2 border-superficie" />}
          </Link>
        )}
      </div>
      <Pontos total={itens.length} atual={atual} aoEscolher={setAtual} className="absolute bottom-3 left-1/2 -translate-x-1/2" />
    </div>
  )
}

/** Banner "Seja dono…" da Início, com os destaques da API (desktop: arte grande à direita; mobile: card). */
export function BannerDestaques() {
  const { data, isPending } = useDestaques()
  const [atual, setAtual] = useState(0)
  const itens = data?.itens ?? []

  if (isPending) {
    return (
      <>
        <Esqueleto className="mx-auto hidden h-[450px] w-full max-w-[1200px] md:block" />
        <Esqueleto className="mx-6 h-[190px] rounded-[24px] md:hidden" />
      </>
    )
  }

  return (
    <section aria-label="Destaques">
      <Desktop itens={itens} atual={atual} setAtual={setAtual} />
      <Mobile itens={itens} atual={atual} setAtual={setAtual} />
    </section>
  )
}
