import { describe, expect, it } from 'vitest'
import { cn } from './utils'

describe('cn', () => {
  it('mantém tamanho de fonte do Figma junto com cor de texto', () => {
    expect(cn('text-f13 text-texto-secundario')).toBe('text-f13 text-texto-secundario')
    expect(cn('text-fundo text-f16', 'md:text-f14')).toBe('text-fundo text-f16 md:text-f14')
  })

  it('resolve conflito entre dois tamanhos e entre dois raios', () => {
    expect(cn('text-f14', 'text-f16')).toBe('text-f16')
    expect(cn('rounded-campo-mobile', 'rounded-campo')).toBe('rounded-campo')
  })
})
