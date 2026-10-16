import type { CSSProperties } from 'react'
import alerta from '@/assets/icons/iconly/alerta.svg'
import atividade from '@/assets/icons/iconly/atividade.svg'
import busca from '@/assets/icons/iconly/busca.svg'
import carrinhoCheio from '@/assets/icons/iconly/carrinho-cheio.svg'
import carrinho from '@/assets/icons/iconly/carrinho.svg'
import casa from '@/assets/icons/iconly/casa.svg'
import coracaoCheio from '@/assets/icons/iconly/coracao-cheio.svg'
import coracao from '@/assets/icons/iconly/coracao.svg'
import download from '@/assets/icons/iconly/download.svg'
import imagem from '@/assets/icons/iconly/imagem.svg'
import localizacao from '@/assets/icons/iconly/localizacao.svg'
import olhoOculto from '@/assets/icons/iconly/olho-oculto.svg'
import sacola from '@/assets/icons/iconly/sacola.svg'
import sair from '@/assets/icons/iconly/sair.svg'
import setaBaixo from '@/assets/icons/iconly/seta-baixo.svg'
import usuarioCheio from '@/assets/icons/iconly/usuario-cheio.svg'
import usuario from '@/assets/icons/iconly/usuario.svg'
import { cn } from '@/lib/utils'

/**
 * Ícones Iconly exportados do Figma. `escala` = fração da caixa ocupada pelo desenho
 * (o recuo interno que o Figma aplica a cada ícone). Versões "-cheio" são as da tab bar mobile.
 */
const ICONES = {
  alerta: { src: alerta, escala: 0.79 },
  atividade: { src: atividade, escala: 0.8 },
  busca: { src: busca, escala: 1 },
  carrinho: { src: carrinho, escala: 1 },
  'carrinho-cheio': { src: carrinhoCheio, escala: 0.88 },
  casa: { src: casa, escala: 0.83 },
  coracao: { src: coracao, escala: 1 },
  'coracao-cheio': { src: coracaoCheio, escala: 1 },
  download: { src: download, escala: 0.78 },
  imagem: { src: imagem, escala: 0.78 },
  localizacao: { src: localizacao, escala: 0.81 },
  'olho-oculto': { src: olhoOculto, escala: 0.83 },
  sacola: { src: sacola, escala: 1 },
  sair: { src: sair, escala: 0.82 },
  'seta-baixo': { src: setaBaixo, escala: 1 },
  usuario: { src: usuario, escala: 1 },
  'usuario-cheio': { src: usuarioCheio, escala: 0.83 },
} as const

export type NomeIcone = keyof typeof ICONES

interface IconeProps {
  nome: NomeIcone
  /** Lado da caixa em px (o Figma usa 16, 18, 20 e 24). */
  tamanho?: number
  className?: string
  /** Texto para leitor de tela. Sem rótulo, o ícone é decorativo. */
  rotulo?: string
}

/**
 * O SVG original é usado como máscara: o desenho não é alterado e a cor vem do `color` do contexto
 * (classes `text-*`), já que o mesmo ícone aparece em cores diferentes no Figma.
 */
export function Icone({ nome, tamanho = 20, className, rotulo }: IconeProps) {
  const { src, escala } = ICONES[nome]
  // O recuo vira padding e a máscara usa `contain` na área interna: o desenho mantém a proporção.
  const estilo: CSSProperties = {
    width: tamanho,
    height: tamanho,
    padding: (tamanho * (1 - escala)) / 2,
    maskImage: `url("${src}")`,
    maskSize: 'contain',
    maskOrigin: 'content-box',
    maskClip: 'content-box',
    maskRepeat: 'no-repeat',
    maskPosition: 'center',
  }
  return (
    <span
      className={cn('inline-block shrink-0 bg-current', className)}
      style={estilo}
      {...(rotulo ? { role: 'img', 'aria-label': rotulo } : { 'aria-hidden': true })}
    />
  )
}
