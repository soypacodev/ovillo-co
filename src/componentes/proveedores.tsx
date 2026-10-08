import type { ReactNode } from 'react';
import { ProveedorCesta } from '@/lib/cesta/contexto';
import { ProveedorBrindis } from './brindis';

export function Proveedores({ children }: { children: ReactNode }) {
  return (
    <ProveedorBrindis>
      <ProveedorCesta>{children}</ProveedorCesta>
    </ProveedorBrindis>
  );
}
