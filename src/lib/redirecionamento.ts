/**
 * Só aceita caminhos internos ("/perfil?x=1"). Endereço externo, protocolo ("//site", "/\\site")
 * ou as próprias telas de autenticação voltam para a Início — evita "open redirect" e laço de login.
 */
export function destinoSeguro(redirect: string | undefined): string {
  if (!redirect || !redirect.startsWith('/') || redirect.startsWith('//') || redirect.startsWith('/\\')) return '/'
  if (/^\/(entrar|cadastro)(\/|\?|#|$)/.test(redirect)) return '/'
  return redirect
}
