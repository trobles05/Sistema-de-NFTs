import { expect, test, type Page } from '@playwright/test'

async function abrir(page: Page, caminho: string) {
  await page.goto(caminho)
  await expect(page.locator('main#conteudo h1')).toBeVisible()
}

const ehMobile = (page: Page) => (page.viewportSize()?.width ?? 0) < 768

test.describe('layout da loja', () => {
  test('header só no desktop, tab bar só no mobile', async ({ page }) => {
    await abrir(page, '/')
    const header = page.getByRole('navigation', { name: 'Principal' })
    const barra = page.getByRole('navigation', { name: 'Navegação rápida' })
    if (ehMobile(page)) {
      await expect(header).toBeHidden()
      await expect(barra).toBeVisible()
      await expect(barra.getByRole('link', { name: 'Início' })).toHaveAttribute('aria-current', 'page')
    } else {
      await expect(header).toBeVisible()
      await expect(barra).toBeHidden()
      await expect(header.getByRole('link', { name: 'Início' })).toHaveAttribute('aria-current', 'page')
    }
  })

  test('telas de compra: Mercado ativo, sem fio no header e sem tab bar', async ({ page }) => {
    await abrir(page, '/carrinho')
    await expect(page.getByRole('navigation', { name: 'Navegação rápida' })).toHaveCount(0)
    test.skip(ehMobile(page), 'header desktop')
    await expect(page.getByRole('navigation', { name: 'Principal' }).getByRole('link', { name: 'Mercado' })).toHaveAttribute('aria-current', 'page')
    const fio = await page.locator('header > div').evaluate((el) => getComputedStyle(el).borderBottomWidth)
    expect(fio).toBe('0px')

    await abrir(page, '/')
    expect(await page.locator('header > div').evaluate((el) => getComputedStyle(el).borderBottomWidth)).toBe('1px')
  })

  test('header fica fixo no topo ao rolar (desktop)', async ({ page }) => {
    test.skip(ehMobile(page), 'header desktop')
    await abrir(page, '/')
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2))
    const menu = page.getByRole('navigation', { name: 'Principal' })
    await expect(menu).toBeInViewport()
    expect(await page.locator('header').evaluate((el) => Math.round(el.getBoundingClientRect().top))).toBe(0)
  })

  test('"Pular para o conteúdo" é o primeiro Tab e leva o foco ao main', async ({ page }) => {
    await abrir(page, '/')
    await page.keyboard.press('Tab')
    const pular = page.getByRole('link', { name: 'Pular para o conteúdo' })
    await expect(pular).toBeFocused()
    await expect(pular).toBeInViewport()
    await page.keyboard.press('Enter')
    await expect(page.locator('main#conteudo')).toBeFocused()
  })

  test('seção fora do escopo leva à página "em breve", sem simular funcionalidade', async ({ page }) => {
    await abrir(page, '/')
    await page.getByRole('navigation', { name: 'Rodapé' }).getByRole('link', { name: 'Como comprar NFTs' }).click()
    await expect(page).toHaveURL(/\/em-breve\?secao=/)
    await expect(page.getByRole('heading', { name: 'Em breve' })).toBeVisible()
    await expect(page.locator('main')).toContainText('Como comprar NFTs não faz parte desta demonstração')
  })

  test('newsletter valida o e-mail e avisa que não faz parte da demonstração', async ({ page }) => {
    await abrir(page, '/')
    const email = page.getByRole('textbox', { name: 'Antecipe-se ao próximo lançamento' })
    await email.fill('nao-e-email')
    await page.getByRole('button', { name: 'Enviar' }).click()
    await expect(email).toHaveAttribute('aria-invalid', 'true')
    await expect(email).toHaveAccessibleDescription('Informe um e-mail válido')

    await email.fill('ana@kurio.dev')
    await page.getByRole('button', { name: 'Enviar' }).click()
    await expect(page.getByRole('region', { name: /Notifications/ })).toContainText('A newsletter não faz parte desta demonstração')
  })

  test('tab bar some ao chegar no footer e volta ao subir (mobile)', async ({ page }) => {
    test.skip(!ehMobile(page), 'só no mobile')
    await abrir(page, '/')
    const barra = page.getByRole('navigation', { name: 'Navegação rápida', includeHidden: true })
    await expect(barra).toBeInViewport()

    await page.locator('#rodape').scrollIntoViewIfNeeded()
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
    await expect(barra).not.toBeInViewport()
    await expect(barra).toHaveAttribute('inert', '')

    await page.evaluate(() => window.scrollTo(0, 0))
    await expect(barra).toBeInViewport()
    await expect(barra).not.toHaveAttribute('inert')
  })

  test('sem rolagem horizontal em 390, 768 e 1440', async ({ page }) => {
    for (const largura of [390, 768, 1440]) {
      await page.setViewportSize({ width: largura, height: 900 })
      await abrir(page, '/')
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), `largura ${largura}`).toBe(true)
    }
  })
})
