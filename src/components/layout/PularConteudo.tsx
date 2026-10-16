/** Primeiro item focável da página: leva o teclado direto ao conteúdo, pulando o header. */
export function PularConteudo() {
  return (
    <a
      href="#conteudo"
      className="fixed top-2 left-2 z-[60] -translate-y-24 rounded-campo bg-primaria px-4 py-2 text-f14 font-bold text-fundo transition-transform focus:translate-y-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-destaque"
    >
      Pular para o conteúdo
    </a>
  )
}
