// Respuesta común de las acciones de formulario. Los errores esperables
// (validación, límite de envíos) viajan como datos y no como excepciones,
// para que el formulario los pinte junto a cada campo.

export type EstadoFormulario<C extends string> =
  | { estado: 'inicial' }
  | {
      estado: 'error';
      /** Resumen para el aviso general y los lectores de pantalla. */
      mensaje: string;
      errores: Partial<Record<C, string>>;
      /** Lo que se envió, para no perderlo si la página se recarga sin JavaScript. */
      valores: Partial<Record<C, string>>;
    }
  | {
      estado: 'enviado';
      /** false cuando no hay base de datos: el envío se valida pero no se guarda. */
      guardado: boolean;
    };

export const ESTADO_INICIAL = { estado: 'inicial' } as const;

/** Estado de los formularios de un solo correo (boletín, aviso de
 *  reposición). `intento` cambia en cada envío para que el campo se vuelva
 *  a montar con lo que se escribió cuando hay un error. */
export type EstadoCorreo =
  | { estado: 'inicial'; intento: number }
  | { estado: 'error'; intento: number; mensaje: string; correo: string }
  | { estado: 'ok'; intento: number; mensaje: string };

export const CORREO_INICIAL: EstadoCorreo = { estado: 'inicial', intento: 0 };
