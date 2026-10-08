import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const AVISO = 'En esta demostración las cuentas necesitan conectar la base de datos.';

for (const ruta of ['/entrar', '/registro', '/recuperar', '/nueva-contrasena', '/cuenta', '/cuenta/pedidos', '/cuenta/favoritos', '/cuenta/direcciones', '/cuenta/datos']) {
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
