import Link from 'next/link';
import { IcoCamion, IcoCesta, IcoCorazonG, IcoSobre } from '@/componentes/iconos';
import { rutas } from '@/lib/rutas';

const VENTAJAS = [
  { icono: <IcoCamion />, titulo: 'Ver tus pedidos', texto: 'Todo el historial con el estado de cada uno y el número de seguimiento.' },
  { icono: <IcoSobre />, titulo: 'No repetir la dirección', texto: 'Guardas las que uses y en el siguiente pedido eliges y listo.' },
  { icono: <IcoCorazonG />, titulo: 'Favoritos en todas partes', texto: 'Lo que guardas en el móvil aparece también en el ordenador.' },
  { icono: <IcoCesta />, titulo: 'Comprar igual sin cuenta', texto: 'No hace falta para pedir: es solo para quien quiera tenerlo todo a mano.' },
];

/** Para qué sirve tener cuenta, junto a los formularios de acceso. */
export function VentajasCuenta() {
  return (
    <>
      <div className="banda">
        <p className="eyebrow">Con cuenta puedes</p>
        <h2 className="mt-1 cuenta-ventajas-titulo">Cuatro cosas útiles</h2>
        <ul className="cuenta-ventajas">
          {VENTAJAS.map((v) => (
            <li key={v.titulo}>
              {v.icono}
              <span>
                <b>{v.titulo}</b>
                {v.texto}
              </span>
            </li>
          ))}
        </ul>
      </div>
      <div className="caja mt-4">
        <h2 className="titulo-mini">Sobre tus datos</h2>
        <p className="mini mt-2">
          Guardamos tu nombre, tu correo y las direcciones que metas. La contraseña se guarda cifrada: no la podemos
          ver ni queriendo. Puedes borrar la cuenta cuando quieras desde «Mis datos».
        </p>
        <Link href={`${rutas.legal}#privacidad`} className="mini enlace mt-3">
          Leer la política de privacidad
        </Link>
      </div>
    </>
  );
}
