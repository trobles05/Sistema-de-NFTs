import { describe, expect, it } from 'vitest'
import { CriarPedidoEntradaSchema, EVENTOS, EventoSchema, PedidoSchema, type Pedido } from '@/types'

const hash = `0x${'a'.repeat(64)}`

const pedido: Pedido = {
  id: 'p1',
  status: 'confirmado',
  cotacaoId: 'c1',
  itens: [
    {
      nftId: 'n1', edicaoId: 'e1', nome: 'Emerald Ape #042', tokenId: '#0042', imagem: 'ape-green-jacket',
      rotuloEdicao: '1/50', precoUnitario: '1.19', quantidade: 2, subtotal: '2.38',
    },
  ],
  subtotal: '2.38',
  cupom: null,
  desconto: '0',
  taxaRede: '0.016',
  total: '2.396',
  rede: 'ethereum',
  carteira: { id: 'w1', tipoCarteira: 'metamask', endereco: '0xA91F4c2b7d0E3f5a6B8c9D1e2F3a4B5c6D7eE82C', apelido: 'Principal' },
  transacao: { hash, explorerUrl: `https://sepolia.etherscan.io/tx/${hash}` },
  motivoRecusa: null,
  criadoEm: '2026-07-29T12:00:00.000Z',
  atualizadoEm: '2026-07-29T12:00:05.000Z',
  versao: 2,
}

describe('pedidos', () => {
  it('aceita o recibo com snapshot completo', () => {
    expect(PedidoSchema.safeParse(pedido).success).toBe(true)
  })

  it('recusa status fora de pendente/confirmado/recusado e hash de transação inválido', () => {
    expect(PedidoSchema.safeParse({ ...pedido, status: 'pago' }).success).toBe(false)
    expect(PedidoSchema.safeParse({ ...pedido, transacao: { hash: '0x123', explorerUrl: 'https://x.dev' } }).success).toBe(false)
  })

  it('criação exige cotação, carteira e dados do colecionador válidos', () => {
    const r = CriarPedidoEntradaSchema.safeParse({ cotacaoId: 'c1', carteiraId: 'w1', dadosColecionador: { nomeUsuario: 'ana' } })
    expect(r.success).toBe(false)
    expect(r.error?.issues.some((i) => i.path.join('.') === 'dadosColecionador.endereco')).toBe(true)
  })
})

describe('eventos', () => {
  const nftAtualizado = {
    id: '2f1c1f2e-8b3a-4c5d-9e6f-7a8b9c0d1e2f',
    tipo: EVENTOS.nftAtualizado,
    recurso: { tipo: 'nft', id: 'n1' },
    versao: 3,
    ocorridoEm: '2026-10-15T20:00:00.000Z',
    dados: { edicoes: [{ id: 'e1', preco: '1.29', precoAnterior: '1.19', disponivel: 4 }] },
  }

  it('identifica nft.updated pelo tipo e mantém preço como string decimal', () => {
    const evento = EventoSchema.parse(nftAtualizado)
    expect(evento.tipo).toBe('nft.updated')
    if (evento.tipo === 'nft.updated') expect(evento.dados.edicoes[0]?.preco).toBe('1.29')
  })

  it('recusa evento sem versão ou sem identidade estável', () => {
    expect(EventoSchema.safeParse({ ...nftAtualizado, versao: undefined }).success).toBe(false)
    expect(EventoSchema.safeParse({ ...nftAtualizado, id: 'evento-1' }).success).toBe(false)
  })

  it('order.updated exige o usuário dono do pedido', () => {
    const pedidoAtualizado = {
      id: '3a2b1c0d-9e8f-4a7b-8c6d-5e4f3a2b1c0d',
      tipo: EVENTOS.pedidoAtualizado,
      recurso: { tipo: 'pedido', id: 'p1' },
      versao: 2,
      ocorridoEm: '2026-10-15T20:00:00.000Z',
      dados: { status: 'recusado', transacao: null, motivoRecusa: 'Pagamento recusado pela carteira' },
    }
    expect(EventoSchema.safeParse(pedidoAtualizado).success).toBe(false)
    expect(EventoSchema.safeParse({ ...pedidoAtualizado, usuarioId: 'u1' }).success).toBe(true)
  })
})
