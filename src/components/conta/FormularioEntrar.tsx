import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from '@tanstack/react-router'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Botao } from '@/components/ui/Botao'
import { Campo } from '@/components/ui/Campo'
import { Input } from '@/components/ui/Input'
import { InputSenha } from '@/components/ui/InputSenha'
import { useEntrar } from '@/hooks/useSessao'
import { aplicarErrosDoServidor } from '@/lib/formularios'
import { cn } from '@/lib/utils'
import { LoginEntradaSchema, type LoginEntrada } from '@/types'
import { AlertaFormulario } from './AlertaFormulario'

interface FormularioEntrarProps {
  variante: 'modal' | 'tela'
  aoConcluir: () => void
}

export function FormularioEntrar({ variante, aoConcluir }: FormularioEntrarProps) {
  const entrar = useEntrar()
  const [erroGeral, setErroGeral] = useState<string>()
  // Validação no envio e depois ao digitar (modo padrão). Com "onTouched", o foco automático do modal
  // no 1º campo fazia a validação de blur dele sobrescrever os erros do envio.
  const { register, handleSubmit, setError, formState } = useForm<LoginEntrada>({
    resolver: zodResolver(LoginEntradaSchema),
    defaultValues: { email: '', senha: '' },
  })

  const enviar = handleSubmit(async (dados) => {
    setErroGeral(undefined)
    try {
      await entrar.mutateAsync(dados)
      aoConcluir()
    } catch (erro) {
      setErroGeral(aplicarErrosDoServidor(erro, setError, ['email', 'senha']))
    }
  })

  return (
    <form onSubmit={enviar} noValidate className="flex flex-col gap-3">
      <AlertaFormulario mensagem={erroGeral} />
      <Campo rotulo="E-mail" rotuloOculto erro={formState.errors.email?.message}>
        {(controle) => <Input {...controle} {...register('email')} type="email" autoComplete="email" placeholder="contato@email.com" />}
      </Campo>
      <Campo rotulo="Senha" rotuloOculto erro={formState.errors.senha?.message}>
        {(controle) => <InputSenha {...controle} {...register('senha')} autoComplete="current-password" placeholder="Senha" />}
      </Campo>
      <Link
        to="/em-breve"
        search={{ secao: 'Recuperação de senha' }}
        className={cn('self-end text-destaque hover:underline focus-visible:outline-2 focus-visible:outline-destaque', variante === 'modal' ? 'text-f13' : 'text-f14')}
      >
        Esqueceu a senha?
      </Link>
      <Botao type="submit" carregando={entrar.isPending} className={cn('w-full', variante === 'modal' ? 'mt-3 md:h-[45px]' : 'mt-7')}>
        Entrar
      </Botao>
    </form>
  )
}
