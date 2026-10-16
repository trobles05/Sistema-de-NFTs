import { expect, test } from '@playwright/test'

const regiao = (page: import('@playwright/test').Page) => page.locator('#catalogo [role="tabpanel"]')
const esqueletos = (page: import('@playwright/test').Page) => regiao(page).locator('ul[aria-hidden] li')
const grade = (page: import('@playwright/test').Page) => page.getByRole('list', { name: 'NFTs' })

test.describe('estados do catálogo (§8, §9 item 12)', () => {
  test('carregamento lento mostra skeletons e os cards entram no mesmo lugar, sem deslocar o layout', async ({ page }) => {
    await page.goto('/?cenario=lento')
    await expect(esqueletos(page)).toHaveCount(9)
    await expect(regiao(page)).toHaveAttribute('aria-busy', 'true')
    const antes = await esqueletos(page).first().boundingBox()

    await expect(grade(page).locator('li').first()).toBeVisible({ timeout: 15_000 })
    await expect(esqueletos(page)).toHaveCount(0)
    const depois = await grade(page).locator('li').first().boundingBox()
    expect(Math.abs(depois!.x - antes!.x)).toBeLessThanOrEqual(1)
    expect(Math.abs(depois!.y - antes!.y)).toBeLessThanOrEqual(1)
    expect(Math.abs(depois!.width - antes!.width)).toBeLessThanOrEqual(1)
  })

  test('falha persistente mostra erro e a nova tentativa recupera quando a causa some', async ({ page }) => {
    await page.goto('/?cenario=erro-servidor')
    const alerta = page.getByRole('alert').filter({ hasText: 'Não foi possível carregar os NFTs' })
    await expect(alerta).toBeVisible({ timeout: 15_000 })

    await page.evaluate(() => window.__kurioMocks?.definirCenario('padrao'))
    await alerta.getByRole('button', { name: 'Tentar novamente' }).click()
    await expect(grade(page).locator('li').first()).toBeVisible()
    await expect(alerta).toHaveCount(0)
  })

  test('sem conexão mostra a mensagem específica', async ({ page }) => {
    await page.goto('/?cenario=offline')
    await expect(page.getByRole('alert').filter({ hasText: 'Não foi possível carregar os NFTs' })).toContainText('Sem conexão', { timeout: 15_000 })
  })

  test('busca sem resultado mostra o estado vazio e "Limpar filtros" volta ao catálogo', async ({ page }) => {
    await page.goto('/?busca=%22nada-com-isso%22')
    await expect(page.getByText('Nenhum NFT encontrado')).toBeVisible()
    await page.getByRole('button', { name: 'Limpar filtros' }).click()
    await expect(grade(page).locator('li')).toHaveCount(9)
    expect(new URL(page.url()).searchParams.get('busca')).toBeNull()
  })

  test('com "reduzir movimento" o skeleton fica parado', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto('/?cenario=lento')
    const esqueleto = esqueletos(page).first().locator('.esqueleto').first()
    await expect(esqueleto).toBeVisible()
    const animacao = await esqueleto.evaluate((el) => getComputedStyle(el).animationDuration)
    expect(Number.parseFloat(animacao)).toBeLessThan(0.001)
  })
})
