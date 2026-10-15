import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest'
import { estadoCenario } from '../cenarios'
import { servidor } from '../node'

beforeAll(() => servidor.listen({ onUnhandledRequest: 'error' }))
afterEach(() => estadoCenario.definirCenario('padrao'))
afterAll(() => servidor.close())

describe('GET /api/saude', () => {
  it('responde pelos handlers oficiais, com o cenário ativo', async () => {
    const resposta = await fetch('http://kurio.test/api/saude')
    expect(await resposta.json()).toMatchObject({ status: 'ok', cenario: 'padrao' })
  })

  it('passa pelo porteiro de rede antes (cenário offline derruba a chamada)', async () => {
    estadoCenario.definirCenario('offline')
    await expect(fetch('http://kurio.test/api/saude')).rejects.toThrow()
  })
})
