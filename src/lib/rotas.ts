import type { StaticDataRouteOption } from '@tanstack/react-router'

declare module '@tanstack/react-router' {
  /** Metadados que cada rota declara em `staticData` para o layout da loja. */
  interface StaticDataRouteOption {
    /** Item ativo do menu do header. */
    secao?: 'inicio' | 'mercado'
    /** Fio sob o header: só Início, Perfil e Carteiras; as telas de compra ("Mercado") não têm. */
    divisor?: boolean
    /** Tab bar mobile: só nas telas de navegação principal (detalhe, carrinho e pagamento têm barra própria). */
    barraAbas?: boolean
  }
}

export type DadosLayout = Pick<StaticDataRouteOption, 'secao' | 'divisor' | 'barraAbas'>
