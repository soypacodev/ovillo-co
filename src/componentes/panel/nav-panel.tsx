'use client';

// Navegación lateral del panel. En pantallas estrechas se pliega bajo una
// barra con el botón «Menú» (un desplegable normal, no un diálogo: no
// tapa la página ni atrapa el foco).

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useId, useState, type ReactNode } from 'react';
import { BotonSalir } from '@/componentes/cuenta/boton-salir';
import {
  IcoCaja,
  IcoCasa,
  IcoCerrar,
  IcoEtiqueta,
  IcoGrupo,
  IcoMenu,
  IcoRejilla,
  IcoSobre,
  IcoTijeras,
  Ovillo,
} from '@/componentes/iconos';
import { rutas } from '@/lib/rutas';

interface ContadoresPanel {
  pedidos: number;
  encargos: number;
  mensajes: number;
}

interface PropsNav {
  contadores: ContadoresPanel;
  nombre: string;
  rolTexto: string;
  /** Solo hay sesión que cerrar con Supabase. */
  conSesion: boolean;
}

interface Seccion {
  href: string;
  texto: string;
  icono: ReactNode;
  contador?: { n: number; texto: string };
}

export function NavPanel({ contadores, nombre, rolTexto, conSesion }: PropsNav) {
  const ruta = usePathname();
  const [abierto, setAbierto] = useState(false);
  const idMenu = useId();

  // Al cambiar de página el menú móvil se cierra solo.
  const [rutaVista, setRutaVista] = useState(ruta);
  if (ruta !== rutaVista) {
    setRutaVista(ruta);
    setAbierto(false);
  }

  useEffect(() => {
    if (!abierto) return;
    const alPulsar = (e: KeyboardEvent) => e.key === 'Escape' && setAbierto(false);
    window.addEventListener('keydown', alPulsar);
    return () => window.removeEventListener('keydown', alPulsar);
  }, [abierto]);

  const secciones: Seccion[] = [
    { href: rutas.panel, texto: 'Resumen', icono: <IcoRejilla /> },
    {
      href: rutas.panelPedidos,
      texto: 'Pedidos',
      icono: <IcoCaja />,
      contador: { n: contadores.pedidos, texto: 'por preparar' },
    },
    { href: rutas.panelProductos, texto: 'Productos', icono: <IcoEtiqueta /> },
    {
      href: rutas.panelEncargos,
      texto: 'Encargos',
      icono: <IcoTijeras />,
      contador: { n: contadores.encargos, texto: 'nuevos' },
    },
    {
      href: rutas.panelMensajes,
      texto: 'Mensajes',
      icono: <IcoSobre />,
      contador: { n: contadores.mensajes, texto: 'sin leer' },
    },
    { href: rutas.panelClientes, texto: 'Clientes', icono: <IcoGrupo /> },
  ];

  const esActual = (href: string) => (href === rutas.panel ? ruta === href : ruta === href || ruta.startsWith(`${href}/`));

  return (
    <div className={abierto ? 'panel-lateral abierto' : 'panel-lateral'}>
      <div className="panel-marca">
        <Link href={rutas.panel} className="panel-logo">
          <Ovillo width={28} height={28} />
          <span>
            Ovillo &amp; Co.
            <small>Panel del taller</small>
          </span>
        </Link>
        <button
          type="button"
          className="panel-boton-menu"
          aria-expanded={abierto}
          aria-controls={idMenu}
          onClick={() => setAbierto((a) => !a)}
        >
          {abierto ? <IcoCerrar /> : <IcoMenu />}
          <span>{abierto ? 'Cerrar' : 'Menú'}</span>
        </button>
      </div>

      <div id={idMenu} className="panel-menu">
        <nav aria-label="Secciones del panel">
          <ul>
            {secciones.map((s) => (
              <li key={s.href}>
                <Link href={s.href} aria-current={esActual(s.href) ? 'page' : undefined}>
                  {s.icono}
                  <span className="panel-menu-texto">{s.texto}</span>
                  {s.contador && s.contador.n > 0 && (
                    <span className="panel-contador">
                      {s.contador.n}
                      <span className="oculto-vis"> {s.contador.texto}</span>
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="panel-pie">
          <p className="panel-usuario">
            <b>{nombre}</b>
            <span>{rolTexto}</span>
          </p>
          <Link className="panel-pie-enlace" href={rutas.inicio}>
            <IcoCasa width={18} height={18} />
            Ver la tienda
          </Link>
          {conSesion && <BotonSalir className="panel-pie-enlace" />}
        </div>
      </div>
    </div>
  );
}
