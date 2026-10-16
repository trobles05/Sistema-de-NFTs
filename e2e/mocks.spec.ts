import { expect, test, type Page } from '@playwright/test'

/** Chama /api/saude de dentro da página (passa pelo service worker do MSW). */
function consultarSaude(page: Page) {
  return page.evaluate(async () => {
    const inicio = performance.now()
    try {
      const resposta = await fetch('/api/saude')
      return { ok: true, corpo: (await resposta.json()) as { status: string; cenario: string }, ms: performance.now() - inicio }
    } catch {
      return { ok: false, corpo: null, ms: performance.now() - inicio }
    }
  })
}

/** O app só renderiza depois que os mocks sobem: a tela visível é o sinal de pronto. */
async function abrir(page: Page, caminho: string) {
  await page.goto(caminho)
  await expect(page.locator('h1').first()).toBeVisible()
}

test.describe('servidor simulado (MSW) no build de demonstração', () => {
  test('responde a API pelo service worker no cenário padrão', async ({ page }) => {
    await abrir(page, '/')
    const saude = await consultarSaude(page)
    expect(saude.corpo).toMatchObject({ status: 'ok', cenario: 'padrao' })
  })

  test('?cenario=offline derruba as chamadas e o parâmetro some da URL', async ({ page }) => {
    await abrir(page, '/?cenario=offline')
    await expect(page).toHaveURL(/\/$/)
    expect((await consultarSaude(page)).ok).toBe(false)
  })

  test('o cenário escolhido sobrevive ao refresh', async ({ page }) => {
    await abrir(page, '/?cenario=lento')
    await page.reload()
    await expect(page.getByRole('heading', { name: 'KURIO' })).toBeVisible()
    expect(await page.evaluate(() => window.__kurioMocks?.cenario())).toBe('lento')
  })

  test('__kurioMocks troca o cenário em tempo de execução', async ({ page }) => {
    await abrir(page, '/')
    await page.evaluate(() => window.__kurioMocks?.definirCenario('lento'))
    const saude = await consultarSaude(page)
    expect(saude.corpo?.cenario).toBe('lento')
    expect(saude.ms).toBeGreaterThanOrEqual(1500)
  })

  test('?reset-mocks reseta e também some da URL', async ({ page }) => {
    await abrir(page, '/carrinho?reset-mocks&cenario=padrao')
    await expect(page).toHaveURL(/\/carrinho$/)
    expect(await page.evaluate(() => window.__kurioMocks?.cenarios)).toContain('pagamento-recusado')
  })
})

test('a vitrine de componentes não existe no build de produção', async ({ page }) => {
  await page.goto('/dev/componentes')
  await expect(page.getByRole('heading', { name: 'Página não encontrada' })).toBeVisible()
})
