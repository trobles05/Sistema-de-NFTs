import { Toaster } from 'sonner'

/**
 * Feedback de mutations e de eventos em tempo real. O sonner anuncia cada aviso numa região
 * aria-live (§8: "feedback acessível para mutations e alterações em tempo real").
 */
export function Avisos() {
  return (
    <Toaster
      theme="dark"
      position="top-center"
      closeButton
      toastOptions={{
        classNames: {
          toast: '!rounded-campo-mobile md:!rounded-campo !border !border-borda-suave !bg-superficie !font-mono !text-texto',
          description: '!text-texto-secundario',
          success: '[&_[data-icon]]:!text-sucesso',
          error: '[&_[data-icon]]:!text-coral',
          actionButton: '!bg-primaria !text-fundo !font-bold',
        },
      }}
    />
  )
}
