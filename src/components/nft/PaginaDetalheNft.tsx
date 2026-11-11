import { Link } from '@tanstack/react-router'
import { EstadoErro } from '@/components/catalogo/EstadosCatalogo'
import { Breadcrumb } from '@/components/ui/Breadcrumb'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { useNft } from '@/hooks/useNft'
import { ErroHttp } from '@/lib/erros'
import { limiteQuantidade, selecionarEdicao } from '@/lib/detalhe'
import { DetalheMobile } from './DetalheMobile'
import { EsqueletoDetalhe, NftNaoEncontrado } from './EstadosDetalhe'
import { GaleriaNft } from './GaleriaNft'
import { InfoNftDesktop } from './InfoNft'

interface PaginaDetalheNftProps {
  id: string
  edicaoId?: string
  quantidade: number
  aoMudar: (mudanca: { edicao?: string; quantidade?: number }) => void
}

/** Detalhes do NFT: acesso direto, inexistente, edição indisponível e limite de quantidade (§3). */
export function PaginaDetalheNft({ id, edicaoId, quantidade, aoMudar }: PaginaDetalheNftProps) {
  const consulta = useNft(id)
  const desktop = useMediaQuery('(min-width: 768px)')
  const nft = consulta.data

  const conteudo = (() => {
    if (consulta.isError && !nft) {
      if (consulta.error instanceof ErroHttp && consulta.error.codigo === 'NAO_ENCONTRADO') return <NftNaoEncontrado />
      return <EstadoErro erro={consulta.error} tentando={consulta.isFetching} aoTentar={() => void consulta.refetch()} />
    }
    if (!nft) {
      return (
        <>
          <p className="sr-only" aria-live="polite">
            Carregando NFT…
          </p>
          <EsqueletoDetalhe />
        </>
      )
    }

    const selecao = selecionarEdicao(nft, edicaoId)
    // A quantidade sempre cabe no limite da edição atual (trocar de edição ajusta sozinho).
    const qtd = Math.min(Math.max(quantidade, 1), Math.max(limiteQuantidade(selecao.edicao), 1))
    const props = {
      nft,
      selecao,
      quantidade: qtd,
      aoMudarEdicao: (edicao: string) => aoMudar({ edicao }),
      aoMudarQuantidade: (novaQuantidade: number) => aoMudar({ quantidade: novaQuantidade }),
    }

    if (!desktop) return <DetalheMobile {...props} />
    return (
      <div className="flex gap-8">
        <GaleriaNft nft={nft} />
        <InfoNftDesktop {...props} />
      </div>
    )
  })()

  // No mobile a tela é cheia (Figma): sem breadcrumb nem margens; os estados de carga/erro têm respiro.
  if (!desktop && nft) return conteudo
  return (
    <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-3 px-4 pt-6 md:pt-8 xl:px-0">
      <Breadcrumb
        className="hidden md:block"
        trilha={[
          { rotulo: 'Início', link: <Link to="/">Início</Link> },
          { rotulo: 'Mercado', link: <Link to="/" hash="catalogo">Mercado</Link> },
        ]}
      />
      {conteudo}
    </div>
  )
}
