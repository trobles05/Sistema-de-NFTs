import type { CodigoErro } from '@/types'
import { criarSorteio } from '../aleatorio'
import { armazenamentoPadrao, type Armazenamento } from '../armazenamento'
import { CENARIOS, ehNomeCenario, type Cenario, type RegraRede } from './cenarios'

export const CHAVE_CENARIO = 'kurio:mock-cenario'
const SEMENTE_LATENCIA = 20261015

export type DecisaoRede = {
  latenciaMs: number
  falha: null | 'rede' | { status: number; codigo: CodigoErro; mensagem: string }
}

function casaRota(regra: RegraRede, metodo: string, caminho: string): boolean {
  const [metodoRegra = '*', padrao = ''] = regra.rota.split(' ')
  if (metodoRegra !== '*' && metodoRegra !== metodo.toUpperCase()) return false
  const expressao = padrao
    .split(/(\*|:[a-zA-Z]+)/)
    .map((trecho) => (trecho === '*' ? '.*' : trecho.startsWith(':') ? '[^/]+' : trecho.replace(/[.+?^${}()|[\]\\]/g, '\\$&')))
    .join('')
  return new RegExp(`^${expressao}$`).test(caminho)
}

export function criarEstadoCenario(opcoes: { armazenamento?: Armazenamento } = {}) {
  let armazenamento = opcoes.armazenamento
  const storage = () => (armazenamento ??= armazenamentoPadrao())
  let cenario: Cenario | null = null
  let contadores = new Map<string, number>()
  let sorteio = criarSorteio(SEMENTE_LATENCIA)

  function reiniciarContadores() {
    contadores = new Map()
    sorteio = criarSorteio(SEMENTE_LATENCIA)
  }

  function contar(chave: string): number {
    const atual = contadores.get(chave) ?? 0
    contadores.set(chave, atual + 1)
    return atual
  }

  function cenarioAtual(): Cenario {
    if (!cenario) {
      const salvo = storage().getItem(CHAVE_CENARIO)
      cenario = salvo && ehNomeCenario(salvo) ? CENARIOS[salvo] : CENARIOS.padrao
    }
    return cenario
  }

  function definirCenario(nome: string): Cenario {
    if (!ehNomeCenario(nome)) {
      console.warn(`[mocks] Cenário "${nome}" não existe; usando "padrao".`)
      return definirCenario('padrao')
    }
    cenario = CENARIOS[nome]
    storage().setItem(CHAVE_CENARIO, nome)
    reiniciarContadores()
    return cenario
  }

  return {
    cenarioAtual,
    definirCenario,
    reiniciarContadores,

    /** Lê `?cenario=<nome>` e `?reset-mocks` da URL. Quem chama decide o que fazer com `resetar`. */
    selecionarPelaUrl(url: URL): { cenario: Cenario; resetar: boolean } {
      const nome = url.searchParams.get('cenario')
      return { cenario: nome ? definirCenario(nome) : cenarioAtual(), resetar: url.searchParams.has('reset-mocks') }
    },

    /** Decide latência e falha de uma requisição segundo as regras do cenário ativo. */
    avaliar(metodo: string, caminho: string): DecisaoRede {
      const decisao: DecisaoRede = { latenciaMs: 0, falha: null }
      let latenciaDefinida = false
      cenarioAtual().regras.forEach((regra, indice) => {
        if (!casaRota(regra, metodo, caminho)) return

        if (!latenciaDefinida && (regra.sequenciaLatenciaMs || regra.latenciaMs)) {
          latenciaDefinida = true
          if (regra.sequenciaLatenciaMs?.length) {
            const ordem = contar(`seq:${indice}`)
            decisao.latenciaMs = regra.sequenciaLatenciaMs[ordem % regra.sequenciaLatenciaMs.length]!
          } else if (regra.latenciaMs) {
            decisao.latenciaMs = sorteio.inteiro(regra.latenciaMs[0], regra.latenciaMs[1])
          }
        }

        if (!decisao.falha && (regra.erro || regra.falhaDeRede)) {
          const ocorrencias = contar(`falha:${indice}:${metodo.toUpperCase()} ${caminho}`)
          if (regra.vezes === undefined || ocorrencias < regra.vezes) {
            decisao.falha = regra.falhaDeRede ? 'rede' : regra.erro!
          }
        }
      })
      return decisao
    },
  }
}

export type EstadoCenario = ReturnType<typeof criarEstadoCenario>

/** Instância única usada pelos handlers do MSW. */
export const estadoCenario = criarEstadoCenario()
