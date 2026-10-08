import type { ReactNode } from 'react';
import { MarcoTienda } from '@/componentes/marco/marco-tienda';

export default function LayoutTienda({ children }: { children: ReactNode }) {
  return <MarcoTienda>{children}</MarcoTienda>;
}
