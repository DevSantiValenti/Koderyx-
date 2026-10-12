# KODERYX · Software Solutions

Sitio comercial en español argentino, construido con Astro y salida completamente estática. Preparado para **https://koderyx.com.ar** en Netlify. Sin backend propio, sin React y sin enrutamiento SPA.

## Desarrollo local

Requiere Node.js **22.12 o superior** y npm. `.nvmrc` selecciona Node 22.

```bash
nvm use
npm ci
cp .env.example .env
npm run dev
```

Abrir la dirección local que indique Astro, normalmente `http://localhost:4321`. Las variables son opcionales: el WhatsApp y el Instagram suministrados ya están en la configuración. No se inventó un correo comercial.

```bash
npm run check       # Tipos y componentes Astro
npm run build       # Genera dist/
npm run verify      # Revisa la salida estática
npm run preview     # Sirve dist/ para inspección
```

En entornos que restringen la escritura en el directorio personal, ejecutar los comandos de Astro con `ASTRO_TELEMETRY_DISABLED=1`. Astro puede mantener el servidor en segundo plano; consultar `npx astro dev status` y detenerlo con `npx astro dev stop`. Para la vista de producción, `npx astro preview stop`.

## Estructura

```text
src/
  assets/          Logo original de KODERYX, optimizado por Astro al compilar
  components/      Header, Footer, SEO/layout auxiliar, formulario, iconos y GA
  config/site.ts   Identidad, dominio, email, WhatsApp, Instagram y portfolio
  data/            Servicios, proyectos, proceso, preguntas y textos editables
  layouts/         Layout global, metadatos y datos estructurados
  pages/           Rutas estáticas y plantilla dinámica de proyectos
  scripts/         Helper de eventos de analítica
  sections/        Secciones comerciales reutilizables
  styles/          Estilos responsive, foco visible y movimiento reducido
public/
  images/          Logos originales/optimizados, Open Graph y capturas reales
  favicon/         Iconos derivados del logo completo, sin recortarlo
  robots.txt
scripts/           Verificaciones y preparación de recursos
netlify.toml       Build, redirecciones, caché y cabeceras
```

Rutas: `/`, `/servicios`, `/proyectos`, `/proyectos/sonrie-plus`, `/proyectos/electrodental-nea`, `/proyectos/gimnasios`, `/contacto`, `/privacidad`, `/gracias` y una página `404.html`.

## Configuración central y variables

Los datos públicos se centralizan en `src/config/site.ts`. Las variables permiten sobrescribirlos durante el build. **No colocar secretos en variables `PUBLIC_*`: se publican en el frontend.**

| Variable | Uso | Valor por defecto |
| --- | --- | --- |
| `PUBLIC_WHATSAPP_NUMBER` | Número internacional, solo dígitos | Número proporcionado por el titular |
| `PUBLIC_INSTAGRAM_URL` | URL completa del perfil | `https://www.instagram.com/koderyx/` |
| `PUBLIC_CONTACT_EMAIL` | Email comercial; al configurarlo aparece en contacto/footer | Vacío |
| `PUBLIC_GA_MEASUREMENT_ID` | ID real de GA4, formato `G-...` | `G-Z1E9CFNPXY` |
| `PUBLIC_ENABLE_ANALYTICS_IN_DEV` | Habilitación explícita de GA durante desarrollo | `false` |

El mensaje predeterminado de WhatsApp se codifica con `encodeURIComponent` desde el mismo archivo. El número se conserva como fue entregado; comprobar que la cuenta de WhatsApp lo reconoce antes del lanzamiento.

## Despliegue en Netlify

1. Subir el proyecto a un repositorio Git e importarlo en Netlify.
2. Dejar el directorio base en la raíz de este proyecto.
3. Usar **Build command: `npm run build`** y **Publish directory: `dist`**. `netlify.toml` ya contiene estos valores y `NODE_VERSION = "22"`.
4. Configurar las variables opcionales en **Project configuration → Environment variables**, para el contexto correspondiente y el scope **Builds**.
5. En **Forms**, habilitar **Enable form detection** antes del despliegue que se usará para recibir consultas.
6. Desplegar y comprobar las rutas, el formulario y el panel Forms.

No se necesita un adaptador SSR, Functions ni Edge Functions. No agregar un rewrite `/* → /index.html`: cada ruta ya tiene su HTML y debe conservarse la respuesta 404 para rutas inexistentes.

El proyecto incluye `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy` y `X-Frame-Options`. Los recursos versionados bajo `/_astro/` tienen caché inmutable de un año. Los archivos de `public/` no reciben esa política porque sus nombres no están versionados.

También se puede publicar la carpeta `dist` usando Netlify CLI o una subida manual, pero cualquier cambio posterior de contenido o variables requiere **recompilar y volver a desplegar**. No se realizó un despliegue ni se modificaron DNS durante la construcción local.

### Dominio

