// Lee el cuerpo de una petición sin pasar de un máximo en bytes. Se mide
// en bytes y no en caracteres: con letras como «ñ» o un emoji, la longitud
// de un texto se queda corta frente a lo que ocupa de verdad. Corta la
// lectura en cuanto se pasa, sin cargar el resto en memoria.

export async function leerCuerpoLimitado(peticion: Request, maxBytes: number): Promise<Uint8Array | null> {
  const declarado = Number(peticion.headers.get('content-length') ?? 0);
  if (declarado > maxBytes) return null;
  if (!peticion.body) return new Uint8Array(0);

  const lector = peticion.body.getReader();
  const trozos: Uint8Array[] = [];
  let total = 0;
  for (;;) {
    const { done, value } = await lector.read();
    if (done) break;
    total += value.byteLength;
    if (total > maxBytes) {
      await lector.cancel();
      return null;
    }
    trozos.push(value);
  }

  const cuerpo = new Uint8Array(total);
  let posicion = 0;
  for (const trozo of trozos) {
    cuerpo.set(trozo, posicion);
    posicion += trozo.byteLength;
  }
  return cuerpo;
}
