import { expect, test, type Page } from '@playwright/test'

const ehMobile = (page: Page) => (page.viewportSize()?.width ?? 0) < 768
const grade = (page: Page) => page.getByRole('list', { name: 'NFTs' })
const nomesNaGrade = (page: Page) => grade(page).locator('h3').allTextContents()
const resumo = (page: Page) => page.locator('#catalogo p[aria-live="polite"].sr-only')

async function abrir(page: Page, caminho = '/') {
  await page.goto(caminho)
  await expect(grade(page).locator('h3').first()).toBeVisible()
}

/** Abre os filtros: sidebar no desktop, gaveta no mobile. */
async function painelFiltros(page: Page) {
  if (ehMobile(page)) {
    await page.getByRole('button', { name: 'Filtros' }).click()
    return page.getByRole('dialog', { name: 'Filtros' })
  }
  return page.getByRole('complementary', { name: 'Filtros' })
}

async function buscar(page: Page, termo: string) {
  if (!ehMobile(page)) await page.getByRole('button', { name: 'Buscar NFTs' }).click()
  await page.getByRole('searchbox', { name: 'Buscar NFTs' }).fill(termo)
}

const parametro = (page: Page, nome: string) => new URL(page.url()).searchParams.get(nome)

test.describe('catálogo da Início (§3, §9 item 1)', () => {
  test('busca filtra o catálogo e vai para a URL', async ({ page }) => {
    await abrir(page)
    await buscar(page, 'golden')
    await expect.poll(() => parametro(page, 'busca')).toBe('golden')
    await expect.poll(async () => (await nomesNaGrade(page)).every((nome) => /golden/i.test(nome))).toBe(true)
  })

  test('filtros combinados (coleção + rede) e mudança de filtro volta para a página 1', async ({ page }) => {
    await abrir(page, '/')
    await page.getByRole('button', { name: 'Página 2' }).click()
    await expect.poll(() => parametro(page, 'pagina')).toBe('2')

    const painel = await painelFiltros(page)
    await painel.getByRole('button', { name: /^Música/ }).click()
    await expect.poll(() => parametro(page, 'pagina')).toBeNull()
    await painel.getByRole('button', { name: /^Polygon/ }).click()
    await expect(painel.getByRole('button', { name: /^Música/ })).toHaveAttribute('aria-pressed', 'true')
    await expect(painel.getByRole('button', { name: /^Polygon/ })).toHaveAttribute('aria-pressed', 'true')
    await expect.poll(() => [parametro(page, 'categorias'), parametro(page, 'redes')]).toEqual(['["musica"]', '["polygon"]'])
  })

  test('ordenação por menor preço deixa os preços em ordem crescente', async ({ page }) => {
    await abrir(page)
    if (ehMobile(page)) await page.getByRole('button', { name: 'Filtros' }).click()
    await page.getByRole('combobox', { name: 'Ordenar por:' }).click()
    await page.getByRole('option', { name: 'Menor preço' }).click()
    await expect.poll(() => parametro(page, 'ordenacao')).toBe('preco-asc')
    if (ehMobile(page)) await page.keyboard.press('Escape')
    await expect
      .poll(async () => {
        const precos = (await grade(page).locator('p span.font-bold').allTextContents()).map((t) => Number(t.replace(' ETH', '')))
        return precos.length > 0 && precos.every((p, i) => i === 0 || precos[i - 1]! <= p)
      })
      .toBe(true)
  })

  test('refresh mantém o estado e voltar/avançar restauram cada passo', async ({ page }) => {
    await abrir(page)
    const primeiraPagina = await nomesNaGrade(page)

    await page.getByRole('button', { name: 'Página 3' }).click()
    await expect.poll(() => parametro(page, 'pagina')).toBe('3')
    await expect.poll(() => nomesNaGrade(page)).not.toEqual(primeiraPagina)
    const terceiraPagina = await nomesNaGrade(page)

    await page.reload()
    await expect.poll(() => nomesNaGrade(page)).toEqual(terceiraPagina)

    await page.goBack()
    await expect.poll(() => nomesNaGrade(page)).toEqual(primeiraPagina)
    await page.goForward()
    await expect.poll(() => nomesNaGrade(page)).toEqual(terceiraPagina)
  })

  test('URL colada abre já filtrada; parâmetro inválido não derruba a tela', async ({ page }) => {
    await abrir(page, '/?aba=%22em-alta%22&pagina=%22abc%22')
    await expect(page.getByRole('tab', { name: 'Em alta' })).toHaveAttribute('aria-selected', 'true')
    await expect(resumo(page)).toContainText('página 1')
  })

  test('card leva ao detalhe do NFT', async ({ page }) => {
    await abrir(page)
    await grade(page).getByRole('link', { name: /Emerald Ape #042/ }).click()
    await expect(page).toHaveURL((url) => url.pathname === '/nft/nft-001')
  })

  test('resposta atrasada de uma consulta antiga não sobrescreve a atual (fora de ordem)', async ({ page }) => {
    // 1ª consulta da listagem responde em 1,2 s; a 2ª, em 0,2 s.
    await page.goto('/?cenario=fora-de-ordem')
    const painel = await painelFiltros(page)
    await painel.getByRole('button', { name: /^Jogos/ }).click()
    await expect(resumo(page)).toBeAttached()
    const daBuscaAtual = await resumo(page).textContent()
    await page.waitForTimeout(1500)
    await expect(resumo(page)).toHaveText(daBuscaAtual!)
    expect(parametro(page, 'categorias')).toBe('["jogos"]')
  })
})
