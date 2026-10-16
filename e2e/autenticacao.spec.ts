import { expect, test, type Page } from '@playwright/test'

const SENHA = 'Kurio@2026'
const ehMobile = (page: Page) => (page.viewportSize()?.width ?? 0) < 768

/** Formulário de login/cadastro, esteja ele no modal (desktop) ou na tela cheia (mobile). */
const formulario = (page: Page) => page.locator('form').filter({ has: page.getByRole('textbox', { name: 'E-mail' }) })

/** Compara só o caminho da URL: "?redirect=/perfil" no endereço não pode satisfazer a checagem por engano. */
async function esperarCaminho(page: Page, caminho: string) {
  await expect(page).toHaveURL((url) => url.pathname === caminho)
}

async function abrir(page: Page, caminho: string) {
  await page.goto(caminho)
  await expect(page.locator('h1, [role="dialog"]').first()).toBeVisible()
}

async function preencherLogin(page: Page, email: string, senha: string) {
  const form = formulario(page)
  await form.getByRole('textbox', { name: 'E-mail' }).fill(email)
  await form.getByLabel('Senha', { exact: true }).fill(senha)
  await form.getByRole('button', { name: 'Entrar' }).click()
}

/** Login com sucesso: espera sair da tela de login (a requisição terminou e a sessão foi salva). */
async function entrar(page: Page, email: string, senha = SENHA) {
  await preencherLogin(page, email, senha)
  await expect(page).toHaveURL((url) => !/^\/(entrar|cadastro)$/.test(url.pathname))
}

test.describe('cadastro', () => {
  test('valida campos e mostra conflito de e-mail no próprio campo', async ({ page }) => {
    await abrir(page, '/cadastro')
    const form = formulario(page)
    const botao = form.getByRole('button', { name: /Criar (conta|perfil)/ })

    await botao.click()
    await expect(form.getByRole('textbox', { name: 'Nome de usuário' })).toHaveAccessibleDescription(/pelo menos 3 caracteres/)
    await expect(form.getByRole('textbox', { name: 'E-mail' })).toHaveAttribute('aria-invalid', 'true')
    await expect(form.getByLabel('Confirmar senha')).toHaveAccessibleDescription('Confirme a senha')

    await form.getByRole('textbox', { name: 'Nome de usuário' }).fill('nova.colecionadora')
    await form.getByRole('textbox', { name: 'E-mail' }).fill('ana@kurio.dev')
    await form.getByLabel('Senha', { exact: true }).fill('senha-forte')
    await form.getByLabel('Confirmar senha').fill('senha-forte')
    await botao.click()
    await expect(form.getByRole('textbox', { name: 'E-mail' })).toHaveAccessibleDescription('Este e-mail já está cadastrado')
  })

  test('cadastro válido entra logado e volta ao destino', async ({ page }) => {
    await abrir(page, '/cadastro?redirect=/em-breve')
    const form = formulario(page)
    await form.getByRole('textbox', { name: 'Nome de usuário' }).fill('carla.dias')
    await form.getByRole('textbox', { name: 'E-mail' }).fill('carla@kurio.dev')
    await form.getByLabel('Senha', { exact: true }).fill('senha-forte')
    await form.getByLabel('Confirmar senha').fill('senha-forte')
    await form.getByRole('button', { name: /Criar (conta|perfil)/ }).click()
    await esperarCaminho(page, '/em-breve')
    expect(await page.evaluate(() => localStorage.getItem('kurio:sessao'))).toContain('usr-')
  })
})

test.describe('login', () => {
  test('senha errada mostra alerta geral sem dizer qual campo errou', async ({ page }) => {
    await abrir(page, '/entrar')
    await preencherLogin(page, 'ana@kurio.dev', 'senha-errada')
    await expect(page.getByRole('alert')).toHaveText('E-mail ou senha incorretos.')
  })

  test('redirect externo é ignorado', async ({ page }) => {
    await abrir(page, '/entrar?redirect=https://site-falso.example')
    await entrar(page, 'ana@kurio.dev')
    await esperarCaminho(page, '/')
  })

})

test.describe('telas de autenticação', () => {
  test('desktop: modal prende o foco, ESC fecha e volta à página anterior', async ({ page }) => {
    test.skip(ehMobile(page), 'modal só no desktop')
    await abrir(page, '/entrar?redirect=/em-breve')
    const modal = page.getByRole('dialog', { name: 'Entrar' })
    await expect(modal).toBeVisible()
    for (let i = 0; i < 6; i++) {
      await page.keyboard.press('Tab')
      expect(await modal.evaluate((el) => el.contains(document.activeElement))).toBe(true)
    }
    await page.keyboard.press('Escape')
    await esperarCaminho(page, '/em-breve')
  })

  test('link de texto alterna entre login e cadastro mantendo o destino', async ({ page }) => {
    await abrir(page, '/entrar?redirect=/em-breve')
    await page.getByRole('link', { name: 'Novo na Kurio? Crie uma conta' }).click()
    await expect(page).toHaveURL(/\/cadastro\?redirect=%2Fem-breve/)
    await page.getByRole('link', { name: 'Já tem uma conta? Entre' }).click()
    await expect(page).toHaveURL(/\/entrar\?redirect=%2Fem-breve/)
  })

  test('mobile: tela cheia, sem tab bar nem footer', async ({ page }) => {
    test.skip(!ehMobile(page), 'só no mobile')
    await abrir(page, '/entrar')
    await expect(page.getByRole('heading', { name: 'Entrar' })).toBeVisible()
    await expect(page.getByRole('dialog')).toHaveCount(0)
    await expect(page.getByRole('navigation', { name: 'Navegação rápida' })).toHaveCount(0)
    await expect(page.locator('#rodape')).toBeHidden()
  })

  test('login social avisa que não faz parte da demonstração', async ({ page }) => {
    await abrir(page, '/entrar')
    await page.getByRole('button', { name: 'Continuar com Google' }).click()
    await expect(page.getByRole('region', { name: /Notifications/ })).toContainText('Entrar com Google não faz parte desta demonstração')
  })
})
