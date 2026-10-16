import { expect, test } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.goto('/dev/componentes')
  await expect(page.getByRole('heading', { name: 'Vitrine de componentes' })).toBeVisible()
})

test.describe('Campo e formulários', () => {
  test('rótulo, obrigatório e erro ficam associados ao controle', async ({ page }) => {
    const nome = page.getByRole('textbox', { name: /Nome de exibição/ })
    await expect(nome).toHaveAttribute('aria-required', 'true')
    await expect(nome).toHaveAccessibleName('Nome de exibição (obrigatório)')

    const email = page.getByRole('textbox', { name: /E-mail/ })
    await expect(email).toHaveAttribute('aria-invalid', 'true')
    await expect(email).toHaveAccessibleDescription('Usado para recuperar a conta. Informe um e-mail válido')
  })

  test('senha alterna visibilidade com estado anunciado', async ({ page }) => {
    const senha = page.getByLabel('Senha atual')
    await expect(senha).toHaveAttribute('type', 'password')
    await page.getByRole('button', { name: 'Mostrar senha' }).click()
    await expect(senha).toHaveAttribute('type', 'text')
    await expect(page.getByRole('button', { name: 'Ocultar senha' })).toHaveAttribute('aria-pressed', 'true')
  })

  test('select abre pelo teclado e escolhe a rede', async ({ page }) => {
    const rede = page.getByRole('combobox', { name: /Rede/ })
    await rede.focus()
    await page.keyboard.press('Enter')
    await page.getByRole('option', { name: 'Polygon' }).press('Enter')
    await expect(rede).toHaveText(/Polygon/)
  })
})

test.describe('Botões e quantidade', () => {
  test('botão carregando bloqueia o segundo clique', async ({ page }) => {
    const botao = page.getByRole('button', { name: 'Confirmar compra' })
    await botao.click()
    const carregando = page.getByRole('button', { name: 'Enviando…' })
    await expect(carregando).toBeDisabled()
    await expect(carregando).toHaveAttribute('aria-busy', 'true')
  })

  test('quantidade respeita mínimo e máximo', async ({ page }) => {
    const diminuir = page.getByRole('button', { name: 'Diminuir quantidade de Emerald Ape #042' })
    const aumentar = page.getByRole('button', { name: 'Aumentar quantidade de Emerald Ape #042' })
    await expect(diminuir).toBeDisabled()
    await aumentar.click()
    await aumentar.click()
    await expect(page.getByRole('group', { name: 'Quantidade de Emerald Ape #042' }).locator('output')).toHaveText('3')
    await expect(aumentar).toBeDisabled()
  })

  test('chips de edição: esgotada desabilitada e navegação por setas', async ({ page }) => {
    const grupo = page.getByRole('radiogroup', { name: 'Edição' })
    await expect(grupo.getByRole('radio', { name: /1\/1 \(esgotada\)/ })).toBeDisabled()
    await grupo.getByRole('radio', { name: '1/50' }).focus()
    await page.keyboard.press('ArrowRight')
    await expect(grupo.getByRole('radio', { name: 'ABERTA' })).toBeFocused()
  })
})

test.describe('Sobreposições e avisos', () => {
  test('modal prende o foco, fecha com ESC e devolve o foco ao gatilho', async ({ page }) => {
    const gatilho = page.getByRole('button', { name: 'Abrir modal' })
    await gatilho.focus()
    await page.keyboard.press('Enter')
    const modal = page.getByRole('dialog', { name: 'Entrar' })
    await expect(modal).toBeVisible()

    for (let i = 0; i < 8; i++) {
      await page.keyboard.press('Tab')
      expect(await modal.evaluate((el) => el.contains(document.activeElement))).toBe(true)
    }

    await page.keyboard.press('Escape')
    await expect(modal).toBeHidden()
    await expect(gatilho).toBeFocused()
  })

  test('aviso aparece numa região anunciada ao leitor de tela', async ({ page }) => {
    await page.getByRole('button', { name: 'Aviso de sucesso' }).click()
    const regiao = page.getByRole('region', { name: /Notifications/ })
    await expect(regiao).toContainText('Adicionado ao carrinho')
  })

  test('foco visível com contorno ao navegar por teclado', async ({ page }) => {
    await page.getByRole('button', { name: 'Entrar' }).first().focus()
    await page.keyboard.press('Tab')
    const contorno = await page.evaluate(() => getComputedStyle(document.activeElement!).outlineStyle)
    expect(contorno).not.toBe('none')
  })
})
