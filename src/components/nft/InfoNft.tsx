import { Botao } from '@/components/ui/Botao'
import { ChipsEdicao } from '@/components/ui/ChipsEdicao'
import { ControleQuantidade } from '@/components/ui/ControleQuantidade'
import { Icone } from '@/components/ui/Icone'
import { limiteQuantidade, motivoLimite, type SelecaoEdicao } from '@/lib/detalhe'
import type { Nft } from '@/types'
import { PrecoEth } from '@/components/catalogo/PrecoEth'
import { formatarEth, multiplicarEth } from '@/utils/eth'
import { propsEmBreve } from './AcaoEmBreve'
import { EstrelasAvaliacao } from './EstrelasAvaliacao'

export interface InfoNftProps {
  nft: Nft
  selecao: SelecaoEdicao
  quantidade: number
  aoMudarEdicao: (edicaoId: string) => void
  aoMudarQuantidade: (quantidade: number) => void
}

export function SeletorEdicao({ nft, selecao, aoMudarEdicao }: Pick<InfoNftProps, 'nft' | 'selecao' | 'aoMudarEdicao'>) {
  return (
    <div className="flex flex-col gap-3">
      <p id="rotulo-edicao" className="text-f14 font-bold md:text-f15">
        Edição:
      </p>
      <ChipsEdicao
        rotulo="Edição"
        valor={selecao.edicao.id}
        aoMudar={aoMudarEdicao}
        opcoes={nft.edicoes.map((e) => ({ id: e.id, rotulo: e.rotulo, esgotada: e.disponivel === 0 }))}
      />
      {selecao.esgotada && (
        <p role="status" className="flex items-center gap-1.5 text-f13 text-coral">
          <Icone nome="alerta" tamanho={16} /> Esta edição está esgotada. Escolha outra edição.
        </p>
      )}
    </div>
  )
}

/** Quantidade limitada ao estoque e ao limite por pedido, com o motivo visível; total quando > 1. */
export function SeletorQuantidade({ nft, selecao, quantidade, aoMudarQuantidade, tamanho }: Pick<InfoNftProps, 'nft' | 'selecao' | 'quantidade' | 'aoMudarQuantidade'> & { tamanho: 'padrao' | 'grande' }) {
  const maximo = limiteQuantidade(selecao.edicao)
  return (
    <div className="flex flex-col gap-1.5">
      <ControleQuantidade valor={quantidade} aoMudar={aoMudarQuantidade} minimo={1} maximo={Math.max(maximo, 1)} item={nft.nome} tamanho={tamanho} />
      {!selecao.esgotada && <p className="text-f12 text-texto-terciario">{motivoLimite(selecao.edicao)}</p>}
    </div>
  )
}

export function TotalSelecao({ selecao, quantidade }: Pick<InfoNftProps, 'selecao' | 'quantidade'>) {
  if (quantidade < 2) return null
  return (
    <p className="text-f14 text-texto-secundario" aria-live="polite">
      Total: <strong className="text-destaque">{formatarEth(multiplicarEth(selecao.edicao.preco, quantidade))} ETH</strong>
    </p>
  )
}

export function DadosToken({ nft }: { nft: Nft }) {
  return (
    <dl className="flex flex-col gap-3 text-f14 leading-5 text-texto-secundario">
      {[
        ['ID do token', nft.tokenId],
        ['Coleção', nft.colecao],
        ['Atributos', nft.atributos.join(', ')],
      ].map(([termo, valor]) => (
        <div key={termo} className="flex gap-1">
          <dt>{termo}:</dt>
          <dd>{valor}</dd>
        </div>
      ))}
    </dl>
  )
}

/** Coluna de informações do desktop (595px no Figma). */
export function InfoNftDesktop(props: InfoNftProps) {
  const { nft, selecao } = props
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-[13px]">
      <div className="flex flex-col gap-3 border-b border-borda-suave pb-3">
        <h1 className="text-f24 leading-[37px] font-bold md:text-[1.75rem]">{nft.nome}</h1>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <PrecoEth preco={selecao.edicao.preco} precoAnterior={selecao.edicao.precoAnterior} className="text-f18" />
          <span className="flex items-center gap-2 text-f14">
            <EstrelasAvaliacao media={nft.avaliacao.media} />
            {nft.avaliacao.total} avaliações de colecionadores
          </span>
        </div>
      </div>
      <div className="flex flex-col gap-3">
        <h2 className="text-f15 font-bold">Sobre este NFT:</h2>
        <p className="text-f14 leading-[22px] text-texto-secundario">{nft.descricao}</p>
      </div>
      <SeletorEdicao {...props} />
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-2">
          <SeletorQuantidade {...props} tamanho="grande" />
          <TotalSelecao {...props} />
        </div>
        <div className="flex gap-2">
          <Botao tamanho="compacto" className="w-[130px] uppercase" {...propsEmBreve}>
            Comprar
          </Botao>
          <Botao tamanho="compacto" variante="contorno" className="w-[130px] gap-2.5 font-medium text-texto-secundario" {...propsEmBreve}>
            <Icone nome="coracao-contorno" tamanho={20} className="text-primaria" />
            Favoritar
          </Botao>
        </div>
      </div>
      <DadosToken nft={nft} />
    </div>
  )
}
