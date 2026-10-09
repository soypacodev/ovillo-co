import { expect, test } from '@playwright/test';

// La tienda en otros idiomas: detección del navegador, selector, hreflang
// y una compra completa en alemán. El panel siempre en español.

test.describe('navegador en inglés', () => {
  test.use({ locale: 'en-GB' });

  test('la primera visita va a /en y la tienda sale en inglés', async ({ page, isMobile }) => {
    await page.goto('/tienda', { waitUntil: 'load' });
    await expect(page).toHaveURL(/\/en\/tienda$/);
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    // En móvil el menú principal va dentro del menú desplegable.
    if (isMobile) return;
    await expect(page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'Shop', exact: true })).toHaveAttribute(
      'aria-current',
      'page',
    );
  });

  test('elegir español en el selector se recuerda aunque el navegador pida inglés', async ({ page, isMobile }) => {
    test.skip(isMobile, 'El selector compacto está en la cabecera de escritorio');
    await page.goto('/en/tienda/bolso-red-mercado', { waitUntil: 'load' });
    await page.locator('.selector-idioma summary').click();
    await page.getByRole('banner').getByRole('link', { name: 'Español' }).click();
    await expect(page).toHaveURL(/\/tienda\/bolso-red-mercado$/);
    await expect(page.locator('html')).toHaveAttribute('lang', 'es');
    await page.goto('/taller', { waitUntil: 'load' });
    await expect(page).toHaveURL(/\/taller$/);
    await expect(page.locator('html')).toHaveAttribute('lang', 'es');
  });
});

test('cada página dice dónde están sus versiones en los otros idiomas', async ({ page }) => {
  await page.goto('/fr/tienda/manta-estrella', { waitUntil: 'load' });
  const enlace = (idioma: string) => page.locator(`link[rel="alternate"][hreflang="${idioma}"]`);
  await expect(enlace('es')).toHaveAttribute('href', /\/tienda\/manta-estrella$/);
  await expect(enlace('en')).toHaveAttribute('href', /\/en\/tienda\/manta-estrella$/);
  await expect(enlace('de')).toHaveAttribute('href', /\/de\/tienda\/manta-estrella$/);
  await expect(enlace('x-default')).toHaveAttribute('href', /\/tienda\/manta-estrella$/);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /\/fr\/tienda\/manta-estrella$/);
});

test('la cesta cambia de idioma con la tienda sin perder nada', async ({ page }) => {
  await page.goto('/en/tienda/bolso-red-mercado', { waitUntil: 'load' });
  await page.getByRole('button', { name: 'Dusty pink', exact: true }).click();
  await page.getByRole('button', { name: /^Add to basket/ }).first().click();
  const cajon = page.getByRole('dialog', { name: /basket/i });
  await expect(cajon).toBeVisible();
  const linea = cajon.getByRole('listitem').filter({ hasText: 'Market string bag' });
  await expect(linea).toContainText('Dusty pink');
  await expect(linea.locator('.precio')).toHaveText(/€18\.70/);

  await page.goto('/fr/cesta', { waitUntil: 'load' });
  await expect(page.getByText('Filet à provisions').first()).toBeVisible();
  await expect(page.getByText('Vieux rose').first()).toBeVisible();
});

test('compra completa en alemán', async ({ page }) => {
  await page.goto('/de/tienda/bolso-red-mercado', { waitUntil: 'load' });
  await page.getByRole('button', { name: /^In den Warenkorb/ }).first().click();
  await expect(page.getByRole('dialog', { name: /Warenkorb/i })).toBeVisible();
  await page.goto('/de/pago', { waitUntil: 'load' });

  await page.getByLabel('E-Mail-Adresse').fill('anna@mail.example');
  await page.getByLabel('Vorname', { exact: true }).fill('Anna');
  await page.getByLabel('Nachname').fill('Becker');
  await page.getByRole('button', { name: 'Weiter zur Lieferung' }).click();

  await page.getByLabel('Straße und Hausnummer').fill('Calle Larios 1');
  await page.getByLabel('Postleitzahl').fill('29005');
  await page.getByRole('textbox', { name: 'Ort', exact: true }).fill('Málaga');
  await page.getByRole('button', { name: 'Bestellung prüfen' }).click();

  await page.getByRole('checkbox').check();
  await page.getByRole('button', { name: /Testbestellung/ }).click();
  await expect(page).toHaveURL(/\/de\/gracias\?pedido=DEMO-/);
  await expect(page.locator('html')).toHaveAttribute('lang', 'de');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Danke');
});

test('el panel no se traduce: /en/panel lleva al panel de siempre', async ({ page }) => {
  await page.goto('/en/panel', { waitUntil: 'load' });
  await expect(page).toHaveURL(/\/panel$/);
  await expect(page.locator('html')).toHaveAttribute('lang', 'es');
});
