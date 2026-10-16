import { describe, expect, it } from 'vitest'
import { criarNfts } from '@/mocks/fixtures'
import { limiteQuantidade, motivoLimite, selecionarEdicao } from './detalhe'

const nft = criarNfts()[0]! // Emerald Ape: 1/1 e 1/10 esgotadas, 1/50 padrão

describe('selecionarEdicao', () => {
  it('sem edição na URL usa a padrão (1/50); edição inexistente também cai na padrão', () => {
    expect(selecionarEdicao(nft, undefined).edicao.rotulo).toBe('1/50')
    expect(selecionarEdicao(nft, 'nao-existe').edicao.rotulo).toBe('1/50')
  })

  it('edição esgotada vinda da URL é respeitada e marcada como esgotada', () => {
    const { edicao, esgotada } = selecionarEdicao(nft, 'nft-001-1-1')
    expect(edicao.rotulo).toBe('1/1')
    expect(esgotada).toBe(true)
  })
})

describe('limite de quantidade', () => {
  it('é o menor entre estoque e limite por pedido, e explica o motivo', () => {
    expect(limiteQuantidade({ id: 'e', rotulo: '1/10', preco: '1', precoAnterior: null, disponivel: 8, limitePorPedido: 3 })).toBe(3)
    expect(motivoLimite({ id: 'e', rotulo: '1/10', preco: '1', precoAnterior: null, disponivel: 8, limitePorPedido: 3 })).toBe('Limite de 3 por pedido.')
    expect(limiteQuantidade({ id: 'e', rotulo: '1/10', preco: '1', precoAnterior: null, disponivel: 2, limitePorPedido: 3 })).toBe(2)
    expect(motivoLimite({ id: 'e', rotulo: '1/10', preco: '1', precoAnterior: null, disponivel: 2, limitePorPedido: 3 })).toBe('Restam 2 unidades.')
    expect(limiteQuantidade({ id: 'e', rotulo: '1/1', preco: '1', precoAnterior: null, disponivel: 0, limitePorPedido: 1 })).toBe(0)
  })
})
