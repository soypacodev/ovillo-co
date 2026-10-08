// Iconos de trazo del sitio. Son decorativos por defecto (aria-hidden):
// el nombre accesible lo pone siempre el botón o el enlace que los
// contiene. Se puede cambiar el tamaño con width/height.

import type { SVGProps } from 'react';

type PropsIcono = SVGProps<SVGSVGElement>;

function Trazo({ children, width = 21, height = 21, strokeWidth = 1.7, ...resto }: PropsIcono) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...resto}
    >
      {children}
    </svg>
  );
}

export function IcoLupa(props: PropsIcono) {
  return (
    <Trazo {...props}>
      <circle cx="11" cy="11" r="7" />
      <path d="M16.5 16.5 21 21" />
    </Trazo>
  );
}

export function IcoPersona(props: PropsIcono) {
  return (
    <Trazo {...props}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4.5 21c1.2-4.2 4-6.2 7.5-6.2s6.3 2 7.5 6.2" />
    </Trazo>
  );
}

export function IcoCesta(props: PropsIcono) {
  return (
    <Trazo {...props}>
      <path d="M4 8h16l-1.4 11a2 2 0 0 1-2 1.8H7.4a2 2 0 0 1-2-1.8L4 8Z" />
      <path d="M9 8V6a3 3 0 0 1 6 0v2" />
    </Trazo>
  );
}

export function IcoMenu(props: PropsIcono) {
  return (
    <Trazo width={22} height={22} strokeWidth={1.8} {...props}>
      <path d="M3 7h18M3 12h18M3 17h18" />
    </Trazo>
  );
}

export function IcoCerrar(props: PropsIcono) {
  return (
    <Trazo width={20} height={20} strokeWidth={1.8} {...props}>
      <path d="M6 6l12 12M18 6 6 18" />
    </Trazo>
  );
}

export function IcoCorazon(props: PropsIcono) {
  return (
    <Trazo width={17} height={17} {...props}>
      <path d="M12 20.5s-6.5-4.2-6.5-9.3A3.7 3.7 0 0 1 12 8.6a3.7 3.7 0 0 1 6.5 2.6c0 5.1-6.5 9.3-6.5 9.3Z" />
    </Trazo>
  );
}

export function IcoFlecha(props: PropsIcono) {
  return (
    <Trazo width={17} height={17} strokeWidth={2} {...props}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </Trazo>
  );
}

export function IcoAtras(props: PropsIcono) {
  return (
    <Trazo width={17} height={17} strokeWidth={2} {...props}>
      <path d="M19 12H5M11 18l-6-6 6-6" />
    </Trazo>
  );
}

/** Cruz del acordeón: gira 135° cuando el <details> está abierto. */
export function IcoMas({ className, ...props }: PropsIcono) {
  return (
    <Trazo width={18} height={18} strokeWidth={1.8} className={className ?? 'mas'} {...props}>
      <path d="M12 5v14M5 12h14" />
    </Trazo>
  );
}

export function IcoMenos(props: PropsIcono) {
  return (
    <Trazo width={16} height={16} strokeWidth={2} {...props}>
      <path d="M5 12h14" />
    </Trazo>
  );
}

export function IcoMasMini(props: PropsIcono) {
  return (
    <Trazo width={16} height={16} strokeWidth={2} {...props}>
      <path d="M12 5v14M5 12h14" />
    </Trazo>
  );
}

