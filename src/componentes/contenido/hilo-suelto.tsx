/** Ovillo con un hilo suelto que se dibuja solo al cargar (solo CSS:
 *  pathLength=1 permite animar el trazo sin medirlo con JavaScript). */
export function HiloSuelto() {
  return (
    <svg className="hilo-suelto" width="200" height="150" viewBox="0 0 200 150" fill="none" aria-hidden="true" focusable="false">
      <circle cx="52" cy="52" r="40" fill="#C6DCEC" />
      <path
        d="M14 44c25 10 52 10 76 0M12 62c25 10 55 10 78-3M32 16c-10 24-10 58 3 82M70 15c10 24 10 58 0 82"
        stroke="#28618F"
        strokeWidth="2.6"
        strokeLinecap="round"
      />
      <path
        className="hilo-suelto-trazo"
        pathLength={1}
        d="M92 62c22 4 18 30 36 32 20 2 22-22 40-18 14 3 12 22 26 26"
        stroke="#28618F"
        strokeWidth="2.6"
        strokeLinecap="round"
      />
    </svg>
  );
}
