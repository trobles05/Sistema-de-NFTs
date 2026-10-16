import { Botao } from '@/components/ui/Botao'
import { Icone } from '@/components/ui/Icone'
import { mensagemAmigavel } from '@/lib/erros'

/** O Figma não desenhou estes estados: seguem a identidade (superfície, coral para erro, botões da T-010). */
function Quadro({ icone, titulo, children, alerta = false }: { icone: React.ReactNode; titulo: string; children: React.ReactNode; alerta?: boolean }) {
  return (
    <div role={alerta ? 'alert' : undefined} className="flex flex-col items-center gap-4 rounded-campo-mobile bg-superficie px-6 py-16 text-center md:rounded-none md:py-24">
      {icone}
      <p className="text-f18 font-bold">{titulo}</p>
      {children}
    </div>
  )
}

export function EstadoVazio({ aoLimpar }: { aoLimpar: () => void }) {
  return (
    <Quadro icone={<Icone nome="busca" tamanho={32} className="text-texto-terciario" />} titulo="Nenhum NFT encontrado">
      <p className="max-w-[360px] text-f14 leading-[22px] text-texto-secundario">Tente outros termos ou remova alguns filtros.</p>
      <Botao variante="contorno" onClick={aoLimpar} className="mt-2">
        Limpar filtros
      </Botao>
    </Quadro>
  )
}

export function EstadoErro({ erro, tentando, aoTentar }: { erro: unknown; tentando: boolean; aoTentar: () => void }) {
  return (
    <Quadro alerta icone={<Icone nome="alerta" tamanho={32} className="text-coral" />} titulo="Não foi possível carregar os NFTs">
      <p className="max-w-[360px] text-f14 leading-[22px] text-texto-secundario">{mensagemAmigavel(erro)}</p>
      <Botao onClick={aoTentar} carregando={tentando} className="mt-2">
        Tentar novamente
      </Botao>
    </Quadro>
  )
}

/** A lista continua na tela; só avisa que a atualização em segundo plano falhou. */
export function AvisoAtualizacao({ tentando, aoTentar }: { tentando: boolean; aoTentar: () => void }) {
  return (
    <div role="status" className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-campo border border-coral/50 px-4 py-3 text-f14">
      <span className="flex items-center gap-2 text-coral">
        <Icone nome="alerta" tamanho={18} />
        Não foi possível atualizar o catálogo.
      </span>
      <Botao variante="link" onClick={aoTentar} carregando={tentando} className="text-f14">
        Tentar novamente
      </Botao>
    </div>
  )
}
