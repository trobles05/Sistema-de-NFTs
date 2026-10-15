/**
 * Hash de senha dos mocks: PBKDF2-SHA256 via Web Crypto (mesmo código no navegador e no Node).
 * Formato: `pbkdf2$<iteracoes>$<saltHex>$<hashHex>`. Senha em claro nunca é armazenada.
 */
const ITERACOES = 100_000

function paraHex(bytes: ArrayBuffer | Uint8Array): string {
  return Array.from(new Uint8Array(bytes), (b) => b.toString(16).padStart(2, '0')).join('')
}

function deHex(hex: string): Uint8Array<ArrayBuffer> {
  const bytes = new Uint8Array(hex.length / 2)
  for (let i = 0; i < bytes.length; i++) bytes[i] = Number.parseInt(hex.slice(i * 2, i * 2 + 2), 16)
  return bytes
}

async function derivar(senha: string, salt: Uint8Array<ArrayBuffer>, iteracoes: number): Promise<string> {
  const chave = await crypto.subtle.importKey('raw', new TextEncoder().encode(senha), 'PBKDF2', false, ['deriveBits'])
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt, iterations: iteracoes }, chave, 256)
  return paraHex(bits)
}

export async function gerarHashSenha(senha: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16))
  return `pbkdf2$${ITERACOES}$${paraHex(salt)}$${await derivar(senha, salt, ITERACOES)}`
}

export async function verificarSenha(senha: string, hashArmazenado: string): Promise<boolean> {
  const [algoritmo, iteracoes, saltHex, hashHex] = hashArmazenado.split('$')
  if (algoritmo !== 'pbkdf2' || !iteracoes || !saltHex || !hashHex) return false
  const calculado = await derivar(senha, deHex(saltHex), Number(iteracoes))
  // Comparação em tempo constante, para não vazar por quanto o hash difere.
  let diferenca = calculado.length ^ hashHex.length
  for (let i = 0; i < calculado.length; i++) diferenca |= calculado.charCodeAt(i) ^ (hashHex.charCodeAt(i) || 0)
  return diferenca === 0
}
