import { PaginaInicio } from '@/components/catalogo/PaginaInicio'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { ModalAutenticacao, type ModoAutenticacao } from './ModalAutenticacao'
import { TelaAutenticacao } from './TelaAutenticacao'

/** Desktop: modal sobre a Início (como no Figma). Mobile: tela cheia. */
export function PaginaAutenticacao({ modo, redirect }: { modo: ModoAutenticacao; redirect?: string }) {
  const desktop = useMediaQuery('(min-width: 768px)')
  if (!desktop) return <TelaAutenticacao modo={modo} redirect={redirect} />
  return (
    <>
      <PaginaInicio />
      <ModalAutenticacao modo={modo} redirect={redirect} />
    </>
  )
}