1. Añadir `koderyx.com.ar` en la configuración de dominios del proyecto Netlify.
2. Establecer **`koderyx.com.ar` como dominio principal** y añadir/configurar también `www.koderyx.com.ar`.
3. En el proveedor DNS, aplicar los registros exactos que indique Netlify para ese proyecto. Para el dominio raíz se utiliza el tipo que soporte el proveedor, como ALIAS/ANAME o A; `www` suele usar CNAME al subdominio Netlify asignado. No copiar valores DNS de otro sitio.
4. Esperar la propagación y comprobar la emisión del certificado HTTPS.
5. Verificar que `https://www.koderyx.com.ar/ruta` responde con 301 a `https://koderyx.com.ar/ruta`. Las reglas de `netlify.toml` conservan la ruta.

Referencia: [configuración de DNS externo de Netlify](https://docs.netlify.com/manage/domains/configure-domains/configure-external-dns/).

## Netlify Forms

El formulario `contact` se renderiza directamente en el HTML estático de inicio y contacto, con los mismos campos en ambas páginas. Lleva `method="POST"`, `action="/gracias"`, `data-netlify="true"`, `form-name=contact` y el honeypot `bot-field`. No necesita una copia oculta de detección: el formulario completo ya existe en la salida estática.

Campos: `name`, `company`, `email`, `phone`, `project-type`, `budget`, `message`, además de los campos técnicos `form-name` y `bot-field`.

- Con JavaScript, valida los campos, envía un POST URL-encoded a `/`, comprueba `response.ok` y navega a `/gracias` únicamente tras una respuesta exitosa.
- Si falla, conserva los datos, vuelve a habilitar el botón y muestra un mensaje accesible. Una espera máxima de 20 segundos evita bloquear indefinidamente el formulario.
- Sin JavaScript funciona el POST HTML nativo a `/gracias` en Netlify.
- En `localhost`, no se simula una recepción real: aparece un aviso y no se envían datos. Astro dev/preview no procesa Netlify Forms.
- No se envían valores personales del formulario a GA4.

Después de publicar, configurar las notificaciones en **Forms → Submission notifications**. Hacer una consulta de prueba identificada, con un email real y un mensaje completo. Verificar su llegada en **Verified submissions** o en **Spam**, además de la navegación a `/gracias`. Esta comprobación real depende del despliegue; las pruebas locales simulan las respuestas HTTP y no envían mensajes a terceros.

Si se añaden campos, conservar los mismos nombres en el formulario y en cualquier integración. Volver a desplegar para que Netlify detecte la nueva definición. Ver [configuración de Forms](https://docs.netlify.com/manage/forms/setup/) y [filtro honeypot](https://docs.netlify.com/manage/forms/spam-filters/).

## Google Analytics 4

1. Crear o seleccionar una propiedad GA4 y un flujo web para `https://koderyx.com.ar`.
2. Copiar su ID de medición `G-...`.
3. En Netlify **Environment variables**, agregar `PUBLIC_GA_MEASUREMENT_ID` con ese ID y scope **Builds** en producción.
4. Volver a desplegar. Comprobar las solicitudes de GA y los eventos en la propiedad.

`GoogleAnalytics.astro` inserta el tag global en el layout compartido, por lo que se incluye en todas las páginas y vistas estáticas. Usa `G-Z1E9CFNPXY` por defecto y permite reemplazarlo con `PUBLIC_GA_MEASUREMENT_ID`. En desarrollo tampoco lo emite salvo `PUBLIC_ENABLE_ANALYTICS_IN_DEV=true`. Manrope se sirve localmente: no hay solicitudes a Google Fonts. La analítica es la única integración de medición prevista.

El helper `src/scripts/analytics.ts` funciona sin GA y evita que un error de analítica bloquee acciones del sitio.

| Evento | Momento |
| --- | --- |
| `page_view` | Visita de página, a través de GA4 |
| `click_whatsapp` | Click en cualquiera de los enlaces a WhatsApp |
| `click_presupuesto` | Click en CTA comercial o consulta de un servicio |
| `form_submit` | Respuesta HTTP exitosa de Netlify Forms |
| `project_view` | Visita a una ficha individual de proyecto |
| `click_portfolio` | Click en el enlace discreto al fundador |

Si GA4 tiene activada la medición automática de interacciones con formularios, desactivarla en el flujo para evitar duplicar `form_submit` y mezclar intentos con envíos aceptados. No configurar dimensiones con los datos personales del formulario. El texto de privacidad describe la analítica condicional; si se incorpora una plataforma de consentimiento, conectar la carga de GA a su autorización antes de habilitarla.

## Google Search Console y SEO

1. Entrar en Search Console y añadir una propiedad de tipo **Dominio** con `koderyx.com.ar`, sin protocolo ni rutas.
2. Copiar el valor TXT de verificación que proporcione Google y añadirlo en el DNS que gestiona el dominio. Conservar los registros existentes.
3. Verificar la propiedad cuando el TXT se haya propagado. No hace falta insertar un código HTML si se usa esta verificación DNS.
4. En **Sitemaps**, enviar `https://koderyx.com.ar/sitemap-index.xml`.
5. En **Inspección de URLs**, inspeccionar `https://koderyx.com.ar/`, probar la URL publicada y solicitar indexación.

Ver [propiedades de dominio](https://support.google.com/webmasters/answer/34592?hl=es), [verificación](https://support.google.com/webmasters/answer/9008080?hl=es) y [envío de sitemaps](https://support.google.com/webmasters/answer/7451001?hl=es).

`astro.config.mjs` define el dominio de producción y `@astrojs/sitemap`. `Layout.astro` emite `lang="es-AR"`, title y descripción por página, canonical sin query, Open Graph, Twitter cards, favicon y JSON-LD Organization/WebSite. Inicio y servicios incluyen Service; las fichas incluyen CreativeWork.

`robots.txt` permite rastreo y referencia el sitemap. Las ocho páginas de contenido son indexables y están enlazadas internamente. `/gracias` y `/404.html` tienen **noindex intencional** y no aparecen en el sitemap.

## Agregar o editar proyectos

Editar `src/data/projects.ts`. Cada objeto genera una ficha automáticamente mediante `src/pages/proyectos/[slug].astro` y aparece en las grillas de proyectos.

1. Agregar un `slug` único, nombre, sector, categoría y descripción.
2. Completar problema, solución, funcionalidades y resultado con información confirmada.
3. Guardar los recursos en `public/images/projects/` y definir rutas absolutas desde `/images/projects/`.
4. Añadir `logos`, `cover` y/o `screenshots` con `src`, `alt`, `width` y `height`. Se usa `object-fit: contain`; no se aplican filtros de color a las marcas ni a las capturas.
5. Añadir `technologies` únicamente con tecnologías confirmadas. Un array vacío muestra un aviso de ficha técnica pendiente.
6. Añadir `url` solo cuando exista un sitio público confirmado.
7. Ejecutar `npm run check`, `npm run build` y `npm run verify`.

Las capturas existentes de SONRÍE+ y ELECTRODENTAL NEA se obtuvieron de sus páginas públicas el **12 de octubre de 2026**. Son capturas reales, no interfaces recreadas. Los gimnasios muestran sus dos logos oficiales y un espacio identificado para futuras capturas. No se publicaron pantallas internas ni información de socios.

Orígenes de los recursos proporcionados por el titular:

- SONRÍE+: `https://riemas.com.ar/img/imago-hor.svg`
- ELECTRODENTAL NEA: `https://electrodentalnea.com.ar/uploads/logo/05b15b3e-7b66-4d6b-9ea9-c87136618726.png`
- HALCÓN GYM: `http://66.97.36.196:8081/img/halcongympng.png`
- ClubFit House: `http://66.97.36.196:8080/img/clubfit-removebg-preview.png`

Los recursos se sirven localmente, sin hotlinks HTTP ni dependencia de esos servidores al visitar KODERYX. `scripts/prepare-assets.mjs` regenera los formatos optimizados a partir de los originales. `scripts/capture-projects.mjs` permite actualizar las dos capturas públicas con Playwright.

## Verificaciones

Los resultados de la entrega están resumidos en [VERIFICACION.md](VERIFICACION.md).

```bash
npm run check
npm run build
npm run verify
# Si no hay un Chromium de Playwright instalado:
npx playwright install chromium
npm run test:ui
```

Para usar un navegador ya instalado, definir `BROWSER_PATH` con su ejecutable. Ejemplo de este equipo:

```bash
BROWSER_PATH=/opt/microsoft/msedge/msedge npm run test:ui
```

La prueba UI sirve `dist/` dentro de un contexto aislado con origen `https://koderyx.test`. Revisa las diez páginas a **360, 390, 768, 1024, 1440 y 1920 px**, desbordes, teclado, menú, FAQ, preselección de servicio, validación, eventos y estados de error/éxito del formulario. Las respuestas de Netlify son simuladas, sin tráfico de envío externo. Incluye auditorías axe de accesibilidad y navegación sin JavaScript. Guarda capturas y resultados en `reports/`, excluido de Git.

Lighthouse sobre el build de producción:

```bash
npm run preview -- --port 4322
npx lighthouse http://localhost:4322 --output=html --output=json --output-path=reports/lighthouse-mobile
```

Con un navegador específico: `CHROME_PATH=/ruta/al/navegador`. En un entorno de automatización Linux puede requerirse `--chrome-flags='--headless --no-sandbox --disable-dev-shm-usage'`. Las mediciones locales no sustituyen la comprobación del sitio desplegado con sus cabeceras, DNS, TLS y Forms.

## Información que queda por completar

- Email comercial cuando esté disponible; hoy no se muestra una dirección ficticia.
- Tecnologías confirmadas de cada proyecto.
- Capturas reales de HALCÓN GYM y ClubFit House.
- ID de GA4 si se desea habilitar analítica.
- Despliegue, dominio/DNS, activación de Forms y verificación en Search Console.

No se incluyeron testimonios, cifras, plazos, precios ni resultados cuantitativos inventados.
