import { http, HttpResponse } from 'msw'
import { estadoCenario } from '../cenarios'
import { banco } from '../db'

/** Prova que o servidor simulado está ativo e qual cenário vale. */
export const handlersSaude = [
  http.get('*/api/saude', () =>
    HttpResponse.json({ status: 'ok', cenario: estadoCenario.cenarioAtual().nome, revisao: banco.ler().revisao }),
  ),
]
