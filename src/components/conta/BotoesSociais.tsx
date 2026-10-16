import facebook from '@/assets/icons/sociais/facebook-logo.svg'
import { avisar } from '@/components/ui/avisar'
import { cn } from '@/lib/utils'
import { LogoGoogle } from './LogoGoogle'

const classeBotao =
  'flex h-10 w-full items-center justify-center gap-3 rounded-social border border-borda text-f13 font-medium text-texto-secundario transition-colors hover:border-borda-suave focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-destaque'

/** Fora do escopo: em vez de simular um login social, avisa com clareza. */
function avisarForaDoEscopo(provedor: string) {
  avisar(`Entrar com ${provedor} não faz parte desta demonstração`, { description: 'Use e-mail e senha.' })
}

/** "Ou continue com" + Google/Facebook. No modal desktop o fio ocupa a largura toda do modal. */
export function BotoesSociais({ divisorLarguraTotal = false }: { divisorLarguraTotal?: boolean }) {
  return (
    <div className="flex flex-col gap-3">
      <div className={cn('flex items-center gap-2.5', divisorLarguraTotal && '-mx-20')}>
        <span aria-hidden className="h-px flex-1 bg-borda" />
        <span className="text-f13 leading-4 text-texto">Ou continue com</span>
        <span aria-hidden className="h-px flex-1 bg-borda" />
      </div>
      <div className="flex flex-col gap-4 md:gap-3">
        <button type="button" className={classeBotao} onClick={() => avisarForaDoEscopo('Google')}>
          <LogoGoogle />
          Continuar com Google
        </button>
        <button type="button" className={classeBotao} onClick={() => avisarForaDoEscopo('Facebook')}>
          <img src={facebook} alt="" width={20} height={20} />
          Continuar com Facebook
        </button>
      </div>
    </div>
  )
}
