import Link from 'next/link';
import { rutas } from '@/lib/rutas';

export default function NoEncontradoPanel() {
  return (
    <div className="panel-vacio">
      <h1>No lo encontramos</h1>
      <p className="mini mt-2">Puede que se haya borrado o que el enlace esté mal copiado.</p>
      <Link className="btn btn-2 btn-p mt-5" href={rutas.panel}>
        Volver al resumen
      </Link>
    </div>
  );
}
