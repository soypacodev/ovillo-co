import { describe, expect, it } from 'vitest';
import {
  LIMITES_FOTOS,
  avisoRevisar,
  erroresPorCampo,
  esquemaContacto,
  esquemaEncargo,
  formularioAObjeto,
  valoresDeTexto,
  type CampoContacto,
  type CampoEncargo,
} from './esquemas';
import { PRESUPUESTOS } from './opciones';

const JPEG = [0xff, 0xd8, 0xff, 0xe0, 0, 0x10, 0x4a, 0x46, 0x49, 0x46];
const PNG = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0];

function foto(nombre: string, firma: number[], tipo: string, relleno = 0): File {
  return new File([new Uint8Array([...firma, ...new Array<number>(relleno).fill(0)])], nombre, { type: tipo });
}

function encargoValido(): FormData {
  const f = new FormData();
  f.set('tipo', 'amigurumi-mascota');
  f.set('descripcion', 'Una gata siamesa de unos 20 cm, para un cumpleaños.');
  f.set('fecha', '14 de octubre');
  f.set('presupuesto', PRESUPUESTOS[1]);
  f.set('colores', 'crudo y marrón');
  f.set('nombre', 'Persona de prueba');
  f.set('correo', 'prueba@ejemplo.test');
  f.set('instagram', '@ejemplo');
  f.set('acepta', 'on');
  return f;
}

async function validarEncargo(f: FormData) {
  return esquemaEncargo().safeParseAsync(formularioAObjeto(f, ['fotos']));
}

async function erroresEncargo(f: FormData) {
  const r = await validarEncargo(f);
  return r.success ? {} : erroresPorCampo<CampoEncargo>(r.error);
}

describe('esquema de encargo', () => {
  it('acepta un encargo completo y recorta espacios', async () => {
    const f = encargoValido();
    f.set('nombre', '  Persona de prueba  ');
    const r = await validarEncargo(f);
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.nombre).toBe('Persona de prueba');
      expect(r.data.acepta).toBe(true);
      expect(r.data.fotos).toEqual([]);
    }
  });

  it('acepta los opcionales vacíos', async () => {
    const f = encargoValido();
    for (const c of ['fecha', 'presupuesto', 'colores', 'instagram']) f.set(c, '');
    expect((await validarEncargo(f)).success).toBe(true);
  });

  it('pide tipo, descripción de 20 caracteres, nombre, correo y consentimiento', async () => {
    const f = new FormData();
    f.set('descripcion', 'muy corto');
    const errores = await erroresEncargo(f);
    expect(Object.keys(errores).sort()).toEqual(['acepta', 'correo', 'descripcion', 'nombre', 'tipo']);
    expect(errores.descripcion).toMatch(/20 caracteres/);
  });

  it('rechaza un tipo o un presupuesto que no están en la lista', async () => {
    const f = encargoValido();
    f.set('tipo', 'cohete');
    f.set('presupuesto', '1 €');
    const errores = await erroresEncargo(f);
    expect(errores.tipo).toBeDefined();
    expect(errores.presupuesto).toBeDefined();
  });

  it('valida el correo y el usuario de Instagram', async () => {
    const f = encargoValido();
    f.set('correo', 'sin-arroba.test');
    f.set('instagram', 'https://instagram.com/alguien');
    const errores = await erroresEncargo(f);
    expect(errores.correo).toMatch(/no parece válido/);
    expect(errores.instagram).toBeDefined();
  });

  it('ignora el archivo vacío que manda un input sin fotos', async () => {
    const f = encargoValido();
    f.append('fotos', new File([], '', { type: 'application/octet-stream' }));
    const r = await validarEncargo(f);
    expect(r.success).toBe(true);
  });

  it('acepta fotos JPG y PNG reales', async () => {
    const f = encargoValido();
    f.append('fotos', foto('a.jpg', JPEG, 'image/jpeg'));
    f.append('fotos', foto('b.png', PNG, 'image/png'));
    const r = await validarEncargo(f);
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.fotos).toHaveLength(2);
  });

  it('rechaza un archivo que dice ser imagen pero no lo es', async () => {
    const f = encargoValido();
    f.append('fotos', new File(['<script>alert(1)</script>'], 'falsa.jpg', { type: 'image/jpeg' }));
    expect((await erroresEncargo(f)).fotos).toMatch(/no es una imagen/);
  });

  it('rechaza tipos no admitidos', async () => {
    const f = encargoValido();
    f.append('fotos', new File(['GIF89a'], 'a.gif', { type: 'image/gif' }));
    expect((await erroresEncargo(f)).fotos).toMatch(/JPG, PNG o WebP/);
  });

  it('limita el número de fotos', async () => {
    const f = encargoValido();
    for (let i = 0; i <= LIMITES_FOTOS.cantidad; i++) f.append('fotos', foto(`${i}.jpg`, JPEG, 'image/jpeg'));
    expect((await erroresEncargo(f)).fotos).toMatch(new RegExp(`hasta ${LIMITES_FOTOS.cantidad} fotos`));
  });

  it('limita el peso de cada foto', async () => {
    const f = encargoValido();
    f.append('fotos', foto('grande.jpg', JPEG, 'image/jpeg', LIMITES_FOTOS.bytes));
    expect((await erroresEncargo(f)).fotos).toMatch(/como mucho/);
  });

  it('limita el peso total', async () => {
    const f = encargoValido();
    const casiMaximo = LIMITES_FOTOS.bytes - JPEG.length - 1;
    for (let i = 0; i < LIMITES_FOTOS.cantidad; i++) {
      f.append('fotos', foto(`${i}.jpg`, JPEG, 'image/jpeg', casiMaximo));
    }
    expect(LIMITES_FOTOS.cantidad * LIMITES_FOTOS.bytes).toBeGreaterThan(LIMITES_FOTOS.bytesTotales);
    expect((await erroresEncargo(f)).fotos).toMatch(/Entre todas/);
  });
});

