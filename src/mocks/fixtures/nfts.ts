import type { Categoria, Edicao, ImagemNft, Nft, Rede, RotuloEdicao } from '@/types'
import { multiplicarEth, somarEth, type EthString } from '@/utils/eth'
import { criarSorteio, type Sorteio } from '../aleatorio'

/** Data de referência dos lançamentos: os dados não dependem do relógio de quem roda. */
const DATA_BASE = Date.parse('2026-10-01T12:00:00.000Z')
const HORA = 60 * 60 * 1000
const DIA = 24 * HORA

export const TOTAL_NFTS = 60

const ARTES: Record<ImagemNft, { colecao: string; sufixos: readonly string[]; atributos: readonly string[] }> = {
  'ape-green-jacket': { colecao: 'Kurio Apes', sufixos: ['Ape', 'Vessel'], atributos: ['Óculos', 'Esmeralda', 'Jaqueta'] },
  'nomad-bucket-hat': { colecao: 'Kurio Nomads', sufixos: ['Nomad', 'Bloom'], atributos: ['Chapéu', 'Moletom', 'Lavanda'] },
  'baron-turtleneck': { colecao: 'Kurio Barons', sufixos: ['Baron', 'Regent'], atributos: ['Gola alta', 'Marfim', 'Brinco'] },
  'golden-headphones': { colecao: 'Kurio Frequencies', sufixos: ['Beat', 'Frequency', 'Signal'], atributos: ['Fones', 'Dourado', 'Sintonia'] },
}

const PREFIXOS = ['Amber', 'Crimson', 'Onyx', 'Lunar', 'Solar', 'Velvet', 'Copper', 'Jade', 'Azure', 'Rust', 'Silver', 'Midnight', 'Pixel', 'Ember', 'Sable', 'Cobalt'] as const

const CATEGORIAS: readonly Categoria[] = ['arte-digital', 'fotografia', 'musica', 'arte-3d', 'colecionaveis', 'generativa', 'jogos', 'assinaturas', 'utilidade']
const REDES: readonly Rede[] = ['ethereum', 'polygon', 'solana']

const NOME_REDE: Record<Rede, string> = { ethereum: 'Ethereum', polygon: 'Polygon', solana: 'Solana' }

/** Os 9 NFTs desenhados no Figma, na ordem do grid da tela Início (mais recentes primeiro). */
const DO_FIGMA: readonly { nome: string; imagem: ImagemNft; preco: EthString; precoAnterior?: EthString; raro?: boolean; categoria: Categoria; rede: Rede }[] = [
  { nome: 'Emerald Ape #042', imagem: 'ape-green-jacket', preco: '1.19', categoria: 'arte-digital', rede: 'ethereum' },
  { nome: 'Sage Nomad #009', imagem: 'nomad-bucket-hat', preco: '1.69', categoria: 'arte-digital', rede: 'polygon' },
  { nome: 'Neon Vessel #552', imagem: 'ape-green-jacket', preco: '1.99', precoAnterior: '2.29', raro: true, categoria: 'colecionaveis', rede: 'ethereum' },
  { nome: 'Cosmic Bloom #118', imagem: 'nomad-bucket-hat', preco: '1.29', categoria: 'generativa', rede: 'solana' },
  { nome: 'Violet Nomad #314', imagem: 'nomad-bucket-hat', preco: '1.39', categoria: 'arte-3d', rede: 'ethereum' },
  { nome: 'Ivory Baron #088', imagem: 'baron-turtleneck', preco: '1.79', raro: true, categoria: 'fotografia', rede: 'polygon' },
  { nome: 'Golden Beat #207', imagem: 'golden-headphones', preco: '0.99', categoria: 'musica', rede: 'ethereum' },
  { nome: 'Golden Frequency #071', imagem: 'golden-headphones', preco: '0.59', categoria: 'musica', rede: 'solana' },
  { nome: 'Golden Signal #160', imagem: 'golden-headphones', preco: '0.39', categoria: 'jogos', rede: 'polygon' },
]

function precoAleatorio(sorteio: Sorteio): EthString {
  // Faixa do filtro do Figma (0.02 a 12.30), concentrada abaixo de 3 ETH.
  const centavos = sorteio.chance(0.8) ? sorteio.inteiro(2, 300) : sorteio.inteiro(301, 1230)
  return `${Math.floor(centavos / 100)}.${String(centavos % 100).padStart(2, '0')}`
}

