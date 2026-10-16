import { avisar } from '@/components/ui/avisar'

/**
 * Ações cuja funcionalidade chega em tasks seguintes (favoritos: T-018; carrinho/compra: T-020).
 * Os botões mantêm o visual do Figma, mas ficam `aria-disabled` e avisam com honestidade (§3).
 */
export const propsEmBreve = {
  'aria-disabled': true,
  onClick: () => avisar('Disponível em breve', { description: 'Esta ação ainda não faz parte desta versão da demonstração.' }),
} as const
