import parte1 from '@/assets/icons/sociais/google/parte-1.svg'
import parte2 from '@/assets/icons/sociais/google/parte-2.svg'
import parte3 from '@/assets/icons/sociais/google/parte-3.svg'
import parte4 from '@/assets/icons/sociais/google/parte-4.svg'
import parte5 from '@/assets/icons/sociais/google/parte-5.svg'
import parte6 from '@/assets/icons/sociais/google/parte-6.svg'
import parte7 from '@/assets/icons/sociais/google/parte-7.svg'

/** Logo "google 1" do Figma: 7 vetores posicionados exatamente como no arquivo (caixa de 20px). */
const PARTES = [
  { src: parte1, inset: '57.68% 17.83% 0 7.11%' },
  { src: parte2, inset: '71.33% 17.83% 0 50%' },
  { src: parte3, inset: '24.69% 75.25% 24.69% 0' },
  { src: parte4, inset: '38.28% 0 11.97% 47.07%' },
  { src: parte5, inset: '38.28% 0 11.97% 50%' },
  { src: parte6, inset: '0 17.01% 57.68% 7.11%' },
  { src: parte7, inset: '0 17.01% 70.51% 50%' },
] as const

export function LogoGoogle() {
  return (
    <span aria-hidden className="relative block size-5 shrink-0 overflow-hidden">
      {/* Como no Figma: cada vetor ocupa a caixa posicionada pelo `inset`, e a imagem preenche essa caixa. */}
      {PARTES.map(({ src, inset }) => (
        <span key={src} className="absolute" style={{ inset }}>
          <img src={src} alt="" className="absolute inset-0 block size-full max-w-none" />
        </span>
      ))}
    </span>
  )
}
