import { createFileRoute } from '@tanstack/react-router'
import { Botao } from '@/components/ui/Botao'
import { useSair, useSessao } from '@/hooks/useSessao'

/** Provisória: a tela real (com o "Sair" do menu lateral do Figma) chega na T-022. */
export const Route = createFileRoute('/_loja/_privado/perfil')({
  staticData: { secao: 'inicio', divisor: true, barraAbas: true },
  component: Perfil,
})

function Perfil() {
  const { usuario } = useSessao()
  const sair = useSair()
  return (
    <section className="mx-auto flex max-w-[600px] flex-col items-center gap-3 px-4 py-24 text-center">
      <h1 className="text-f24 font-bold">Perfil do colecionador</h1>
      <p className="text-f14 text-texto-secundario">{usuario ? `Olá, ${usuario.nomeExibicao}. ` : ''}Tela em construção.</p>
      <Botao variante="contorno" className="mt-4" carregando={sair.isPending} onClick={() => sair.mutate()}>
        Sair
      </Botao>
    </section>
  )
}
