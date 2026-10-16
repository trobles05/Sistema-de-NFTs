import { useRouter } from '@tanstack/react-router'
import { ImagemNft } from '@/components/catalogo/ImagemNft'
import { Icone } from '@/components/ui/Icone'
import { formatarEth } from '@/utils/eth'
import { propsEmBreve } from './AcaoEmBreve'
import { DadosToken, SeletorEdicao, SeletorQuantidade, TotalSelecao, type InfoNftProps } from './InfoNft'

const classeBotaoRedondo =
  'grid size-[35px] place-items-center rounded-full bg-superficie-elevada/90 text-texto-secundario focus-visible:outline-2 focus-visible:outline-destaque'

/** Mobile / Detalhes do NFT: arte no topo, folha arredondada por cima e barra de compra fixa. */
export function DetalheMobile(props: InfoNftProps) {
  const { nft, selecao } = props
  const router = useRouter()

  return (
    <div className="pb-[180px]">
      <div className="relative bg-superficie px-[26px] pt-[52px] pb-[130px]">
        <div className="absolute inset-x-[26px] top-4 flex justify-between">
          <button type="button" aria-label="Voltar" onClick={() => router.history.back()} className={classeBotaoRedondo}>
            <Icone nome="voltar" tamanho={20} className="rotate-90" />
          </button>
          <button type="button" aria-label={`Favoritar ${nft.nome}`} className={classeBotaoRedondo} {...propsEmBreve}>
            <Icone nome="coracao-contorno" tamanho={16} />
          </button>
        </div>
        <ImagemNft imagem={nft.imagem} alt={nft.nome} sizes="361px" prioritaria className="aspect-[361/356] w-full rounded-[20px]" />
      </div>

      <section className="relative -mt-[114px] flex flex-col gap-3 rounded-t-[30px] bg-fundo px-6 pt-8">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-f20 font-bold">{nft.nome}</h1>
          <span className="flex h-[27px] shrink-0 items-center gap-1 rounded-full border border-primaria px-2 text-f14">
            <Icone nome="estrela" tamanho={14} className="text-primaria" />
            <strong>{nft.avaliacao.media.toLocaleString('pt-BR')}</strong>
            <span className="text-texto-secundario">({nft.avaliacao.total})</span>
            <span className="sr-only">avaliações de colecionadores</span>
          </span>
        </div>
        <p className="text-f14 leading-[24px] text-texto-secundario">{nft.descricao}</p>
        <SeletorEdicao {...props} />
        <DadosToken nft={nft} />
      </section>

      <div role="region" aria-label="Compra" className="fixed inset-x-0 bottom-0 z-30 flex flex-col gap-5 rounded-t-[30px] bg-superficie px-6 pt-5 pb-6 shadow-[0_-10px_30px_rgba(10,6,4,0.45)]">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-2">
            <span className="pt-1.5 text-f16 font-bold">Qtd.</span>
            <SeletorQuantidade {...props} tamanho="padrao" />
          </div>
          <div className="flex flex-col items-end">
            <p className="text-f20 font-bold text-destaque">{formatarEth(selecao.edicao.preco)} ETH</p>
            <TotalSelecao {...props} />
          </div>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            className="h-[60px] flex-1 rounded-full bg-(image:--degrade-botao) text-f16 font-bold text-fundo focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-destaque"
            {...propsEmBreve}
          >
            Comprar NFT
          </button>
          <button type="button" aria-label={`Adicionar ${nft.nome} ao carrinho`} className="grid size-[60px] place-items-center rounded-full bg-superficie-elevada text-texto-secundario focus-visible:outline-2 focus-visible:outline-destaque" {...propsEmBreve}>
            <Icone nome="carrinho-cheio" tamanho={22} />
          </button>
        </div>
      </div>
    </div>
  )
}
