import { Link } from '@tanstack/react-router'
import { useId, useState, type FormEvent, type ReactNode } from 'react'
import facebook from '@/assets/icons/sociais/facebook.svg'
import instagram from '@/assets/icons/sociais/instagram.svg'
import linkedin from '@/assets/icons/sociais/linkedin.svg'
import twitter from '@/assets/icons/sociais/twitter.svg'
import youtube from '@/assets/icons/sociais/youtube.svg'
import { avisar } from '@/components/ui/avisar'
import { Icone } from '@/components/ui/Icone'
import { EmailSchema } from '@/types'

const DESTAQUES = [
  { letra: 'W', titulo: 'Segurança da carteira', texto: 'Proteja sua carteira e colecione arte digital verificada com confiança.' },
  { letra: 'C', titulo: 'Criadores em destaque', texto: 'Conheça artistas, estúdios e comunidades que moldam a cultura digital na rede.' },
  { letra: 'D', titulo: 'Alertas de lançamentos', texto: 'Receba calendários de cunhagem, novidades de listas de acesso e análises do mercado.' },
] as const

const REDES = [
  { nome: 'Facebook', icone: facebook },
  { nome: 'Instagram', icone: instagram },
  { nome: 'Twitter', icone: twitter },
  { nome: 'LinkedIn', icone: linkedin },
  { nome: 'YouTube', icone: youtube },
] as const

const classeLink = 'leading-[30px] hover:text-destaque focus-visible:outline-2 focus-visible:outline-destaque'

/** Link para seção fora do escopo do desafio: leva à página "em breve", sem fingir funcionalidade. */
function LinkEmBreve({ secao, children }: { secao: string; children: ReactNode }) {
  return (
    <Link to="/em-breve" search={{ secao }} className={classeLink}>
      {children}
    </Link>
  )
}

function Coluna({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <div className="flex flex-1 flex-col gap-2">
      <h2 className="text-f18 leading-4 font-bold">{titulo}</h2>
      <ul className="flex flex-col text-f14">{children}</ul>
    </div>
  )
}

function Newsletter() {
  const id = useId()
  const [erro, setErro] = useState<string>()

  function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    const email = new FormData(evento.currentTarget).get('email')
    const resultado = EmailSchema.safeParse(email)
    if (!resultado.success) {
      setErro('Informe um e-mail válido')
      return
    }
    setErro(undefined)
    // Fora do escopo do desafio: avisa com honestidade em vez de simular cadastro.
    avisar('A newsletter não faz parte desta demonstração', { description: 'Nenhum e-mail foi cadastrado.' })
  }

  return (
    <form onSubmit={enviar} noValidate className="flex flex-col gap-4">
      <label htmlFor={id} className="text-f18 leading-4 font-bold">
        Antecipe-se ao próximo lançamento
      </label>
      <div className="flex h-10 rounded-cabecalho bg-superficie-escura shadow-[0_0_10px_rgba(10,6,4,0.45)]">
        <input
          id={id}
          name="email"
          type="email"
          placeholder="digite seu e-mail..."
          aria-invalid={Boolean(erro)}
          aria-describedby={erro ? `${id}-erro` : undefined}
          className="min-w-0 flex-1 bg-transparent pl-3 text-f14 text-texto placeholder:text-texto-terciario focus-visible:outline-2 focus-visible:outline-destaque"
        />
        <button
          type="submit"
          className="w-[85px] shrink-0 rounded-r-cabecalho bg-branco pr-1 pl-4 text-f18 font-bold text-fundo focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-destaque"
        >
          Enviar
        </button>
      </div>
      {erro && (
        <p id={`${id}-erro`} className="flex items-center gap-1.5 text-f13 text-coral">
          <Icone nome="alerta" tamanho={16} />
          {erro}
        </p>
      )}
      <p className="text-f13 leading-[22px] text-texto-secundario">Receba lançamentos selecionados, histórias de criadores e novidades do mercado.</p>
    </form>
  )
}