function contactoValido(): FormData {
  const f = new FormData();
  f.set('motivo', 'producto');
  f.set('pedido', '');
  f.set('nombre', 'Persona de prueba');
  f.set('correo', 'prueba@ejemplo.test');
  f.set('mensaje', '¿La manta se puede lavar a máquina?');
  f.set('acepta', 'on');
  return f;
}

function erroresContacto(f: FormData) {
  const r = esquemaContacto().safeParse(formularioAObjeto(f));
  return r.success ? {} : erroresPorCampo<CampoContacto>(r.error);
}

describe('esquema de contacto', () => {
  it('acepta un mensaje completo', () => {
    expect(esquemaContacto().safeParse(formularioAObjeto(contactoValido())).success).toBe(true);
  });

  it('pide motivo, nombre, correo, mensaje y consentimiento', () => {
    expect(Object.keys(erroresContacto(new FormData())).sort()).toEqual([
      'acepta',
      'correo',
      'mensaje',
      'motivo',
      'nombre',
    ]);
  });

  it('normaliza el número de pedido y rechaza los que no tienen el formato', () => {
    const f = contactoValido();
    f.set('pedido', ' ov-2026-1042 ');
    const r = esquemaContacto().safeParse(formularioAObjeto(f));
    expect(r.success && r.data.pedido).toBe('OV-2026-1042');

    f.set('pedido', '1042');
    expect(erroresContacto(f).pedido).toMatch(/OV-2026-1042/);
  });

  it('no acepta un consentimiento con otro valor', () => {
    const f = contactoValido();
    f.set('acepta', 'no');
    expect(erroresContacto(f).acepta).toBeDefined();
  });

  it('limita la longitud del mensaje', () => {
    const f = contactoValido();
    f.set('mensaje', 'x'.repeat(3001));
    expect(erroresContacto(f).mensaje).toMatch(/3000/);
  });
});

describe('mensajes en otros idiomas', () => {
  it('traduce los errores sin cambiar lo que se valida', async () => {
    const f = new FormData();
    f.set('descripcion', 'muy corto');
    const objeto = formularioAObjeto(f, ['fotos']);
    const es = await esquemaEncargo('es').safeParseAsync(objeto);
    const en = await esquemaEncargo('en').safeParseAsync(objeto);
    expect(es.success || en.success).toBe(false);
    if (es.success || en.success) return;
    const erroresEs = erroresPorCampo<CampoEncargo>(es.error);
    const erroresEn = erroresPorCampo<CampoEncargo>(en.error);
    expect(Object.keys(erroresEn).sort()).toEqual(Object.keys(erroresEs).sort());
    expect(erroresEn.descripcion).toMatch(/20 characters/);
    expect(erroresEn.nombre).toBe('What’s your name?');
  });

  it('traduce el correo mal escrito y el aviso general', () => {
    const f = contactoValido();
    f.set('correo', 'sin-arroba.test');
    const r = esquemaContacto('de').safeParse(formularioAObjeto(f));
    expect(r.success).toBe(false);
    if (!r.success) expect(erroresPorCampo<CampoContacto>(r.error).correo).toMatch(/nicht gültig/);
    expect(avisoRevisar(1)).toBe('Hay un campo que revisar.');
    expect(avisoRevisar(3, 'fr')).toBe('3\u00a0champs sont à vérifier.');
  });

  it('reutiliza el esquema de cada idioma', () => {
    expect(esquemaContacto('fr')).toBe(esquemaContacto('fr'));
    expect(esquemaContacto()).toBe(esquemaContacto('es'));
  });
});

describe('utilidades de formulario', () => {
  it('ignora los campos internos de las acciones y agrupa las listas', () => {
    const f = new FormData();
    f.set('$ACTION_ID_abc', '');
    f.append('fotos', 'a');
    f.append('fotos', 'b');
    f.set('nombre', 'X');
    expect(formularioAObjeto(f, ['fotos'])).toEqual({ fotos: ['a', 'b'], nombre: 'X' });
  });

  it('devuelve solo textos y nunca el campo trampa', () => {
    expect(valoresDeTexto({ nombre: 'X', sitio_web: 'spam', fotos: [] })).toEqual({ nombre: 'X' });
  });
});
