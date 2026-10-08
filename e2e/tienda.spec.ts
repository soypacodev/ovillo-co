import { expect, test } from '@playwright/test';

// Lo que enseña la tienda tiene que cuadrar con lo que se cobra y con lo
// que se ve en la foto.

const cajon = (pagina: import('@playwright/test').Page) => pagina.getByRole('dialog', { name: /cesta/i });

test('al cambiar de color cambia la foto, y la cesta lleva esa foto y el precio de la ficha', async ({ page }) => {
  await page.goto('/tienda/bolso-red-mercado', { waitUntil: 'load' });
  const precio = page.locator('.precio-ficha');
  // Precio final con la rebaja de accesorios ya aplicada y explicada.
  await expect(precio.locator('.precio-g')).toHaveText(/18,70/);
  await expect(precio.locator('.antes')).toHaveText(/22,00/);
  await expect(page.getByText(/Rebajas de accesorios:/)).toBeVisible();

  const fotoVisible = page.locator('.galeria .principal img.visible');
  await expect(fotoVisible).toHaveAttribute('alt', /color crudo/);
  await page.getByRole('button', { name: 'Rosa palo', exact: true }).click();
  await expect(fotoVisible).toHaveAttribute('alt', /rosa palo/);

  await page.getByRole('button', { name: /^Añadir a la cesta\s+18,70/ }).click();
  await expect(cajon(page)).toBeVisible();
  const linea = cajon(page).getByRole('listitem').filter({ hasText: 'Bolso de red para el mercado' });
  await expect(linea).toContainText('Rosa palo');
  await expect(linea.locator('.precio')).toHaveText(/18,70/);
  await expect(linea.locator('img')).toHaveAttribute('src', /bolso-red-mercado-2/);
});

test('la talla se elige en la ficha y llega a la cesta', async ({ page }) => {
  await page.goto('/tienda?cat=accesorios', { waitUntil: 'load' });
  // Sin elegir talla no se añade desde la tarjeta: se va a la ficha.
  await page.getByRole('link', { name: /^Elegir talla\s*:\s*Gorro con pompón/ }).click({ force: true });
  await expect(page).toHaveURL(/\/tienda\/gorro-pompon$/);
  await expect(page.getByRole('group', { name: 'Talla' })).toBeVisible();
  await page.getByRole('button', { name: 'Adulto', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Adulto', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: /^Añadir a la cesta/ }).first().click();
  await expect(cajon(page).getByRole('listitem').filter({ hasText: 'Gorro con pompón' })).toContainText('Adulto');
});

test('un código que hace perder el envío gratis lo avisa', async ({ page }) => {
  await page.goto('/tienda/cojin-relieve', { waitUntil: 'load' });
  await page.getByRole('button', { name: /^Añadir a la cesta/ }).first().click();
  await page.goto('/tienda/bolso-red-mercado', { waitUntil: 'load' });
  await page.getByRole('button', { name: /^Añadir a la cesta/ }).first().click();
  await page.goto('/cesta', { waitUntil: 'load' });
  const principal = page.getByRole('main');
  await expect(principal.getByText('¡Envío gratis conseguido!')).toBeVisible();
  await principal.getByLabel('Código de descuento').fill('HOLA10');
  await principal.getByRole('button', { name: 'Aplicar' }).click();
  await expect(principal.getByText(/Con este código te faltan 2,57/).first()).toBeVisible();
});

test('la lupa de la cabecera lleva al buscador de la tienda', async ({ page }) => {
  await page.goto('/taller', { waitUntil: 'load' });
  await page.getByRole('link', { name: 'Buscar en la tienda' }).click();
  await expect(page).toHaveURL(/\/tienda/);
  await expect(page.getByRole('searchbox')).toBeFocused();
  await page.getByRole('searchbox').fill('osita');
  await page.getByRole('searchbox').press('Enter');
  await expect(page).toHaveURL(/q=osita/);
});
