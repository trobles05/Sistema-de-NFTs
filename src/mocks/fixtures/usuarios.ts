import type { ListaCarteiras, Perfil, Usuario } from '@/types'

/** Registro interno do servidor simulado: nunca sai inteiro numa resposta (senhaHash fica no mock). */
export interface UsuarioFixture {
  usuario: Usuario
  senhaHash: string
  perfil: Perfil
  carteiras: ListaCarteiras
  favoritos: string[]
}

/** Senha fictícia dos dois usuários, documentada no README (§12). Na fixture só existe o hash. */
export const SENHA_DEMO = 'Kurio@2026'

const CRIADO_EM = '2026-09-01T12:00:00.000Z'

export function criarUsuarios(): UsuarioFixture[] {
  return [
    {
      usuario: { id: 'usr-ana', nomeUsuario: 'ana.souza', nomeExibicao: 'Ana Souza', email: 'ana@kurio.dev', avatarUrl: null },
      senhaHash:
        'pbkdf2$100000$6b7572696f2d616e612d73616c742d31$ea346dd36f7cd8679abdc70b965b89eb277cc2f71c2bd4a685a7c4cfcb91a38c',
      perfil: {
        nomeExibicao: 'Ana Souza',
        nomeUsuario: 'ana.souza',
        email: 'ana@kurio.dev',
        nomeEns: { nome: 'ana', sufixo: '.eth' },
        apelidoCarteira: 'Principal',
        avatarUrl: null,
      },
      carteiras: {
        principal: {
          id: 'cart-ana-principal',
          papel: 'principal',
          nomeExibicao: 'Ana Souza',
          apelido: 'Principal',
          rede: 'ethereum',
          nomePerfil: 'ana.souza',
          endereco: '0xA91F4c2b7d0E3f5a6B8c9D1e2F3a4B5c6D7eE82C',
          tipoCarteira: 'metamask',
          codigoIndicacao: 'KURIO-ANA',
          email: 'ana@kurio.dev',
          nomeEns: { nome: 'ana', sufixo: '.eth' },
          atualizadaEm: CRIADO_EM,
        },
        secundaria: {
          id: 'cart-ana-reserva',
          papel: 'secundaria',
          nomeExibicao: 'Ana Souza',
          apelido: 'Reserva',
          rede: 'polygon',
          nomePerfil: 'ana.souza',
          endereco: '0x5b3E9d2C1a4F6e8B7c0D9a2E4f6B8d1C3e5A7f90',
          enderecoAlternativo: 'nova.kurio.eth',
          tipoCarteira: 'coinbase',
          codigoIndicacao: 'KURIO-ANA',
          email: 'ana@kurio.dev',
          nomeEns: { nome: 'nova', sufixo: '.eth' },
          atualizadaEm: CRIADO_EM,
        },
      },
      favoritos: ['nft-001', 'nft-003', 'nft-006'],
    },
    {
      // Sem carteiras nem favoritos: exercita estados vazios e o bloqueio de pagamento sem carteira.
      usuario: { id: 'usr-bruno', nomeUsuario: 'bruno.lima', nomeExibicao: 'Bruno Lima', email: 'bruno@kurio.dev', avatarUrl: null },
      senhaHash:
        'pbkdf2$100000$6b7572696f2d6272756e6f2d73616c74$3bf5c1a4ffb2bfa47d97c53eaff4a148270e22cf4c4b064202c488416a45bdfc',
      perfil: {
        nomeExibicao: 'Bruno Lima',
        nomeUsuario: 'bruno.lima',
        email: 'bruno@kurio.dev',
        nomeEns: { nome: 'bruno', sufixo: '.eth' },
        apelidoCarteira: 'Principal',
        avatarUrl: null,
      },
      carteiras: { principal: null, secundaria: null },
      favoritos: [],
    },
  ]
}
