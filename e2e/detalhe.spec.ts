import { expect, test, type Page } from '@playwright/test'

const ehMobile = (page: Page) => (page.viewportSize()?.width ?? 0) < 768
const titulo = (page: Page) => page.getByRole('heading', { level: 1, name: 'Emerald Ape #042' })
const parametro = (page: Page, nome: string) => new URL(page.url()).searchParams.get(nome)

async function abrir(page: Page, caminho = '/nft/nft-001') {
  await page.goto(caminho)
  await expect(page.locator('h1').filter({ visible: true }).first()).toBeVisible()
}

test.describe('detalhe do NFT (§3, §9 item 2)', () => {
  test('acesso direto e refresh mostram o NFT, com os dados do Figma', async ({ page }) => {
    await abrir(page)
    await expect(titulo(page)).toBeVisible()
    await expect(page.getByRole('img', { name: 'Avaliação 4,8 de 5' }).or(page.getByText('4,8'))).toBeVisible()
    await expect(page.getByText('Óculos, Esmeralda, Raro')).toBeVisible()
    await page.reload()
    await expect(titulo(page)).toBeVisible()
  })

  test('NFT inexistente mostra "não encontrado" com caminho de volta', async ({ page }) => {
    await abrir(page, '/nft/nft-999')
    await expect(page.getByRole('heading', { name: 'NFT não encontrado' })).toBeVisible()
    await page.getByRole('link', { name: 'Explorar o catálogo' }).click()
    await expect(page.getByRole('list', { name: 'NFTs' })).toBeVisible()
  })

  test('trocar a edição atualiza preço e URL; edições esgotadas ficam desabilitadas', async ({ page }) => {
    await abrir(page)
    const edicoes = page.getByRole('radiogroup', { name: 'Edição' })
    await expect(edicoes.getByRole('radio', { name: /1\/1 \(esgotada\)/ })).toBeDisabled()
    await expect(edicoes.getByRole('radio', { name: '1/50' })).toHaveAttribute('aria-checked', 'true')

    await edicoes.getByRole('radio', { name: 'ABERTA' }).click()
    await expect.poll(() => parametro(page, 'edicao')).toBe('nft-001-aberta')
    await expect(page.getByText('1.20 ETH').first()).toBeVisible()

    await page.reload()
    await expect(edicoes.getByRole('radio', { name: 'ABERTA' })).toHaveAttribute('aria-checked', 'true')
  })

  test('link para uma edição esgotada avisa e trava a quantidade', async ({ page }) => {
    await abrir(page, '/nft/nft-001?edicao=nft-001-1-1')
    await expect(page.getByRole('status').filter({ hasText: 'Esta edição está esgotada' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Aumentar quantidade de Emerald Ape #042' })).toBeDisabled()
  })

  test('quantidade para no limite, explica o motivo e mostra o total', async ({ page }) => {
    await abrir(page)
    const aumentar = page.getByRole('button', { name: 'Aumentar quantidade de Emerald Ape #042' })
    await aumentar.click()
    await expect(page.getByText('Total:')).toContainText('2.38 ETH')
    for (let i = 0; i < 30 && (await aumentar.isEnabled()); i++) await aumentar.click()
    await expect(aumentar).toBeDisabled()
    await expect(page.getByText(/Limite de \d+ por pedido\.|Restam? \d+ unidades?\./)).toBeVisible()
    const quantidade = Number(await page.getByRole('group', { name: 'Quantidade de Emerald Ape #042' }).locator('output').textContent())
    expect(quantidade).toBeGreaterThan(1)
    expect(quantidade).toBeLessThanOrEqual(10)
  })

  test('galeria troca a vista e a lupa abre o zoom (ESC fecha)', async ({ page }) => {
    test.skip(ehMobile(page), 'galeria de miniaturas é do desktop')
    await abrir(page)
    const rosto = page.getByRole('button', { name: 'Detalhe do rosto' })
    await rosto.click()
    await expect(rosto).toHaveAttribute('aria-pressed', 'true')
    await page.getByRole('button', { name: 'Ampliar Emerald Ape #042' }).click()
    await expect(page.getByRole('dialog', { name: 'Emerald Ape #042' })).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(page.getByRole('dialog')).toHaveCount(0)
  })

  test('mobile: barra de compra fixa e "Voltar" retorna ao catálogo', async ({ page }) => {
    test.skip(!ehMobile(page), 'só no mobile')
    await page.goto('/')
    await page.getByRole('list', { name: 'NFTs' }).getByRole('link', { name: /Emerald Ape #042/ }).click()
    await expect(page.getByRole('region', { name: 'Compra' })).toBeInViewport()
    await page.getByRole('button', { name: 'Voltar' }).click()
    await expect(page).toHaveURL((url) => url.pathname === '/')
  })

  test('ações que chegam nas próximas etapas avisam em vez de simular', async ({ page }) => {
    await abrir(page)
    const comprar = page.getByRole('button', { name: /^Comprar( NFT)?$/i })
    await expect(comprar).toHaveAttribute('aria-disabled', 'true')
    // aria-disabled mantém o botão focável e clicável (o Playwright, por padrão, espera ele "habilitar").
    await comprar.click({ force: true })
    await expect(page.getByRole('region', { name: /Notifications/ })).toContainText('Disponível em breve')
  })
})
