import { defineConfig, devices } from '@playwright/test';

// Pruebas de extremo a extremo sin Supabase: la tienda con la semilla y el
// panel en modo local. Con E2E_URL se usa un servidor ya levantado; si no,
// se arranca uno de desarrollo sin variables de Supabase.
const puerto = 3210;
const url = process.env.E2E_URL ?? `http://localhost:${puerto}`;

export default defineConfig({
  testDir: 'e2e',
  timeout: 60_000,
  // La primera visita a cada ruta en desarrollo compila: se le da margen.
  expect: { timeout: 15_000 },
  fullyParallel: true,
  reporter: [['list']],
  use: {
    baseURL: url,
    trace: 'retain-on-failure',
    launchOptions: {
      // Para usar un Chromium ya instalado (por ejemplo, en CI o en un contenedor).
      executablePath: process.env.E2E_CHROMIUM || undefined,
      args: ['--no-proxy-server'],
    },
  },
  projects: [
    { name: 'escritorio', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } } },
    { name: 'movil', use: { ...devices['Pixel 7'], viewport: { width: 375, height: 800 } } },
  ],
  webServer: process.env.E2E_URL
    ? undefined
    : {
        command: `npx next dev -p ${puerto}`,
        url,
        reuseExistingServer: true,
        timeout: 120_000,
        env: { NEXT_PUBLIC_SUPABASE_URL: '', NEXT_PUBLIC_SUPABASE_ANON_KEY: '' },
      },
});
