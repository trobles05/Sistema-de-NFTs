import { beforeEach, describe, expect, it, vi } from 'vitest'
import { CHAVE_ARMAZENAMENTO, criarArmazenamentoMemoria, criarBanco, proximoId, type Armazenamento, type Mudanca } from './db'
import { criarNfts, criarUsuarios } from './fixtures'

let armazenamento: Armazenamento

beforeEach(() => {
  armazenamento = criarArmazenamentoMemoria()
})

describe('banco simulado', () => {
  it('começa igual às fixtures', () => {
    const estado = criarBanco({ armazenamento }).ler()
    expect(estado.nfts).toEqual(criarNfts())
    expect(estado.usuarios).toEqual(criarUsuarios())
    expect(estado.pedidos).toEqual({})
  })

  it('persiste alterações e uma nova instância (refresh) enxerga', () => {
    criarBanco({ armazenamento }).alterar((db) => {
      db.usuarios[0]!.favoritos.push('nft-010')
    })
    const depoisDoRefresh = criarBanco({ armazenamento }).ler()
    expect(depoisDoRefresh.usuarios[0]!.favoritos).toContain('nft-010')
  })

  it('não grava nada se a alteração lançar erro no meio', () => {
    const banco = criarBanco({ armazenamento })
    const revisao = banco.ler().revisao
    expect(() =>
      banco.alterar((db) => {
        db.nfts[0]!.nome = 'Alterado pela metade'
        throw new Error('falha no handler')
      }),
    ).toThrow('falha no handler')
    expect(banco.ler().nfts[0]!.nome).toBe('Emerald Ape #042')
    expect(banco.ler().revisao).toBe(revisao)
  })

  it('recusa função assíncrona em alterar', () => {
    expect(() => criarBanco({ armazenamento }).alterar(async () => undefined)).toThrow(TypeError)
  })

  it('resetar restaura integralmente as fixtures', () => {
    const banco = criarBanco({ armazenamento })
    banco.alterar((db) => {
      db.nfts[0]!.edicoes[0]!.disponivel = 0
      db.usuarios[1]!.favoritos.push('nft-001')
      db.carrinhos['usr-ana'] = { itens: [{ id: 'item-0001', nftId: 'nft-001', edicaoId: 'nft-001-1-50', quantidade: 2 }], versao: 1, atualizadoEm: '2026-10-15T12:00:00.000Z' }
      proximoId(db, 'ped')
    })
    banco.resetar()
    const estado = banco.ler()
    expect(estado.nfts).toEqual(criarNfts())
    expect(estado.usuarios).toEqual(criarUsuarios())
    expect(estado.carrinhos).toEqual({})
    expect(estado.sequencias).toEqual({})
  })

  it('volta às fixtures se o dado salvo estiver corrompido ou em outra versão do formato', () => {
    armazenamento.setItem(CHAVE_ARMAZENAMENTO, '{isto não é json')
    expect(criarBanco({ armazenamento }).ler().nfts).toHaveLength(60)

    armazenamento.setItem(CHAVE_ARMAZENAMENTO, JSON.stringify({ versaoEsquema: 0, revisao: 9, nfts: [] }))
    expect(criarBanco({ armazenamento }).ler().nfts).toHaveLength(60)
  })

  it('duas abas no mesmo armazenamento não se sobrescrevem', () => {
    const abaA = criarBanco({ armazenamento })
    const abaB = criarBanco({ armazenamento })
    abaA.ler()
    abaB.ler()
    abaA.alterar((db) => void db.usuarios[0]!.favoritos.push('nft-020'))
    abaB.alterar((db) => void db.usuarios[0]!.favoritos.push('nft-030'))
    expect(criarBanco({ armazenamento }).ler().usuarios[0]!.favoritos).toEqual(['nft-001', 'nft-003', 'nft-006', 'nft-020', 'nft-030'])
  })

  it('reset numa aba é visto pela outra', () => {
    const abaA = criarBanco({ armazenamento })
    const abaB = criarBanco({ armazenamento })
    abaB.alterar((db) => void (db.nfts[0]!.nome = 'Mudado'))
    abaA.resetar()
    expect(abaB.ler().nfts[0]!.nome).toBe('Emerald Ape #042')
  })

  it('avisa os ouvintes só dos NFTs e pedidos cuja versão mudou', () => {
    const banco = criarBanco({ armazenamento })
    const recebidas: Mudanca[] = []
    const cancelar = banco.assinar((m) => recebidas.push(m))

    banco.alterar((db) => {
      db.nfts[2]!.edicoes[2]!.preco = '2.09'
      db.nfts[2]!.versao += 1
      db.nfts[3]!.nome = 'Sem bump de versão não notifica'
    })
    expect(recebidas).toEqual([{ recurso: 'nft', id: 'nft-003' }])

    cancelar()
    banco.alterar((db) => void (db.nfts[0]!.versao += 1))
    expect(recebidas).toHaveLength(1)
  })

  it('um ouvinte com erro não impede os outros nem a gravação', () => {
    const banco = criarBanco({ armazenamento })
    const erro = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    const segundo = vi.fn()
    banco.assinar(() => {
      throw new Error('ouvinte quebrado')
    })
    banco.assinar(segundo)
    banco.alterar((db) => void (db.nfts[0]!.versao += 1))
    expect(segundo).toHaveBeenCalledOnce()
    expect(banco.ler().nfts[0]!.versao).toBe(2)
    erro.mockRestore()
  })

  it('gera ids sequenciais por prefixo', () => {
    const banco = criarBanco({ armazenamento })
    const ids = banco.alterar((db) => [proximoId(db, 'ped'), proximoId(db, 'ped'), proximoId(db, 'cot')])
    expect(ids).toEqual(['ped-0001', 'ped-0002', 'cot-0001'])
  })

  it('segue funcionando em memória se o armazenamento falhar ao gravar', () => {
    const aviso = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    const cheio: Armazenamento = { ...criarArmazenamentoMemoria(), setItem: () => { throw new Error('QuotaExceededError') } }
    const banco = criarBanco({ armazenamento: cheio })
    banco.alterar((db) => void db.usuarios[0]!.favoritos.push('nft-040'))
    expect(banco.ler().usuarios[0]!.favoritos).toContain('nft-040')
    expect(aviso).toHaveBeenCalled()
    aviso.mockRestore()
  })
})
