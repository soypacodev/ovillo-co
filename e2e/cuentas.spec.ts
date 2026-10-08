import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const AVISO = 'En esta demostración las cuentas necesitan conectar la base de datos.';

for (const ruta of ['/entrar', '/registro', '/recuperar', '/nueva-contrasena', '/cuenta', '/cuenta/pedidos', '/cuenta/direcciones', '/cuenta/datos']) {
  test(`${ruta} explica que las cuentas necesitan la base de datos`, async ({ page }) => {
    const respuesta = await page.goto(ruta, { waitUntil: 'load' });
    expect(respuesta?.status()).toBe(200);
    await expect(page.getByText(AVISO)).toBeVisible();
    await expect(page.getByRole('main').getByRole('button', { name: 'Ver el panel de demostración' })).toBeVisible();
  });
}

test('sin sesión, el icono de la cuenta lleva a entrar', async ({ page, isMobile }) => {
  test.skip(isMobile, 'En móvil la cuenta está dentro del menú.');
  await page.goto('/', { waitUntil: 'load' });
  await page.getByRole('link', { name: 'Entrar en mi cuenta' }).click();
  await expect(page).toHaveURL(/\/entrar$/);
});

test('desde entrar se llega al panel de demostración', async ({ page }) => {
  await page.goto('/entrar', { waitUntil: 'load' });
  await page.getByRole('main').getByRole('button', { name: 'Ver el panel de demostración' }).click();
  await expect(page).toHaveURL(/\/panel$/);
});

test('las páginas de cuenta no tienen fallos de accesibilidad graves', async ({ page }) => {
  // Sin animaciones de entrada: a mitad de un fundido el contraste que mide
  // axe es el de un texto aún transparente, no el definitivo.
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const ruta of ['/entrar', '/cuenta']) {
    await page.goto(ruta, { waitUntil: 'load' });
    const { violations } = await new AxeBuilder({ page }).analyze();
    expect(violations.filter((v) => v.impact === 'serious' || v.impact === 'critical').map((v) => v.id)).toEqual([]);
  }
});

test('sin base de datos, los favoritos del navegador se ven igual', async ({ page, isMobile }) => {
  await page.goto('/tienda/osita-vestido-lila', { waitUntil: 'load' });
  await page.getByRole('button', { name: 'Guardar en favoritos' }).click();
  await expect(page.getByRole('button', { name: 'Guardado en favoritos' })).toBeVisible();
  if (!isMobile) {
    await expect(page.getByRole('link', { name: 'Tus favoritos, 1 pieza' })).toBeVisible();
  }

  // La página de la cuenta lleva a la de favoritos, que no necesita cuenta.
  await page.goto('/cuenta/favoritos', { waitUntil: 'load' });
  await expect(page).toHaveURL(/\/favoritos$/);
  await expect(page.getByRole('heading', { level: 1, name: 'Tus favoritos' })).toBeVisible();
  await expect(page.getByText('1 pieza guardada')).toBeVisible();
  await expect(page.getByRole('heading', { level: 3, name: 'Osita con vestido lila' })).toBeVisible();
});
