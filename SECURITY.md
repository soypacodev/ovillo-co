# Seguridad

Ovillo & Co. es una tienda de demostración: no cobra, no guarda tarjetas (el pago va siempre por Stripe en modo prueba) y sus datos son ficticios. Aun así, el código está pensado para usarse en tiendas reales, así que cualquier fallo de seguridad importa.

## Cómo avisar de un fallo

Escribe a **[soypacodev@gmail.com](mailto:soypacodev@gmail.com)** con el asunto «Seguridad · Ovillo & Co.». **No abras una incidencia pública** mientras el fallo no esté corregido.

Ayuda mucho que incluyas:

- qué parte está afectada (ruta, función de la base de datos, política RLS…);
- los pasos para reproducirlo, o una prueba de concepto;
- qué podría conseguir alguien que lo aprovechara.

Recibirás respuesta en un plazo de **cinco días laborables**. Cuando el fallo esté corregido, se publicará el arreglo y, si quieres, se mencionará tu nombre en la nota.

## Qué entra

- El código de este repositorio: la aplicación Next.js, las migraciones y políticas de [`supabase/`](supabase/) y la configuración de cabeceras y CSP.
- La demo publicada, siempre que no se degrade el servicio para otras personas.

## Qué no entra

- Ataques de denegación de servicio, pruebas de carga o envío masivo de formularios.
- Ingeniería social, o ataques contra la infraestructura de Vercel, Supabase o Stripe.
- Que la demo enseñe datos inventados o que el panel de demostración sea público: es a propósito.

## Versiones

Solo se mantiene la rama `main`.
