import { createFileRoute, notFound } from '@tanstack/react-router'
import { useState, type ReactNode } from 'react'
import { Aba, AbaConteudo, Abas, ListaAbas } from '@/components/ui/Abas'
import { avisar } from '@/components/ui/avisar'
import { Avatar } from '@/components/ui/Avatar'
import { Botao } from '@/components/ui/Botao'
import { Breadcrumb } from '@/components/ui/Breadcrumb'
import { Campo } from '@/components/ui/Campo'
import { Checkbox } from '@/components/ui/Checkbox'
import { ChipsEdicao } from '@/components/ui/ChipsEdicao'
import { ControleQuantidade } from '@/components/ui/ControleQuantidade'
import { Esqueleto } from '@/components/ui/Esqueleto'
import { FaixaPreco } from '@/components/ui/FaixaPreco'
import { Gaveta, GavetaConteudo, GavetaGatilho } from '@/components/ui/Gaveta'
import { Icone, type NomeIcone } from '@/components/ui/Icone'
import { Input } from '@/components/ui/Input'
import { InputSenha } from '@/components/ui/InputSenha'
import { Modal, ModalConteudo, ModalGatilho } from '@/components/ui/Modal'
import { Paginacao } from '@/components/ui/Paginacao'
import { GrupoRadio, Radio } from '@/components/ui/Radio'
import { Select, SelectConteudo, SelectGatilho, SelectItem, SelectValor } from '@/components/ui/Select'
import { Selo } from '@/components/ui/Selo'
import { Textarea } from '@/components/ui/Textarea'

/** Vitrine dos componentes de UI. Só existe em desenvolvimento: no build de produção responde 404. */
export const Route = createFileRoute('/dev/componentes')({
  beforeLoad: () => {
    if (!import.meta.env.DEV) throw notFound()
  },
  component: Vitrine,
})

const ICONES: NomeIcone[] = ['busca', 'carrinho', 'coracao', 'usuario', 'localizacao', 'sacola', 'atividade', 'download', 'alerta', 'sair', 'imagem', 'olho-oculto', 'seta-baixo']

function Secao({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-5 border-t border-borda pt-8">
      <h2 className="text-f18 font-bold text-destaque">{titulo}</h2>
      {children}
    </section>
  )
}

