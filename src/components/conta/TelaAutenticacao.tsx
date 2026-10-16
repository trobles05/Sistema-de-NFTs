import { Link, useNavigate } from '@tanstack/react-router'
import { destinoSeguro } from '@/lib/redirecionamento'
import { BotoesSociais } from './BotoesSociais'
import { FormularioCadastro } from './FormularioCadastro'
import { FormularioEntrar } from './FormularioEntrar'
import type { ModoAutenticacao } from './ModalAutenticacao'

const classeLink = 'text-f15 text-texto-secundario hover:text-destaque focus-visible:outline-2 focus-visible:outline-destaque'

/** Tela cheia do Figma (Mobile / Login e Cadastro): KURIO grande, título, formulário e redes. */
export function TelaAutenticacao({ modo, redirect }: { modo: ModoAutenticacao; redirect?: string }) {
  const navigate = useNavigate()
  const concluir = () => navigate({ href: destinoSeguro(redirect), replace: true })

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[414px] flex-col gap-10 px-7 pt-20 pb-6">
      <Link to="/" className="grid h-[136px] place-items-center text-f32 font-bold tracking-[0.1em] focus-visible:outline-2 focus-visible:outline-destaque">
        KURIO
      </Link>
      <h1 className="text-center text-f20 leading-4 font-bold">{modo === 'entrar' ? 'Entrar' : 'Criar perfil de colecionador'}</h1>
      {modo === 'entrar' ? <FormularioEntrar variante="tela" aoConcluir={concluir} /> : <FormularioCadastro variante="tela" aoConcluir={concluir} />}
      <BotoesSociais />
      <p className="text-center">
        {modo === 'entrar' ? (
          <Link to="/cadastro" search={{ redirect }} replace className={classeLink}>
            Novo na Kurio? Crie uma conta
          </Link>
        ) : (
          <Link to="/entrar" search={{ redirect }} replace className={classeLink}>
            Já tem uma conta? Entre
          </Link>
        )}
      </p>
    </div>
  )
}
