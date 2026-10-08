# Despliegue

Guía para pasar de la tienda en modo demostración a una tienda con base de datos, cuentas, pagos de prueba y dominio propio. Está pensada para quien no lo ha hecho nunca: cada paso dice dónde pulsar.

Necesitas una cuenta (gratuita) en tres servicios y unos 45 minutos:

| Servicio | Para qué | Plan |
|---|---|---|
| [Supabase](https://supabase.com) | Base de datos, cuentas de clientes y fotos | Free |
| [Stripe](https://stripe.com/es) | Pasarela de pago, **siempre en modo prueba** | Sin coste en modo prueba |
| [Vercel](https://vercel.com) | Publicar la web con HTTPS y dominio | Hobby |

Y en tu ordenador: [Node.js](https://nodejs.org) 22.18 o superior y [Git](https://git-scm.com). Si quieres seguir el camino por terminal, también la [CLI de Stripe](https://docs.stripe.com/stripe-cli) (la de Supabase se usa con `npx` y no hay que instalarla).

> **El orden importa.** Supabase primero, luego Stripe y por último Vercel. Al final, un paso de vuelta a Supabase y a Stripe con la URL definitiva.

**Índice**

1. [Supabase: el proyecto](#1-supabase-el-proyecto)
2. [Supabase: tablas y seguridad](#2-supabase-tablas-y-seguridad)
3. [Supabase: catálogo y datos de demostración](#3-supabase-catálogo-y-datos-de-demostración)
4. [Supabase: correos y direcciones de vuelta](#4-supabase-correos-y-direcciones-de-vuelta)
5. [Supabase: cuentas de administración y de demostración](#5-supabase-cuentas-de-administración-y-de-demostración)
6. [Stripe en modo prueba](#6-stripe-en-modo-prueba)
7. [Probar todo en local](#7-probar-todo-en-local)
8. [Vercel](#8-vercel)
9. [Últimos ajustes con la URL definitiva](#9-últimos-ajustes-con-la-url-definitiva)
10. [Comprobación final](#10-comprobación-final)

---

## 1. Supabase: el proyecto

1. Entra en [supabase.com/dashboard](https://supabase.com/dashboard) y pulsa **New project**.
2. Elige tu organización (si no tienes, Supabase te pide crear una; el plan **Free** basta).
3. Rellena:
   - **Project name**: `ovillo-co` (o el nombre de tu tienda).
   - **Database Password**: pulsa **Generate a password** y **guárdala** en tu gestor de contraseñas. La necesitarás para la terminal.
   - **Region**: la más cercana a tu clientela. Para España, **West EU (Paris)**: es donde [`vercel.json`](../vercel.json) pone las funciones de la web, y así las consultas no salen de la ciudad. Si cambias una, cambia la otra.
4. Pulsa **Create new project** y espera un par de minutos a que termine.
5. Apunta tres datos. Están en **Project Settings** (rueda dentada abajo a la izquierda):
   - **Data API → Project URL**: algo como `https://abcdefghijkl.supabase.co`. Será `NEXT_PUBLIC_SUPABASE_URL`.
   - **API Keys**: la clave **publishable** (o **anon** en la pestaña *Legacy API Keys*). Será `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
   - **API Keys**: la clave **secret** (o **service_role** en *Legacy API Keys*). Será `SUPABASE_SERVICE_ROLE_KEY`.

> **La clave pública y la secreta no son intercambiables.** La pública (`publishable` / `anon`) va al navegador y no pasa nada: lo que protege los datos son las políticas RLS. La secreta (`secret` / `service_role`) se salta toda la seguridad: solo en el servidor, nunca con el prefijo `NEXT_PUBLIC_`, nunca en una captura ni en un mensaje.

El **Project ref** es la parte de la URL antes de `.supabase.co` (`abcdefghijkl` en el ejemplo). También aparece en **Project Settings → General**.

## 2. Supabase: tablas y seguridad

Las migraciones de [`supabase/migrations/`](../supabase/migrations/) crean las tablas, las políticas de seguridad, las funciones de cálculo y los espacios para las fotos. Hay que aplicarlas **todas y en orden**. Elige uno de los dos caminos.

### Camino A: con la terminal (recomendado)

Desde la carpeta del proyecto:

```bash
npx supabase login                               # abre el navegador para autorizar
npx supabase link --project-ref abcdefghijkl     # tu Project ref; pide la contraseña de la base de datos
npx supabase db push                             # aplica las migraciones en orden
```

`db push` enseña la lista de migraciones que va a aplicar y pide confirmación. Al terminar, en **Table Editor** deberías ver tablas como `productos`, `pedidos` o `encargos`.

> Si la CLI se queja de que falta `supabase/config.toml`, ejecuta antes `npx supabase init` y responde que no a las preguntas opcionales. Ese archivo solo lo usa la CLI y no cambia nada de la tienda.

### Camino B: con el editor SQL

1. En el panel de Supabase, abre **SQL Editor** (icono de terminal en la barra lateral) y pulsa **New query**.
2. Abre en tu ordenador el **primer** archivo de `supabase/migrations/` (el de número más bajo), copia **todo** su contenido, pégalo y pulsa **Run**.
3. Debe salir *Success. No rows returned*. Repite con cada archivo, **uno por uno y en orden**:

   | Orden | Archivo | Qué hace |
   |---|---|---|
   | 1 | `20261008120000_esquema.sql` | Tablas, tipos e índices |
   | 2 | `20261008120100_seguridad.sql` | Permisos y RLS |
   | 3 | `20261008120200_funciones.sql` | Cálculo de pedidos, stock, cupones y estados |
   | 4 | `20261008120300_almacenamiento.sql` | Espacio público para las fotos de producto |
   | 5 | `20261009120000_rol_demo.sql` | Rol de solo lectura para la demostración |
   | 6 | `20261009120100_panel.sql` | Funciones del panel, mensajes y fotos de encargos |
   | 7 | `20261010120000_panel_escritura.sql` | Guardado de productos desde el panel |
   | 8 | `20261011120000_encargos_solo_servidor.sql` | Los encargos solo entran por el servidor |
   | 9 | `20261012120000_demo_sin_fugas.sql` | Más datos ocultos a demo y contraseña de demo fija |

> **No los juntes en una sola consulta.** La quinta añade un valor a un tipo y PostgreSQL no permite usarlo en la misma transacción en que se crea; por eso va sola.
>
> **No ejecutes nada de `supabase/pruebas/`** en tu proyecto: son pruebas para un PostgreSQL temporal y simulan partes de Supabase.

## 3. Supabase: catálogo y datos de demostración

Dos archivos, en este orden:

| Archivo | Qué carga | ¿Obligatorio? |
|---|---|---|
| [`supabase/seed.sql`](../supabase/seed.sql) | Categorías, productos, variantes, fotos, promociones y métodos de envío | Sí, salvo que vayas a dar de alta tu propio catálogo desde el panel |
| [`supabase/seed-demo.sql`](../supabase/seed-demo.sql) | 25 pedidos, 6 encargos y 7 mensajes ficticios, marcados como `es_demo` | Solo para enseñar el panel con datos |

**Con el editor SQL:** abre cada archivo, copia su contenido, pégalo en una consulta nueva y pulsa **Run**.

**Con la terminal:** copia la cadena de conexión en **Connect** (botón de arriba) → **Connection string** → **URI**, sustituye `[YOUR-PASSWORD]` por la contraseña de la base de datos y ejecuta:

```bash
psql "postgresql://postgres.abcdefghijkl:CONTRASEÑA@aws-0-eu-west-1.pooler.supabase.com:5432/postgres" -f supabase/seed.sql
psql "postgresql://…la misma…" -f supabase/seed-demo.sql
```

`seed-demo.sql` se puede ejecutar las veces que quieras: borra lo ficticio y lo vuelve a crear con fechas relativas a hoy, así que conviene repetirlo de vez en cuando para que el panel no se quede con ventas antiguas. Los importes no están escritos a mano: los calcula la propia base de datos con el catálogo, así que siempre cuadran.

> **Las fotos del catálogo de ejemplo** apuntan a `/fotos/…`, que la web sirve desde `public/fotos/`. No hay que subirlas a Supabase. Las que subas tú desde el panel irán al espacio `productos` de Supabase Storage.

## 4. Supabase: correos y direcciones de vuelta

Supabase manda los correos de confirmar la cuenta y de recuperar la contraseña. Cada correo lleva un enlace que vuelve a la tienda, a la ruta [`/auth/confirmar`](../src/app/auth/confirmar/route.ts), y Supabase solo deja volver a las direcciones que autorices.

1. Abre **Authentication → URL Configuration**.
2. En **Site URL** pon, de momento, `http://localhost:3000`. La cambiarás por el dominio definitivo en el [paso 9](#9-últimos-ajustes-con-la-url-definitiva).
3. En **Redirect URLs** pulsa **Add URL** y añade:
   - `http://localhost:3000/auth/confirmar**`
   - Más adelante, `https://tu-dominio/auth/confirmar**` (paso 9).
   - Si quieres que funcionen en las previsualizaciones de Vercel: `https://*-tu-equipo.vercel.app/auth/confirmar**`.
4. Pulsa **Save**.

**Confirmación por correo.** En **Authentication → Sign In / Providers → Email**, deja activado **Confirm email**: así nadie se registra con un correo que no es suyo.

**Plantillas en español** (recomendado). En **Authentication → Emails → Templates**, cambia el asunto y el texto de *Confirm signup*, *Magic link* y *Reset password*. Mantén el enlace con la variable `{{ .ConfirmationURL }}`. Por ejemplo, para *Confirm signup*:

```html
<h2>Confirma tu cuenta en Ovillo &amp; Co.</h2>
<p>Pulsa el enlace para activar tu cuenta y ver tus pedidos:</p>
<p><a href="{{ .ConfirmationURL }}">Confirmar mi correo</a></p>
<p>Si no te has registrado tú, ignora este mensaje.</p>
```

<details>
<summary><strong>Opcional: enlaces que funcionan aunque se abran en otro navegador</strong></summary>

<br>

Con `{{ .ConfirmationURL }}` el enlace solo funciona en el mismo navegador donde se pidió (es el flujo PKCE, más seguro). Si tu clientela suele pedir el correo en el ordenador y abrirlo en el móvil, puedes usar el formato con `token_hash`, que la ruta `/auth/confirmar` también entiende:

| Plantilla | Enlace |
|---|---|
| Confirm signup | `{{ .SiteURL }}/auth/confirmar?token_hash={{ .TokenHash }}&type=email&siguiente=/cuenta` |
| Magic link | `{{ .SiteURL }}/auth/confirmar?token_hash={{ .TokenHash }}&type=magiclink&siguiente=/cuenta` |
| Reset password | `{{ .SiteURL }}/auth/confirmar?token_hash={{ .TokenHash }}&type=recovery` |

</details>

> **Envío de correos.** El servidor de correo que trae Supabase tiene un límite muy bajo de envíos por hora y es solo para pruebas. Para una tienda real, configura uno propio en **Authentication → Emails → SMTP Settings** (Resend, Brevo, Amazon SES…).

## 5. Supabase: cuentas de administración y de demostración

El panel del taller solo se abre a cuentas con rol `admin` (el dueño, puede cambiarlo todo) o `demo` (solo lectura, con los datos personales reales enmascarados). Nadie puede darse un rol desde la web: se asigna desde el editor SQL con la función `asignar_rol()`.

### Cuenta de administración

1. Crea la cuenta. Hay dos maneras:
   - **Desde la tienda**, cuando la tengas funcionando en local (paso 7): **Crear cuenta** en `/registro`, y confirma el correo.
   - **Desde Supabase**: **Authentication → Users → Add user → Create new user**, escribe correo y contraseña, marca **Auto Confirm User** y pulsa **Create user**.
2. En **SQL Editor**, ejecuta (con tu correo):

   ```sql
   select public.asignar_rol('tu-correo@ejemplo.com', 'admin');
   ```

3. Si dice *USUARIO_NO_ENCONTRADO*, la cuenta aún no existe o el correo está mal escrito.

### Cuenta de demostración

Es la que usa el botón público **Ver el panel de demostración**: cualquiera que lo pulse entra con ella, sin escribir nada.

1. **Authentication → Users → Add user → Create new user**. Usa un correo que no sea de nadie (por ejemplo, `demo@tu-dominio.example`) y una contraseña larga y aleatoria. Marca **Auto Confirm User**.
2. En **SQL Editor**:

   ```sql
   select public.asignar_rol('demo@tu-dominio.example', 'demo');
   ```

3. Guarda ese correo y esa contraseña: serán `DEMO_PANEL_EMAIL` y `DEMO_PANEL_PASSWORD`. Solo los lee el servidor y nunca llegan al navegador.

Mientras la cuenta tenga el rol `demo`, nadie puede cambiarle la contraseña ni el correo, ni siquiera desde el panel de Supabase: así quien entra con el botón no deja fuera a los demás. Para renovar la contraseña, pásala antes a `cliente` con `asignar_rol()`, cámbiala en **Authentication → Users** y vuelve a nombrarla `demo`.

Para devolver a alguien a cliente normal: `select public.asignar_rol('correo', 'cliente');`. La función se niega a quitar el rol al último admin, para que la tienda nunca se quede sin dueño.

## 6. Stripe en modo prueba

La tienda **rechaza cualquier clave que no sea de prueba**: aunque te equivoques de clave, no se puede cobrar dinero real.

### Las claves

1. Entra en [dashboard.stripe.com](https://dashboard.stripe.com) y crea la cuenta (no hace falta activar pagos reales ni dar datos bancarios).
2. Asegúrate de estar en **modo de prueba**: arriba aparece *Test mode* o un *Sandbox*.
3. Ve a **Developers → API keys** (o busca «API keys» en la barra de arriba) y copia la **Secret key**, que empieza por `sk_test_` (pulsa **Reveal test key**): es `STRIPE_SECRET_KEY`. La *Publishable key* no hace falta: el pago se abre en la página de Stripe desde el servidor.

### El webhook

Cuando alguien paga, Stripe avisa a la tienda llamando a su webhook, y es entonces (no antes) cuando se crea el pedido y se descuenta el stock. Sin webhook, el cobro se hace pero el pedido no aparece en el panel.

**En local**, con la CLI de Stripe:

```bash
stripe login
stripe listen --forward-to localhost:3000/api/stripe/webhook \
  --events checkout.session.completed,checkout.session.async_payment_succeeded,charge.refunded
```

Al arrancar enseña *Your webhook signing secret is whsec_…*: ese valor es `STRIPE_WEBHOOK_SECRET` en tu `.env.local`. Deja la terminal abierta mientras pruebas.

**En producción** (cuando tengas la URL de Vercel, en el paso 9):

1. **Developers → Webhooks → Add endpoint** (en las versiones nuevas, **Add destination** y elige *Webhook endpoint*).
2. **Endpoint URL**: `https://tu-dominio/api/stripe/webhook`.
3. **Events to send**: busca y marca `checkout.session.completed`, `checkout.session.async_payment_succeeded` y `charge.refunded` (este último, para que un reembolso hecho desde Stripe marque el pedido como reembolsado). No hace falta ninguno más.
4. Guarda y, en la página del endpoint, pulsa **Reveal** en **Signing secret**. Ese `whsec_…` es el `STRIPE_WEBHOOK_SECRET` de producción, **distinto** del que da `stripe listen`.

**Tarjetas de prueba:** `4242 4242 4242 4242` paga bien; `4000 0000 0000 9995` se rechaza por falta de fondos. Cualquier fecha futura, cualquier CVC y cualquier código postal.

## 7. Probar todo en local

1. Copia el archivo de ejemplo:

   ```bash
   cp .env.example .env.local
   ```

2. Rellena `.env.local` con lo que has apuntado:

   ```bash
   NEXT_PUBLIC_SITIO_URL=http://localhost:3000
   NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijkl.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_…
   SUPABASE_SERVICE_ROLE_KEY=sb_secret_…
   DEMO_PANEL_EMAIL=demo@tu-dominio.example
   DEMO_PANEL_PASSWORD=…
   STRIPE_SECRET_KEY=sk_test_…
   STRIPE_WEBHOOK_SECRET=whsec_…        # el de «stripe listen»
   NEXT_PUBLIC_INDEXAR=no
   ```

   > Si todavía no vas a usar Stripe, **deja vacías** las dos líneas de Stripe. Sin una `STRIPE_SECRET_KEY` de prueba completa, la tienda sigue en modo demostración para el pago.

3. Arranca la tienda y, en otra terminal, `stripe listen` (paso 6):

   ```bash
   npm run dev
   ```

4. Comprueba: el catálogo carga (ahora desde Supabase), puedes crear una cuenta y confirmarla por correo, una compra con `4242…` vuelve a `/gracias` y el pedido aparece en **Table Editor → pedidos** y en `/panel` con la cuenta admin.

## 8. Vercel

### Importar el repositorio

1. Sube el proyecto a tu GitHub (si es una copia de este, haz un *fork* o crea un repositorio nuevo y súbelo).
2. Entra en [vercel.com/new](https://vercel.com/new), pulsa **Continue with GitHub** y autoriza a Vercel a ver el repositorio.
3. Junto al repositorio, pulsa **Import**.
4. En **Configure Project**:
   - **Framework Preset**: *Next.js* (lo detecta solo).
   - **Root Directory**: déjalo en `./`.
   - **Build and Output Settings**: no toques nada.
5. Despliega **Environment Variables** y añade las variables de la tabla de abajo, **una por una**: escribe el nombre en **Key**, pega el valor en **Value** y pulsa **Add**.
6. Pulsa **Deploy**. En un par de minutos tendrás una URL tipo `https://ovillo-co.vercel.app`.

En **Settings → Build and Deployment → Node.js Version**, elige **22.x**.

No hace falta elegir región: [`vercel.json`](../vercel.json) pone las funciones en París (`cdg1`), cerca de la clientela en España y de Supabase si lo creaste en *West EU (Paris)*. Si tu clientela está en otro sitio, cambia la región ahí; el plan Hobby admite una.

### Variables de entorno

| Variable | Qué es | De dónde sale | ¿Secreta? |
|---|---|---|---|
| `NEXT_PUBLIC_SITIO_URL` | URL pública de la tienda, sin barra final. Se usa en metadatos, enlaces de los correos y la vuelta de Stripe | Tu dominio (paso 9); al principio, la URL que te dé Vercel | No |
| `NEXT_PUBLIC_SUPABASE_URL` | Dirección del proyecto de Supabase | Paso 1 | No |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clave pública de Supabase | Paso 1 | No (va al navegador a propósito) |
| `SUPABASE_SERVICE_ROLE_KEY` | Clave secreta de Supabase. La usa el webhook para registrar pedidos y las acciones que guardan encargos y mensajes | Paso 1 | **Sí** |
| `DEMO_PANEL_EMAIL` | Correo de la cuenta de demostración del panel | Paso 5 | Sí |
| `DEMO_PANEL_PASSWORD` | Contraseña de esa cuenta | Paso 5 | **Sí** |
| `STRIPE_SECRET_KEY` | Clave secreta de Stripe (`sk_test_…`). Vacía o incompleta, el pago funciona en modo demostración | Paso 6 | **Sí** |
| `STRIPE_WEBHOOK_SECRET` | Secreto de firma del webhook de producción (`whsec_…`) | Paso 9 | **Sí** |
| `NEXT_PUBLIC_INDEXAR` | `si` para que los buscadores indexen toda la tienda; con cualquier otro valor solo se indexa la portada (ver [Arquitectura](ARQUITECTURA.md#qué-ven-los-buscadores)) | Tú decides | No |

> **Las variables `NEXT_PUBLIC_*` se graban en la compilación.** Si cambias una, hay que volver a desplegar: **Deployments → ⋯ del último → Redeploy**.
>
> **`NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` van juntas.** Con una sola, la compilación falla con un mensaje que lo explica. Sin ninguna de las dos, la tienda vuelve al modo demostración.

### Dominio propio

1. En el proyecto de Vercel, **Settings → Domains → Add Domain**.
2. Escribe tu dominio (`tienda.ejemplo.com` o `ejemplo.com`) y pulsa **Add**.
3. Vercel te dice qué registro DNS crear en tu proveedor de dominio: un **CNAME** a `cname.vercel-dns.com` para un subdominio, o un registro **A** para el dominio raíz. Créalo en el panel de tu proveedor.
4. Cuando aparezca *Valid Configuration*, el certificado HTTPS se emite solo.

## 9. Últimos ajustes con la URL definitiva

Con el dominio ya funcionando (o la URL de Vercel si no vas a usar dominio propio):

1. **Vercel**: cambia `NEXT_PUBLIC_SITIO_URL` a `https://tu-dominio` y vuelve a desplegar.
2. **Supabase → Authentication → URL Configuration**:
   - **Site URL**: `https://tu-dominio`.
   - **Redirect URLs**: añade `https://tu-dominio/auth/confirmar**`. Deja la de `localhost` si vas a seguir probando en local.
3. **Stripe**: crea el webhook de producción (paso 6, *En producción*) con `https://tu-dominio/api/stripe/webhook`, copia su `whsec_…` a `STRIPE_WEBHOOK_SECRET` en Vercel y vuelve a desplegar.
4. Si vas a enseñar la tienda: actualiza el enlace de la demo al principio del [`README.md`](../README.md).

## 10. Comprobación final

- [ ] La portada carga y la cinta de arriba dice que es una tienda de demostración.
- [ ] El catálogo es el de Supabase: cambia el precio de un producto en **Table Editor → productos** y comprueba que la web lo refleja.
- [ ] Puedes crear una cuenta, el correo llega y el enlace te devuelve a la tienda con la sesión iniciada.
- [ ] Una compra con `4242 4242 4242 4242` termina en `/gracias`.
- [ ] En Stripe, **Developers → Webhooks → tu endpoint**, el evento aparece con respuesta **200**.
- [ ] El pedido sale en `/panel/pedidos` con la cuenta admin y en **Mi cuenta → Pedidos** de quien compró.
- [ ] **Ver el panel de demostración** abre el panel y no deja guardar nada.
- [ ] Las cabeceras de seguridad están: en [securityheaders.com](https://securityheaders.com) la nota debería ser A o superior.

### Si algo falla

| Síntoma | Causa probable |
|---|---|
| La compilación falla con *Variables de entorno no válidas* | Una URL sin `https://`, una clave de Stripe que no es de prueba, o solo una de las dos de Supabase |
| *La pasarela de pago no responde* al pagar | `STRIPE_SECRET_KEY` con forma de clave de prueba pero revocada o de otra cuenta |
| Se cobra pero el pedido no aparece | Webhook mal configurado: URL, eventos o `STRIPE_WEBHOOK_SECRET` (el de `stripe listen` no vale en producción) |
| El enlace del correo lleva a *Entrar* con aviso de enlace caducado | La URL no está en **Redirect URLs**, o el enlace se abrió en otro navegador (ver plantillas con `token_hash`) |
| *Ver el panel de demostración* dice que no está disponible | Faltan `DEMO_PANEL_EMAIL` / `DEMO_PANEL_PASSWORD`, o la cuenta no tiene rol `demo` |
| Con la cuenta admin el panel dice que no tienes acceso | Falta `select public.asignar_rol('…', 'admin');` o hay que cerrar sesión y volver a entrar |
| Las fotos subidas desde el panel no se ven | `NEXT_PUBLIC_SUPABASE_URL` cambió después de compilar: vuelve a desplegar |
