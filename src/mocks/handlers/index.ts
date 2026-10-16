import { criarHandlerRede } from '../cenarios'
import { handlersCatalogo } from './catalogo'
import { handlersSaude } from './saude'
import { handlersSessao } from './sessao'

/** Ordem importa: o porteiro de rede (latência e falhas do cenário) vem antes de todos. */
export const handlers = [criarHandlerRede(), ...handlersSaude, ...handlersSessao, ...handlersCatalogo]
