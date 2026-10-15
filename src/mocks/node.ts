import { setupServer } from 'msw/node'
import { handlers } from './handlers'

/** Mesmos handlers do navegador, para testes em Node. */
export const servidor = setupServer(...handlers)
