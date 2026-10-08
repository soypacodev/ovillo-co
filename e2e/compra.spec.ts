import { expect, test, type Page } from '@playwright/test';

/** Recoge las violaciones de la CSP que el navegador notifica en la página. */
async function vigilarCsp(pagina: Page): Promise<() => Promise<string[]>> {
  await pagina.addInitScript(() => {
    const lista: string[] = [];
    Object.defineProperty(window, '__violacionesCsp', { value: lista });
    document.addEventListener('securitypolicyviolation', (e) => {
      lista.push(`${e.violatedDirective} · ${e.blockedURI || 'en línea'} · ${e.sourceFile}:${e.lineNumber}`);
    });
  });
  return () => pagina.evaluate(() => (window as unknown as { __violacionesCsp: string[] }).__violacionesCsp);
}

async function anadirBolso(pagina: Page) {
  await pagina.goto('/tienda/bolso-red-mercado', { waitUntil: 'load' });
  await pagina.getByRole('button', { name: /^Añadir a la cesta/ }).first().click();
  await expect(pagina.getByRole('dialog', { name: /cesta/i })).toBeVisible();
}

test('compra de principio a fin en modo demostración', async ({ page }) => {
  const violaciones = await vigilarCsp(page);
  await anadirBolso(page);
  await page.goto('/pago', { waitUntil: 'load' });

  // Paso 1: sin datos no se avanza y el error se enlaza al campo.
  await page.getByRole('button', { name: 'Continuar a la entrega' }).click();
  await expect(page.getByLabel('Correo electrónico')).toHaveAttribute('aria-invalid', 'true');
  await page.getByLabel('Correo electrónico').fill('ana@correo.example');
  await page.getByLabel('Nombre', { exact: true }).fill('Ana');
  await page.getByLabel('Apellidos').fill('Pérez');
  await page.getByRole('button', { name: 'Continuar a la entrega' }).click();

  // Paso 2: la provincia sale del código postal.
  await expect(page.getByRole('heading', { name: 'Cómo te lo hacemos llegar' })).toBeFocused();
  await page.getByLabel('Calle y número').fill('Calle Larios 1');
  await page.getByLabel('Código postal').fill('29005');
  await page.getByLabel('Ciudad').fill('Málaga');
  await expect(page.getByLabel('Provincia')).toHaveValue('Málaga');
  await page.getByRole('button', { name: 'Revisar el pedido' }).click();

  // Paso 3: hay que aceptar los términos.
  const confirmar = page.getByRole('button', { name: /Confirmar pedido de prueba/ });
  await confirmar.click();
  await expect(page.getByText('Tienes que aceptar los términos para poder pedir.')).toBeVisible();
  await page.getByRole('checkbox', { name: /He leído y acepto/ }).check();
  expect(await violaciones(), '/pago').toEqual([]);
  await confirmar.click();

  await expect(page).toHaveURL(/\/gracias\?pedido=DEMO-\d{4}-[A-Z2-9]{6}$/);
  await expect(page.getByText('Calle Larios 1, 29005 Málaga, Málaga')).toBeVisible();
  expect(await violaciones()).toEqual([]);
});

test('ninguna página viola la política de seguridad de contenido', async ({ page }) => {
  const violaciones = await vigilarCsp(page);
  const rutas = [
    '/', '/tienda', '/tienda/manta-estrella', '/cesta', '/taller', '/encargos', '/cuidados', '/contacto',
    '/envios', '/legal', '/entrar', '/registro', '/cuenta', '/panel', '/panel/pedidos', '/panel/productos/nuevo',
    '/no-existe',
  ];
  for (const ruta of rutas) {
    await page.goto(ruta, { waitUntil: 'load' });
    expect(await violaciones(), ruta).toEqual([]);
  }
  // El pago valida en el navegador: es donde antes se colaba zod.
  await anadirBolso(page);
  await page.goto('/pago', { waitUntil: 'load' });
  await page.getByRole('button', { name: 'Continuar a la entrega' }).click();
  await expect(page.getByLabel('Correo electrónico')).toHaveAttribute('aria-invalid', 'true');
  expect(await violaciones(), '/pago').toEqual([]);
});