const CONFIG_EDICAO: Record<RotuloEdicao, { multiplicador: number; estoqueMax: number; limitePorPedido: number }> = {
  '1/1': { multiplicador: 5, estoqueMax: 1, limitePorPedido: 1 },
  '1/10': { multiplicador: 2, estoqueMax: 10, limitePorPedido: 3 },
  '1/50': { multiplicador: 1, estoqueMax: 50, limitePorPedido: 10 },
  ABERTA: { multiplicador: 1, estoqueMax: 999, limitePorPedido: 20 },
}

function criarEdicoes(sorteio: Sorteio, nftId: string, precoBase: EthString, precoAnterior: EthString | null, indice: number): Edicao[] {
  const rotulos: RotuloEdicao[] = indice % 4 === 3 ? ['1/1', '1/10', '1/50'] : ['1/1', '1/10', '1/50', 'ABERTA']
  return rotulos.map((rotulo) => {
    const { multiplicador, estoqueMax, limitePorPedido } = CONFIG_EDICAO[rotulo]
    // ABERTA custa o mesmo que 1/50 + 0.01, para a 1/50 ser sempre a edição padrão quando houver estoque.
    const preco = rotulo === 'ABERTA' ? somarEth(precoBase, '0.01') : multiplicarEth(precoBase, multiplicador)
    // A cada 5 NFTs, a edição 1/1 vem esgotada; a cada 7, também a 1/10 (cenário de edição indisponível).
    const esgotada = (rotulo === '1/1' && indice % 5 === 0) || (rotulo === '1/10' && indice % 7 === 0)
    return {
      id: `${nftId}-${rotulo === 'ABERTA' ? 'aberta' : rotulo.replace('/', '-')}`,
      rotulo,
      preco,
      precoAnterior: rotulo === '1/50' ? precoAnterior : null,
      disponivel: esgotada ? 0 : rotulo === '1/1' ? 1 : sorteio.inteiro(Math.min(2, estoqueMax), estoqueMax),
      limitePorPedido,
    }
  })
}

function criarNft(sorteio: Sorteio, indice: number): Nft {
  const doFigma = DO_FIGMA[indice]
  const imagem = doFigma?.imagem ?? sorteio.item(Object.keys(ARTES) as ImagemNft[])
  const arte = ARTES[imagem]
  const numero = doFigma ? Number(doFigma.nome.split('#')[1]) : 600 + indice * 7
  const nome = doFigma?.nome ?? `${sorteio.item(PREFIXOS)} ${sorteio.item(arte.sufixos)} #${String(numero).padStart(3, '0')}`
  const id = `nft-${String(indice + 1).padStart(3, '0')}`
  const categoria = doFigma?.categoria ?? CATEGORIAS[indice % CATEGORIAS.length]!
  const rede = doFigma?.rede ?? REDES[indice % REDES.length]!
  const preco = doFigma?.preco ?? precoAleatorio(sorteio)
  const precoAnterior = doFigma?.precoAnterior ?? (sorteio.chance(0.12) ? somarEth(preco, '0.30') : null)
  const tokenId = `#${String(numero).padStart(4, '0')}`

  return {
    id,
    nome,
    tokenId,
    colecao: arte.colecao,
    categoria,
    rede,
    imagem,
    descricao: `Um colecionável digital finalizado à mão da coleção Kurio Editions, verificado na ${NOME_REDE[rede]}.`,
    detalhes: [
      `${nome} é uma obra digital da coleção ${arte.colecao}. Cada atributo fica armazenado nos metadados do token e verificado na ${NOME_REDE[rede]}.`,
      'A propriedade inclui a arte em alta resolução, lançamentos exclusivos para colecionadores e um registro permanente de procedência registrada na rede.',
    ],
    atributos: [...arte.atributos.slice(0, 2), ...(doFigma?.raro ? ['Raro'] : [])],
    contrato: { endereco: `0x${sorteio.hex(40)}`, padrao: 'ERC-721', royaltyPercentual: 5 },
    avaliacao: { media: sorteio.inteiro(35, 50) / 10, total: sorteio.inteiro(0, 120) },
    raro: doFigma?.raro ?? sorteio.chance(0.15),
    emAlta: indice % 4 === 1,
    // Os do Figma são os mais recentes (hora a hora); os demais, um por dia antes deles.
    lancadoEm: new Date(doFigma ? DATA_BASE - indice * HORA : DATA_BASE - (indice - DO_FIGMA.length + 1) * DIA).toISOString(),
    edicoes: criarEdicoes(sorteio, id, preco, precoAnterior, indice),
    versao: 1,
  }
}

/** Gera sempre o mesmo catálogo. Cada chamada devolve objetos novos (seguro para reset). */
export function criarNfts(): Nft[] {
  const sorteio = criarSorteio(20261015)
  return Array.from({ length: TOTAL_NFTS }, (_, indice) => criarNft(sorteio, indice))
}
