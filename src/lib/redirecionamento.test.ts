import { describe, expect, it } from 'vitest'
import { destinoSeguro } from './redirecionamento'

describe('destinoSeguro', () => {
  it('mantém caminhos internos com busca e âncora', () => {
    expect(destinoSeguro('/perfil')).toBe('/perfil')
    expect(destinoSeguro('/?pagina=2#catalogo')).toBe('/?pagina=2#catalogo')
  })

  it('recusa endereço externo, protocolo relativo e barra invertida', () => {
    for (const malicioso of ['https://site-falso.com', '//site-falso.com', '/\\site-falso.com', 'javascript:alert(1)', 'perfil']) {
      expect(destinoSeguro(malicioso)).toBe('/')
    }
  })

  it('não volta para as próprias telas de autenticação nem aceita vazio', () => {
    expect(destinoSeguro('/entrar?redirect=/perfil')).toBe('/')
    expect(destinoSeguro('/cadastro')).toBe('/')
    expect(destinoSeguro(undefined)).toBe('/')
    expect(destinoSeguro('/entrada-vip')).toBe('/entrada-vip')
  })
})
