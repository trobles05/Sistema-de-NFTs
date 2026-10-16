import { Link, useNavigate } from '@tanstack/react-router'
import { Modal, ModalConteudo } from '@/components/ui/Modal'
import { destinoSeguro } from '@/lib/redirecionamento'
import { cn } from '@/lib/utils'
import { BotoesSociais } from './BotoesSociais'
import { FormularioCadastro } from './FormularioCadastro'
import { FormularioEntrar } from './FormularioEntrar'

export type ModoAutenticacao = 'entrar' | 'cadastro'

const SUBTITULOS: Record<ModoAutenticacao, string> = {
  entrar: 'Entre para gerenciar sua carteira, coleção e perfil de criador.',
  cadastro: 'Crie seu perfil de colecionador e conecte uma carteira quando quiser.',
}

const classeAba = (ativa: boolean) =>
  cn('focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-destaque', ativa ? 'text-destaque' : 'text-texto hover:text-destaque')

const classeLinkRodape = 'text-f15 text-texto-secundario hover:text-destaque focus-visible:outline-2 focus-visible:outline-destaque'

/** Modal do Figma (Desktop / Login e Cadastro): abas "Entrar | Criar conta" sobre a Início. */
export function ModalAutenticacao({ modo, redirect }: { modo: ModoAutenticacao; redirect?: string }) {
  const navigate = useNavigate()
  const voltar = () => navigate({ href: destinoSeguro(redirect), replace: true })

  return (
    <Modal open onOpenChange={(aberto) => !aberto && voltar()}>
      <ModalConteudo titulo={modo === 'entrar' ? 'Entrar' : 'Criar conta'} tituloOculto classNameCorpo="px-20 pt-0 pb-0">
        <nav aria-label="Acesso à conta" className="flex items-center justify-center gap-2 pt-12 text-f18 tracking-[0.06em]">
          <Link to="/entrar" search={{ redirect }} replace aria-current={modo === 'entrar' ? 'page' : undefined} className={classeAba(modo === 'entrar')}>
            Entrar
          </Link>
          <span aria-hidden className="h-5 w-px bg-primaria" />
          <Link to="/cadastro" search={{ redirect }} replace aria-current={modo === 'cadastro' ? 'page' : undefined} className={classeAba(modo === 'cadastro')}>
            Criar conta
          </Link>
        </nav>
        <p className="mx-auto mt-11 mb-5 max-w-[360px] text-center text-f13 leading-4">{SUBTITULOS[modo]}</p>
        {modo === 'entrar' ? <FormularioEntrar variante="modal" aoConcluir={voltar} /> : <FormularioCadastro variante="modal" aoConcluir={voltar} />}
        <div className="mt-8">
          <BotoesSociais divisorLarguraTotal />
        </div>
        {/* Além das abas, o atalho de texto do mobile: deixa explícito que dá para alternar entre as telas. */}
        <p className="mt-8 pb-10 text-center">
          {modo === 'entrar' ? (
            <Link to="/cadastro" search={{ redirect }} replace className={classeLinkRodape}>
              Novo na Kurio? Crie uma conta
            </Link>
          ) : (
            <Link to="/entrar" search={{ redirect }} replace className={classeLinkRodape}>
              Já tem uma conta? Entre
            </Link>
          )}
        </p>
      </ModalConteudo>
    </Modal>
  )
}