/** Footer do Figma (1200px): destaques + newsletter, faixa da marca, colunas de links e redes. Empilha no mobile. */
export function Rodape() {
  return (
    <footer id="rodape" className="mx-auto mt-20 flex w-full max-w-[1200px] flex-col text-texto">
      <section aria-label="Destaques da Kurio" className="flex flex-col gap-8 bg-superficie p-8 lg:h-[250px] lg:flex-row lg:items-end lg:justify-between lg:gap-0">
        {DESTAQUES.map((destaque, i) => (
          <div key={destaque.letra} className="contents">
            {i > 0 && <span aria-hidden className="h-px w-full bg-branco lg:h-auto lg:w-px lg:self-stretch" />}
            <div className="flex flex-col gap-3 lg:flex-1 lg:px-4">
              <span aria-hidden className="grid size-[74px] place-items-center rounded-full bg-branco text-f24 font-bold text-fundo">
                {destaque.letra}
              </span>
              <h2 className="text-f17 leading-4 font-bold">{destaque.titulo}</h2>
              <p className="text-f14 leading-[22px] text-texto-secundario lg:max-w-[204px]">{destaque.texto}</p>
            </div>
          </div>
        ))}
        <span aria-hidden className="h-px w-full bg-branco lg:h-auto lg:w-px lg:self-stretch" />
        <div className="lg:h-full lg:w-[357px] lg:px-4">
          <Newsletter />
        </div>
      </section>

      <section aria-label="Contato" className="flex flex-col gap-4 bg-superficie-escura p-8 text-f14 leading-[22px] lg:h-[88px] lg:flex-row lg:items-center lg:gap-[92px] lg:py-0">
        <span className="flex-1 font-bold tracking-[0.1em]">KURIO</span>
        <p className="flex-1 whitespace-nowrap">
          Feito para colecionadores,
          <br /> criadores e cultura
        </p>
        <a href="mailto:contato@email.com" className="flex-1 hover:text-destaque focus-visible:outline-2 focus-visible:outline-destaque">
          contato@email.com
        </a>
        <a href="tel:+551140028922" className="hover:text-destaque focus-visible:outline-2 focus-visible:outline-destaque lg:w-[228px]">
          +55 11 4002 8922
        </a>
      </section>

      <nav aria-label="Rodapé" className="grid grid-cols-2 gap-8 bg-superficie p-8 md:grid-cols-3 lg:flex lg:h-[236px] lg:gap-[60px] xl:gap-[124px]">
        <Coluna titulo="Meu perfil">
          <li>
            <Link to="/perfil" className={classeLink}>
              Meu perfil
            </Link>
          </li>
          <li>
            <LinkEmBreve secao="Minha coleção">Minha coleção</LinkEmBreve>
          </li>
          <li>
            <LinkEmBreve secao="Atividade">Atividade</LinkEmBreve>
          </li>
          <li>
            <LinkEmBreve secao="Estúdio do criador">Estúdio do criador</LinkEmBreve>
          </li>
          <li>
            <Link to="/favoritos" className={classeLink}>
              Lista de interesse
            </Link>
          </li>
        </Coluna>
        <Coluna titulo="Central de ajuda">
          {['Central de ajuda', 'Como comprar NFTs', 'Carteira e segurança', 'Política do mercado', 'Denunciar item'].map((item) => (
            <li key={item}>
              <LinkEmBreve secao={item}>{item}</LinkEmBreve>
            </li>
          ))}
        </Coluna>
        <Coluna titulo="Coleções">
          {['Arte digital', 'Fotografia', 'Música', 'Arte 3D', 'Utilidade'].map((item) => (
            <li key={item}>
              <Link to="/" hash="catalogo" className={classeLink}>
                {item}
              </Link>
            </li>
          ))}
        </Coluna>
        <div className="col-span-2 flex flex-col gap-8 md:col-span-3 lg:w-[228px]">
          <div className="flex flex-col gap-5">
            <h2 className="text-f18 leading-4 font-bold">Redes sociais</h2>
            <ul className="flex gap-2.5">
              {REDES.map((rede) => (
                <li key={rede.nome}>
                  <Link to="/em-breve" search={{ secao: `Kurio no ${rede.nome}` }} className="block focus-visible:outline-2 focus-visible:outline-destaque">
                    <img src={rede.icone} alt={`Kurio no ${rede.nome}`} width={32} height={32} />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="flex flex-col gap-3">
            <h2 className="text-f18 leading-4 font-bold">Carteiras compatíveis</h2>
            <p className="flex h-[26px] w-fit items-center justify-center rounded-cabecalho lg:w-full border border-borda-suave bg-superficie-escura px-2 text-f9 font-bold tracking-[0.1px] whitespace-pre text-destaque">
              {'METAMASK  •  WALLETCONNECT  •  COINBASE'}
            </p>
          </div>
        </div>
      </nav>

      <p className="py-1.5 text-center text-f14 leading-[30px]">© 2026 Kurio. Propriedade digital para todos.</p>
    </footer>
  )
}
