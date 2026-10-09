import { describe, expect, it } from 'vitest';
import { crearEsquemaDatos, erroresPorCampo, esquemaDatos } from './esquema';
import { erroresDatos, type DatosPedido } from './opciones';

const BASE: DatosPedido = {
  email: 'ana@correo.example',
  nombre: 'Ana',
  apellidos: 'Pérez',
  telefono: '',
  envio: 'ordinario',
  calle: 'Calle Larios 1',
  piso: '',
  cp: '29005',
  ciudad: 'Málaga',
  provincia: 'Málaga',
  regalo: false,
  dedicatoria: '',
  nota: '',
  acepta: true,
};

const delServidor = (d: DatosPedido) => {
  const r = esquemaDatos.safeParse(d);
  return r.success ? {} : erroresPorCampo(r.error.issues);
};

describe('reglas de los datos de entrega', () => {
  it('navegador y servidor dan los mismos mensajes', () => {
    const casos: DatosPedido[] = [
      BASE,
      { ...BASE, email: 'ana', nombre: '  ', cp: '28001', acepta: false },
      { ...BASE, telefono: 'llámame', provincia: 'Narnia', calle: '' },
      { ...BASE, envio: 'recogida', calle: '', cp: '', ciudad: '', provincia: '' },
      { ...BASE, nota: 'x'.repeat(501), cp: '123456' },
    ];
    for (const caso of casos) expect(erroresDatos(caso)).toEqual(delServidor(caso));
    const caso = { ...BASE, email: 'ana', cp: '28001', acepta: false };
    const servidor = crearEsquemaDatos('fr').safeParse(caso);
    expect(servidor.success).toBe(false);
    if (!servidor.success) expect(erroresDatos(caso, 'fr')).toEqual(erroresPorCampo(servidor.error.issues));
  });

  it('marca cada campo con su primer error', () => {
    expect(erroresDatos({ ...BASE, email: 'ana', cp: '28001', acepta: false })).toEqual({
      email: 'Escribe un correo válido: es donde te avisaremos.',
      cp: 'Ese código postal es de Madrid.',
      acepta: 'Tienes que aceptar los términos para poder pedir.',
    });
  });
});
