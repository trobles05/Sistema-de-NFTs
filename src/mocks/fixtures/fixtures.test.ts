import { describe, expect, it } from 'vitest'
import { CategoriaSchema, CarteiraSchema, NftSchema, PerfilSchema, RedeSchema, UsuarioSchema } from '@/types'
import { compararEth } from '@/utils/eth'
import { verificarSenha } from '../senha'
import { CUPONS, criarNfts, criarUsuarios, SENHA_DEMO, TAXAS_REDE, TOTAL_NFTS } from '.'

describe('fixtures de NFTs', () => {
  const nfts = criarNfts()

  it('todo NFT passa no contrato e os ids são únicos', () => {
    for (const nft of nfts) expect(NftSchema.safeParse(nft).success, nft.id).toBe(true)
    expect(new Set(nfts.map((n) => n.id)).size).toBe(TOTAL_NFTS)
    expect(new Set(nfts.flatMap((n) => n.edicoes.map((e) => e.id))).size).toBe(nfts.flatMap((n) => n.edicoes).length)
  })

  it('é determinístico e devolve objetos novos a cada chamada', () => {
    const outra = criarNfts()
    expect(outra).toEqual(nfts)
    expect(outra[0]).not.toBe(nfts[0])
  })

  it('começa pelos 9 do Figma com os preços desenhados', () => {
    expect(nfts.slice(0, 3).map((n) => n.nome)).toEqual(['Emerald Ape #042', 'Sage Nomad #009', 'Neon Vessel #552'])
    const neon = nfts[2]!.edicoes.find((e) => e.rotulo === '1/50')
    expect(neon).toMatchObject({ preco: '1.99', precoAnterior: '2.29' })
  })

  it('tem variedade para filtros e paginação', () => {
    expect(new Set(nfts.map((n) => n.categoria))).toEqual(new Set(CategoriaSchema.options))
    expect(new Set(nfts.map((n) => n.rede))).toEqual(new Set(RedeSchema.options))
    expect(nfts.some((n) => n.raro)).toBe(true)
    expect(nfts.some((n) => n.emAlta)).toBe(true)
    expect(nfts.some((n) => n.edicoes.some((e) => e.precoAnterior))).toBe(true)

    const precos = nfts.map((n) => n.edicoes.find((e) => e.rotulo === '1/50')!.preco)
    for (const preco of precos) {
      expect(compararEth(preco, '0.02')).toBeGreaterThanOrEqual(0)
      expect(compararEth(preco, '12.30')).toBeLessThanOrEqual(0)
    }
  })

  it('tem edições esgotadas e a 1/50 sempre disponível como edição padrão', () => {
    const edicoes = nfts.flatMap((n) => n.edicoes)
    expect(edicoes.some((e) => e.disponivel === 0)).toBe(true)
    for (const nft of nfts) expect(nft.edicoes.find((e) => e.rotulo === '1/50')!.disponivel).toBeGreaterThan(0)
  })
})

describe('fixtures de usuários', () => {
  const usuarios = criarUsuarios()

  it('tem ao menos 2 usuários válidos e com e-mails distintos', () => {
    expect(usuarios.length).toBeGreaterThanOrEqual(2)
    expect(new Set(usuarios.map((u) => u.usuario.email)).size).toBe(usuarios.length)
    for (const { usuario, perfil, carteiras } of usuarios) {
      expect(UsuarioSchema.safeParse(usuario).success).toBe(true)
      expect(PerfilSchema.safeParse(perfil).success).toBe(true)
      for (const carteira of [carteiras.principal, carteiras.secundaria]) {
        if (carteira) expect(CarteiraSchema.safeParse(carteira).success).toBe(true)
      }
    }
  })

  it('guarda só o hash e a senha documentada confere', async () => {
    for (const { senhaHash } of usuarios) {
      expect(senhaHash).not.toContain(SENHA_DEMO)
      expect(await verificarSenha(SENHA_DEMO, senhaHash)).toBe(true)
      expect(await verificarSenha('senha-errada', senhaHash)).toBe(false)
    }
  })

  it('favoritos apontam para NFTs existentes', () => {
    const ids = new Set(criarNfts().map((n) => n.id))
    for (const { favoritos } of usuarios) for (const id of favoritos) expect(ids.has(id)).toBe(true)
  })
})

describe('cupons e taxas', () => {
  it('tem cupom válido sem validade, válido com validade e expirado', () => {
    const agora = Date.parse('2026-10-15T12:00:00.000Z')
    const vigentes = CUPONS.filter((c) => c.validoAte === null || Date.parse(c.validoAte) > agora)
    expect(vigentes.map((c) => c.codigo)).toEqual(['KURIO10', 'LANCAMENTO5'])
    expect(CUPONS.find((c) => c.codigo === 'EXPIRADO20')!.validoAte).not.toBeNull()
  })

  it('taxa da Ethereum é a do Figma', () => {
    expect(TAXAS_REDE.ethereum).toBe('0.016')
  })
})
