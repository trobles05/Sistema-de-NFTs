import { Link } from '@tanstack/react-router'
import { Botao } from '@/components/ui/Botao'
import { Esqueleto } from '@/components/ui/Esqueleto'
import { Icone } from '@/components/ui/Icone'

/** Skeleton na forma da tela (galeria + informações), para nada pular quando os dados chegam. */
export function EsqueletoDetalhe() {
  return (
    <div aria-hidden className="flex flex-col gap-8 md:flex-row md:gap-8">
      <div className="flex flex-col-reverse gap-4 md:flex-row md:gap-7">
        <div className="flex gap-4 md:flex-col">
          {Array.from({ length: 4 }, (_, i) => (
            <Esqueleto key={i} className="size-[72px] md:size-[100px] md:rounded-none" />
          ))}
        </div>
        <Esqueleto className="aspect-square w-full md:size-[444px] md:rounded-none" />
      </div>
      <div className="flex flex-1 flex-col gap-4">
        <Esqueleto className="h-9 w-2/3" />
        <Esqueleto className="h-5 w-1/4" />
        <Esqueleto className="h-20 w-full" />
        <Esqueleto className="h-7 w-1/2" />
        <Esqueleto className="h-12 w-full" />
      </div>
    </div>
  )
}

/** NFT inexistente (404 da API): explica e leva de volta ao catálogo. */
export function NftNaoEncontrado() {
  return (
    <div className="flex flex-col items-center gap-4 rounded-campo-mobile bg-superficie px-6 py-20 text-center md:rounded-none">
      <Icone nome="busca" tamanho={32} className="text-texto-terciario" />
      <h1 className="text-f24 font-bold">NFT não encontrado</h1>
      <p className="max-w-[420px] text-f14 leading-[22px] text-texto-secundario">Este NFT não existe ou foi removido do catálogo.</p>
      <Botao asChild className="mt-2">
        <Link to="/" hash="catalogo">
          Explorar o catálogo
        </Link>
      </Botao>
    </div>
  )
}