function Vitrine() {
  const [edicao, setEdicao] = useState('e-50')
  const [faixa, setFaixa] = useState([2, 1230])
  const [pagina, setPagina] = useState(1)
  const [quantidade, setQuantidade] = useState(1)
  const [carregando, setCarregando] = useState(false)

  return (
    <main className="mx-auto flex max-w-[1200px] flex-col gap-10 px-4 py-10 md:px-0">
      <header>
        <h1 className="text-f24 font-bold">Vitrine de componentes</h1>
        <p className="mt-2 text-f14 text-texto-secundario">Só em desenvolvimento. Teste com teclado (Tab, setas, ESC) em 1440, 768 e 390px.</p>
      </header>

      <Secao titulo="Botões">
        <div className="flex flex-wrap items-center gap-4">
          <Botao>Entrar</Botao>
          <Botao variante="contorno">Favoritar</Botao>
          <Botao variante="fantasma">Remover</Botao>
          <Botao variante="link">Esqueceu a senha?</Botao>
          <Botao tamanho="compacto">Salvar</Botao>
          <Botao tamanho="cabecalho">
            <Icone nome="sair" /> Entrar
          </Botao>
          <Botao variante="fantasma" tamanho="icone" aria-label="Buscar">
            <Icone nome="busca" />
          </Botao>
          <Botao disabled>Desabilitado</Botao>
          <Botao
            carregando={carregando}
            onClick={() => {
              setCarregando(true)
              setTimeout(() => setCarregando(false), 2000)
            }}
          >
            {carregando ? 'Enviando…' : 'Confirmar compra'}
          </Botao>
        </div>
        <Botao className="w-full md:w-auto">Largura total no mobile</Botao>
      </Secao>

      <Secao titulo="Formulários">
        <div className="grid gap-6 md:grid-cols-2 md:gap-x-7">
          <Campo rotulo="Nome de exibição" obrigatorio>
            {(controle) => <Input {...controle} placeholder="Ana Souza" />}
          </Campo>
          <Campo rotulo="E-mail" obrigatorio erro="Informe um e-mail válido" descricao="Usado para recuperar a conta.">
            {(controle) => <Input {...controle} type="email" defaultValue="ana@" />}
          </Campo>
          <Campo rotulo="Senha atual">{(controle) => <InputSenha {...controle} defaultValue="Kurio@2026" />}</Campo>
          <Campo rotulo="Rede" obrigatorio>
            {(controle) => (
              <Select>
                <SelectGatilho {...controle}>
                  <SelectValor placeholder="Selecione uma rede" />
                </SelectGatilho>
                <SelectConteudo>
                  <SelectItem value="ethereum">Ethereum</SelectItem>
                  <SelectItem value="polygon">Polygon</SelectItem>
                </SelectConteudo>
              </Select>
            )}
          </Campo>
          <Campo rotulo="Observação do colecionador (opcional)">{(controle) => <Textarea {...controle} />}</Campo>
          <div className="flex flex-col gap-4">
            <span className="text-f15">Carteira e rede</span>
            <GrupoRadio defaultValue="coinbase" aria-label="Carteira">
              {['WalletConnect', 'MetaMask', 'Coinbase Wallet'].map((nome) => (
                <label key={nome} className="flex items-center gap-3 text-f14">
                  <Radio value={nome.split(' ')[0]!.toLowerCase()} /> {nome}
                </label>
              ))}
            </GrupoRadio>
            <label className="flex items-center gap-3 text-f14">
              <Checkbox /> Usar outra carteira?
            </label>
          </div>
        </div>
      </Secao>

      <Secao titulo="Sobreposições e avisos">
        <div className="flex flex-wrap gap-4">
          <Modal>
            <ModalGatilho asChild>
              <Botao variante="contorno">Abrir modal</Botao>
            </ModalGatilho>
            <ModalConteudo titulo="Entrar" descricao="Entre para gerenciar sua carteira, coleção e perfil de criador.">
              <div className="flex flex-col gap-3">
                <Campo rotulo="E-mail">{(controle) => <Input {...controle} placeholder="contato@email.com" />}</Campo>
                <Campo rotulo="Senha">{(controle) => <InputSenha {...controle} />}</Campo>
                <Botao className="mt-4 w-full">Entrar</Botao>
              </div>
            </ModalConteudo>
          </Modal>
          <Gaveta>
            <GavetaGatilho asChild>
              <Botao variante="contorno">Abrir gaveta (filtros)</Botao>
            </GavetaGatilho>
            <GavetaConteudo titulo="Filtros">
              <p className="text-f14 text-texto-secundario">Conteúdo dos filtros no mobile.</p>
            </GavetaConteudo>
          </Gaveta>
          <Botao variante="fantasma" onClick={() => avisar.success('Adicionado ao carrinho')}>
            Aviso de sucesso
          </Botao>
          <Botao variante="fantasma" onClick={() => avisar.error('Não foi possível favoritar', { description: 'Tente novamente.' })}>
            Aviso de erro
          </Botao>
          <Botao variante="fantasma" onClick={() => avisar('Preço atualizado', { description: 'Emerald Ape #042 agora custa 1.29 ETH.' })}>
            Aviso de tempo real
          </Botao>
        </div>
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
          {[1, 2].map((n) => (
            <div key={n} className="flex flex-col gap-3">
              <Esqueleto className="aspect-square w-full" />
              <Esqueleto className="h-4 w-3/4" />
              <Esqueleto className="h-4 w-1/3" />
            </div>
          ))}
        </div>
      </Secao>

      <Secao titulo="Exibição">
        <div className="flex flex-wrap items-center gap-6">
          <Selo>Raro</Selo>
          <Avatar nome="Ana Souza" />
          <Breadcrumb trilha={[{ rotulo: 'Início' }, { rotulo: 'Mercado' }, { rotulo: 'Carrinho' }]} />
        </div>
        <ChipsEdicao
          valor={edicao}
          aoMudar={setEdicao}
          opcoes={[
            { id: 'e-1', rotulo: '1/1', esgotada: true },
            { id: 'e-10', rotulo: '1/10' },
            { id: 'e-50', rotulo: '1/50' },
            { id: 'e-aberta', rotulo: 'ABERTA' },
          ]}
        />
        <Abas defaultValue="todos">
          <ListaAbas aria-label="Catálogo">
            <Aba value="todos">Todos os NFTs</Aba>
            <Aba value="lancamentos">Novos lançamentos</Aba>
            <Aba value="alta">Em alta</Aba>
          </ListaAbas>
          <AbaConteudo value="todos" className="pt-4 text-f14 text-texto-secundario">Conteúdo de Todos os NFTs</AbaConteudo>
          <AbaConteudo value="lancamentos" className="pt-4 text-f14 text-texto-secundario">Conteúdo de Novos lançamentos</AbaConteudo>
          <AbaConteudo value="alta" className="pt-4 text-f14 text-texto-secundario">Conteúdo de Em alta</AbaConteudo>
        </Abas>
        <div className="flex max-w-[260px] flex-col gap-3">
          <FaixaPreco min={2} max={1230} step={1} value={faixa} onValueChange={setFaixa} minStepsBetweenThumbs={1} />
          <span className="text-f14">
            Preço: {(faixa[0]! / 100).toFixed(2).replace('.', ',')} - {(faixa[1]! / 100).toFixed(2).replace('.', ',')} ETH
          </span>
        </div>
        <Paginacao pagina={pagina} totalPaginas={4} aoMudar={setPagina} />
        <div className="flex flex-wrap items-center gap-8">
          <ControleQuantidade valor={quantidade} aoMudar={setQuantidade} maximo={3} item="Emerald Ape #042" />
          <ControleQuantidade valor={quantidade} aoMudar={setQuantidade} maximo={3} tamanho="grande" />
        </div>
      </Secao>

      <Secao titulo="Ícones (Iconly, do Figma)">
        <div className="flex flex-wrap gap-6 text-texto-secundario">
          {ICONES.map((nome) => (
            <span key={nome} className="flex flex-col items-center gap-2 text-f10">
              <Icone nome={nome} tamanho={24} />
              {nome}
            </span>
          ))}
        </div>
      </Secao>
    </main>
  )
}
