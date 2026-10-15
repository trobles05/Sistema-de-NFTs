import { criarHandlerRede } from '../cenarios'
import { handlersSaude } from './saude'

/** Ordem importa: o porteiro de rede (latência e falhas do cenário) vem antes de todos. */
export const handlers = [criarHandlerRede(), ...handlersSaude]
