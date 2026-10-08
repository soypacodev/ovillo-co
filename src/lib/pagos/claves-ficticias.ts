// Claves con la forma de las de Stripe para las pruebas. Se montan por partes
// para que ningún escáner de secretos las confunda con claves reales.
/** `claveFicticia('sk_test', 'x'.repeat(24))` → «sk_test_xxx…». */
export function claveFicticia(tipo: 'sk_test' | 'sk_live' | 'whsec', relleno: string): string {
  return `${tipo}_${relleno}`;
}
