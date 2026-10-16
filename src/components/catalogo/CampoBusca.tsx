import { useEffect, useId, useRef, useState, type ComponentProps } from 'react'
import { Icone } from '@/components/ui/Icone'
import { cn } from '@/lib/utils'

interface CampoBuscaProps extends Omit<ComponentProps<'input'>, 'value' | 'onChange'> {
  valor: string
  /** Chamado 300ms depois de a pessoa parar de digitar. */
  aoBuscar: (termo: string) => void
}

/** Campo de busca com espera: não dispara uma consulta (nem um passo no histórico) por letra. */
export function CampoBusca({ valor, aoBuscar, className, ...props }: CampoBuscaProps) {
  const id = useId()
  const [texto, setTexto] = useState(valor)
  const [valorAnterior, setValorAnterior] = useState(valor)
  const aoBuscarRef = useRef(aoBuscar)
  useEffect(() => {
    aoBuscarRef.current = aoBuscar
  })

  // A busca também muda por fora (voltar do navegador, limpar filtros): o campo acompanha.
  if (valor !== valorAnterior) {
    setValorAnterior(valor)
    setTexto(valor)
  }

  useEffect(() => {
    if (texto.trim() === valor.trim()) return
    const espera = setTimeout(() => aoBuscarRef.current(texto.trim()), 300)
    return () => clearTimeout(espera)
  }, [texto, valor])

  return (
    <div className={cn('relative flex items-center', className)}>
      <label htmlFor={id} className="sr-only">
        Buscar NFTs
      </label>
      <Icone nome="busca-mobile" tamanho={22} className="pointer-events-none absolute left-3 text-texto-terciario" />
      <input
        id={id}
        type="search"
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        className="h-[45px] w-full rounded-campo-mobile bg-superficie pr-3 pl-[42px] text-f16 text-texto placeholder:text-f16 placeholder:font-medium placeholder:text-texto-terciario focus-visible:outline-2 focus-visible:outline-destaque md:rounded-campo"
        {...props}
      />
    </div>
  )
}