export function IcoInfo(props: PropsIcono) {
  return (
    <Trazo width={20} height={20} {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7.5v5M12 16.2h.01" />
    </Trazo>
  );
}

export function IcoOk(props: PropsIcono) {
  return (
    <Trazo width={20} height={20} strokeWidth={2} {...props}>
      <path d="M20 6 9 17l-5-5" />
    </Trazo>
  );
}

export function IcoCamion(props: PropsIcono) {
  return (
    <Trazo width={22} height={22} strokeWidth={1.6} {...props}>
      <rect x="2" y="7" width="14" height="10" rx="2" />
      <path d="M16 10h3.5L22 13v4h-6M6 20a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm12 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
    </Trazo>
  );
}

export function IcoEstrella(props: PropsIcono) {
  return (
    <Trazo width={22} height={22} strokeWidth={1.6} {...props}>
      <path d="M12 3l2.6 5.6 6 .8-4.4 4.2 1.1 6-5.3-3-5.3 3 1.1-6L3.4 9.4l6-.8L12 3Z" />
    </Trazo>
  );
}

export function IcoCorazonG(props: PropsIcono) {
  return (
    <Trazo width={22} height={22} strokeWidth={1.6} {...props}>
      <path d="M12 21s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 11c0 5.5-7 10-7 10Z" />
    </Trazo>
  );
}

export function IcoTijeras(props: PropsIcono) {
  return (
    <Trazo width={22} height={22} strokeWidth={1.6} {...props}>
      <circle cx="6" cy="6" r="3" />
      <circle cx="6" cy="18" r="3" />
      <path d="M20 4 8.1 15.9M8.1 8.1 20 20" />
    </Trazo>
  );
}

export function IcoSobre(props: PropsIcono) {
  return (
    <Trazo width={22} height={22} strokeWidth={1.6} {...props}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </Trazo>
  );
}

export function IcoInsta(props: PropsIcono) {
  return (
    <Trazo width={19} height={19} {...props}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" stroke="none" />
    </Trazo>
  );
}

export function IcoPinterest(props: PropsIcono) {
  return (
    <Trazo width={19} height={19} {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M9.5 20l2-6M9 10.5c0-1.7 1.4-3 3.2-3s3.1 1.1 3.1 2.9c0 2.3-1.4 4-3.1 4-.9 0-1.6-.5-1.8-1.2" />
    </Trazo>
  );
}

/** El ovillo de la marca. Lleva sus propios colores, no hereda. */
export function IcoRejilla(props: PropsIcono) {
  return (
    <Trazo {...props}>
      <rect x="3.5" y="3.5" width="7" height="7" rx="1.5" />
      <rect x="13.5" y="3.5" width="7" height="7" rx="1.5" />
      <rect x="3.5" y="13.5" width="7" height="7" rx="1.5" />
      <rect x="13.5" y="13.5" width="7" height="7" rx="1.5" />
    </Trazo>
  );
}

export function IcoCaja(props: PropsIcono) {
  return (
    <Trazo {...props}>
      <path d="M3.5 7.5 12 3l8.5 4.5v9L12 21l-8.5-4.5v-9Z" />
      <path d="M3.5 7.5 12 12l8.5-4.5M12 12v9" />
    </Trazo>
  );
}

export function IcoEtiqueta(props: PropsIcono) {
  return (
    <Trazo {...props}>
      <path d="M3.5 12.2V4.5a1 1 0 0 1 1-1h7.7l8.3 8.3a1.5 1.5 0 0 1 0 2.1l-6.6 6.6a1.5 1.5 0 0 1-2.1 0l-8.3-8.3Z" />
      <circle cx="8.2" cy="8.2" r="1.4" />
    </Trazo>
  );
}

export function IcoGrupo(props: PropsIcono) {
  return (
    <Trazo {...props}>
      <circle cx="9" cy="8.5" r="3.3" />
      <path d="M3 20c.9-3.4 3.2-5 6-5s5.1 1.6 6 5" />
      <path d="M16 5.6a3.2 3.2 0 0 1 0 5.9M18 15.3c1.4.8 2.4 2.3 2.9 4.7" />
    </Trazo>
  );
}

export function IcoSalir(props: PropsIcono) {
  return (
    <Trazo {...props}>
      <path d="M14 4h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4" />
      <path d="M10 16.5 5.5 12 10 7.5M5.5 12H15" />
    </Trazo>
  );
}

export function IcoCandado(props: PropsIcono) {
  return (
    <Trazo width={18} height={18} {...props}>
      <rect x="5" y="10.5" width="14" height="10" rx="2" />
      <path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" />
    </Trazo>
  );
}

export function IcoOjo(props: PropsIcono) {
  return (
    <Trazo {...props}>
      <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
      <circle cx="12" cy="12" r="2.8" />
    </Trazo>
  );
}

export function IcoCasa(props: PropsIcono) {
  return (
    <Trazo {...props}>
      <path d="M4 10.5 12 4l8 6.5V19a1 1 0 0 1-1 1h-4.5v-5.5h-5V20H5a1 1 0 0 1-1-1v-8.5Z" />
    </Trazo>
  );
}

export function Ovillo({ width = 30, height = 30, ...props }: PropsIcono) {
  return (
    <svg width={width} height={height} viewBox="0 0 30 30" aria-hidden="true" focusable="false" {...props}>
      <circle cx="15" cy="15" r="13" fill="#C6DCEC" />
      <path
        d="M4 12c7 3 15 3 22 0M3 18c7 3 16 3 23-1M9 3c-3 7-3 17 1 24M20 3c3 7 3 17 0 24"
        fill="none"
        stroke="#28618F"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Corazón centrado y del tamaño de los demás iconos de la cabecera. */
export function IcoFavoritos(props: PropsIcono) {
  return (
    <Trazo {...props}>
      <path d="M12 20s-7.5-4.6-7.5-10.3A4.3 4.3 0 0 1 12 6.9a4.3 4.3 0 0 1 7.5 2.8C19.5 15.4 12 20 12 20Z" />
    </Trazo>
  );
}
