import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Botao } from '@/components/ui/Botao'
import { Campo } from '@/components/ui/Campo'
import { Input } from '@/components/ui/Input'
import { InputSenha } from '@/components/ui/InputSenha'
import { useCadastrar } from '@/hooks/useSessao'
import { aplicarErrosDoServidor } from '@/lib/formularios'
import { cn } from '@/lib/utils'
import { CadastroEntradaSchema, type CadastroEntrada } from '@/types'
import { AlertaFormulario } from './AlertaFormulario'

interface FormularioCadastroProps {
  variante: 'modal' | 'tela'
  aoConcluir: () => void
}

const CAMPOS = ['nomeUsuario', 'email', 'senha', 'confirmarSenha'] as const

export function FormularioCadastro({ variante, aoConcluir }: FormularioCadastroProps) {
  const cadastrar = useCadastrar()
  const [erroGeral, setErroGeral] = useState<string>()
  // Validação no envio e depois ao digitar (modo padrão). Com "onTouched", o foco automático do modal
  // no 1º campo fazia a validação de blur dele sobrescrever os erros do envio.
  const { register, handleSubmit, setError, formState } = useForm<CadastroEntrada>({
    resolver: zodResolver(CadastroEntradaSchema),
    defaultValues: { nomeUsuario: '', email: '', senha: '', confirmarSenha: '' },
  })
  const { errors } = formState

  const enviar = handleSubmit(async (dados) => {
    setErroGeral(undefined)
    try {
      await cadastrar.mutateAsync(dados)
      aoConcluir()
    } catch (erro) {
      setErroGeral(aplicarErrosDoServidor(erro, setError, CAMPOS))
    }
  })

  return (
    <form onSubmit={enviar} noValidate className="flex flex-col gap-3">
      <AlertaFormulario mensagem={erroGeral} />
      <Campo rotulo="Nome de usuário" rotuloOculto erro={errors.nomeUsuario?.message}>
        {(controle) => <Input {...controle} {...register('nomeUsuario')} autoComplete="username" placeholder="Nome de usuário" />}
      </Campo>
      <Campo rotulo="E-mail" rotuloOculto erro={errors.email?.message}>
        {(controle) => <Input {...controle} {...register('email')} type="email" autoComplete="email" placeholder="Digite seu e-mail" />}
      </Campo>
      <Campo rotulo="Senha" rotuloOculto erro={errors.senha?.message}>
        {(controle) => <InputSenha {...controle} {...register('senha')} autoComplete="new-password" placeholder="Senha" />}
      </Campo>
      <Campo rotulo="Confirmar senha" rotuloOculto erro={errors.confirmarSenha?.message}>
        {(controle) =>
          // O Figma desktop não tem o "olho" na confirmação; o mobile tem.
          variante === 'tela' ? (
            <InputSenha {...controle} {...register('confirmarSenha')} autoComplete="new-password" placeholder="Confirmar senha" />
          ) : (
            <Input {...controle} {...register('confirmarSenha')} type="password" autoComplete="new-password" placeholder="Confirmar senha" />
          )
        }
      </Campo>
      <Botao type="submit" carregando={cadastrar.isPending} className={cn('w-full', variante === 'modal' ? 'mt-3 md:h-[45px]' : 'mt-7')}>
        {variante === 'modal' ? 'Criar conta' : 'Criar perfil'}
      </Botao>
    </form>
  )
}
