import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

const FRANJA = 'Panel de demostración: puedes mirar todo, los cambios no se guardan.';

const SECCIONES = [
  { enlace: 'Pedidos', titulo: 'Pedidos' },
  { enlace: 'Productos', titulo: 'Productos' },
  { enlace: 'Encargos', titulo: 'Encargos' },
  { enlace: 'Mensajes', titulo: 'Mensajes' },
  { enlace: 'Clientes', titulo: 'Clientes' },
  { enlace: 'Resumen', titulo: 'Resumen' },
];

/** En móvil la navegación del panel está tras el botón «Menú». */
async function irA(pagina: Page, enlace: string) {
  const menu = pagina.getByRole('button', { name: 'Menú' });
  if (await menu.isVisible()) await menu.click();
  await pagina.getByRole('navigation', { name: 'Secciones del panel' }).getByRole('link', { name: new RegExp(`^${enlace}`) }).click();
}

async function sinFallosGraves(pagina: Page) {
  const { violations } = await new AxeBuilder({ page: pagina }).analyze();
  const graves = violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
  expect(graves.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`)).toEqual([]);
}

test('el botón del pie lleva al panel de demostración', async ({ page }) => {
  await page.goto('/', { waitUntil: 'load' });
  await page.getByRole('contentinfo').getByRole('button', { name: 'Ver el panel de demostración' }).click();
  await expect(page).toHaveURL(/\/panel$/);
  await expect(page.getByRole('heading', { level: 1, name: 'Resumen' })).toBeVisible();
  await expect(page.getByText(FRANJA)).toBeVisible();
});

test('se recorren todas las secciones del panel', async ({ page }) => {
  await page.goto('/panel', { waitUntil: 'load' });
  await expect(page.getByRole('img', { name: /en los últimos 30 días/ })).toBeVisible();
  for (const { enlace, titulo } of SECCIONES) {
    await irA(page, enlace);
    await expect(page.getByRole('heading', { level: 1, name: titulo })).toBeVisible();
    // En móvil el menú se cierra al navegar: el enlace sigue ahí, oculto.
    const actual = page.locator('nav[aria-label="Secciones del panel"] a[aria-current="page"]');
    await expect(actual).toContainText(enlace);
  }
});

test('pedidos: filtrar, buscar y abrir la ficha', async ({ page }) => {
  await page.goto('/panel/pedidos', { waitUntil: 'load' });
  await expect(page.getByText('25 pedidos')).toBeVisible();
  await page.getByRole('link', { name: 'Enviado', exact: true }).click();
  await expect(page).toHaveURL(/estado=enviado/);
  await page.getByRole('searchbox', { name: 'Buscar pedidos' }).fill('elena');
  await page.getByRole('searchbox', { name: 'Buscar pedidos' }).press('Enter');
  await expect(page).toHaveURL(/q=elena/);
  await page.getByRole('link', { name: /^OV-\d{4}-0916$/ }).click();
  await expect(page.getByRole('heading', { level: 1, name: /Pedido OV-\d{4}-0916/ })).toBeVisible();
  await expect(page.getByText('Es para un regalo')).toBeVisible();
});

test('guardar está bloqueado y dice por qué', async ({ page }) => {
  await page.goto('/panel/pedidos?estado=pagado', { waitUntil: 'load' });
  await page.getByRole('row').nth(1).getByRole('link').first().click();
  const guardar = page.getByRole('button', { name: 'Guardar cambios' });
  await expect(guardar).toHaveAttribute('aria-disabled', 'true');
  await expect(guardar).toHaveAccessibleDescription(FRANJA);
  await page.getByLabel('Estado', { exact: true }).selectOption('en_preparacion');
  await guardar.click({ force: true });
  await expect(page.getByRole('status').filter({ hasText: 'Pedido marcado' })).toHaveCount(0);

  await page.goto('/panel/productos/manta-estrella', { waitUntil: 'load' });
  await expect(page.getByRole('button', { name: 'Guardar cambios' })).toHaveAttribute('aria-disabled', 'true');
  await expect(page.getByRole('button', { name: 'Subir las fotos' })).toHaveAttribute('aria-disabled', 'true');

  await page.goto('/panel/encargos', { waitUntil: 'load' });
  await page.getByRole('link', { name: 'Manta o mantita' }).click();
  await expect(page.getByRole('img', { name: /Foto de referencia 1/ })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Guardar' })).toHaveAttribute('aria-disabled', 'true');

  await page.goto('/panel/mensajes', { waitUntil: 'load' });
  await expect(page.getByRole('button', { name: 'Marcar como respondido' }).first()).toHaveAttribute('aria-disabled', 'true');
});

test('el panel no tiene fallos de accesibilidad graves', async ({ page }) => {
  // Sin animaciones de entrada: a mitad de un fundido el contraste que mide
  // axe es el de un texto aún transparente, no el definitivo.
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const ruta of [
    '/panel',
    '/panel/pedidos',
    '/panel/pedidos/00000000-0000-4000-8000-000000000016',
    '/panel/productos',
    '/panel/productos/manta-estrella',
    '/panel/productos/nuevo',
    '/panel/encargos',
    '/panel/encargos/00000000-0000-4000-9000-000000000002',
    '/panel/mensajes',
    '/panel/clientes',
  ]) {
    await page.goto(ruta, { waitUntil: 'load' });
    await sinFallosGraves(page);
  }
});

test('una ficha que no existe da su página de «no encontrado»', async ({ page }) => {
  const respuesta = await page.goto('/panel/pedidos/00000000-0000-4000-8000-000000000999', { waitUntil: 'load' });
  expect(respuesta?.status()).toBe(404);
  await expect(page.getByRole('heading', { name: 'No lo encontramos' })).toBeVisible();
});
