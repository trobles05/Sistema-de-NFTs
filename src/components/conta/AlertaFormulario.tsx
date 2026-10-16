import { Icone } from '@/components/ui/Icone'

/** Erro geral do formulário (ex.: "E-mail ou senha incorretos"), anunciado assim que aparece. */
export function AlertaFormulario({ mensagem }: { mensagem?: string }) {
  if (!mensagem) return null
  return (
    <p role="alert" className="flex items-center gap-2 rounded-campo-mobile border border-coral/60 px-4 py-3 text-f14 text-coral md:rounded-campo">
      <Icone nome="alerta" tamanho={18} />
      {mensagem}
    </p>
  )
}
