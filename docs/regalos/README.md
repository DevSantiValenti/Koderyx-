# Catálogo de páginas para regalar

## Arquitectura

- `src/pages/regalos.astro` define metadatos, canonical y schema `CollectionPage`/`ItemList`.
- `src/components/RegalosCatalog.astro` contiene la composición, filtros y enlaces comerciales.
- `src/data/gifts.ts` es la fuente de títulos, categorías y textos de las cinco experiencias.
- `src/styles/regalos.css` conserva los estilos originales, activados solo con `html.kdx-regalos`.
- `public/regalos/plantillas/` contiene las demos HTML autónomas que se copian sin framework ni dependencias.
- `public/regalos/imagenes-demo/` contiene ocho fotografías temáticas locales para cada demo y el registro de sus fuentes.
- `private/regalos/` guarda el prototipo fuente y su referencia. Está en `.gitignore` y no forma parte del sitio publicado.

## Editar el catálogo

Para agregar o cambiar una experiencia comercial, editar `src/data/gifts.ts`. El `slug` debe coincidir con el nombre del archivo HTML bajo `public/regalos/plantillas/`. Los filtros usan `amor` o `cumple`. Los enlaces de contacto toman el teléfono de `PUBLIC_WHATSAPP_NUMBER` definido en `src/config/site.ts`.

Cada demo mantiene su objeto `CONFIG` dentro de su archivo HTML. Ahí se editan nombres, mensajes, colores, fotos, audio opcional y ajustes del modelo. Los textos se insertan como texto, no como HTML. Las demos están marcadas `noindex,follow`; se excluyen deliberadamente del sitemap aunque estén disponibles para mostrar el producto.

Las cinco plantillas incluyen ocho fotografías de muestra por defecto en `CONFIG.fotos`, también la invitación de cumpleaños. Se distribuyen en cuatro pares entre distintas secciones de cada página (carta, recuerdos, historia o cierre, según el modelo), conservando el orden de la lista. Cada ubicación usa `data-photo-group`. En una entrega, reemplazar cada `src` por la ruta de la fotografía autorizada del cliente y editar `pie` (y opcionalmente `alt`). Se pueden agregar más entradas para otros planes: todas se reparten de forma equilibrada entre las cuatro ubicaciones, sin recortarlas. Si la lista está vacía, se muestran ocho espacios de muestra. Una lista personalizada conserva la cantidad elegida y las ubicaciones sin fotos se ocultan.

Cada álbum tiene su propio tratamiento: papel y cinta en reconciliación, tarjetas románticas en noviazgo, mosaico festivo en cumpleaños, postales en invitación y marcos editoriales en matrimonio. Los detalles se mantienen dentro de cada HTML para conservar entregas autónomas. Las fotografías de muestra se sirven como archivos locales; las plantillas no dependen de servidores externos para mostrarlas.

## Planes y presupuestos

`src/data/gift-pricing.ts` centraliza planes, precios normales/de lanzamiento, extras, experiencias Premium y la vigencia de 3 meses. `RegalosPricing.astro` presenta esa información y `src/scripts/gift-quote.ts` calcula el resumen y prepara el enlace de WhatsApp con la selección del visitante.

La promoción está configurada para los primeros cinco clientes. **No hay contador ni reserva automática de cupos**: se confirma la disponibilidad por WhatsApp. Al completar los cinco pedidos, cambiar `giftOffer.active` a `false` y volver a compilar/publicar. Las tarjetas y el calculador pasarán a precios normales juntos.

Los extras ya incluidos no se vuelven a cobrar. El minijuego se ofrece únicamente como una de las experiencias incluidas en Premium; no aparece como extra independiente. La carta animada sí puede agregarse a otro plan. Fotos adicionales se cobran por paquete de hasta 10, y las correcciones por ronda. El diseño exclusivo reemplaza la base de plantilla por un mínimo de $90.000; alcance y total final quedan a confirmar. Las extensiones se consultan por separado y no se suman al cálculo.

El extra de QR genera un código con el enlace definitivo de la página-regalo. Al escanearlo con la cámara del celular, abre esa página en el navegador. Se entrega como imagen para compartir o imprimir y se prepara después de publicar el sitio, ya que depende de su URL final. Si la URL cambia, hay que generar un QR nuevo.

Las cuatro experiencias Premium son implementables en HTML, CSS y JavaScript, sin aplicación ni backend. Sus explicaciones viven en `giftSurprises`: `Nuestra historia` es la línea de tiempo interactiva; el regalo virtual es una caja animada; el minijuego puede ser de preguntas, memoria o rompecabezas; y la carta secreta se desbloquea con una secuencia breve. Cada opción define cómo funciona, qué material necesita y qué recibe la persona. Esa información se muestra al cambiar la selección en el presupuestador y se incluye en el mensaje de WhatsApp.

El presupuesto no almacena datos, recibe archivos, reserva fechas ni realiza cobros. El visitante revisa y envía el texto en WhatsApp. Los medios se coordinan posteriormente. El anticipo y saldo muestran el 50% cada uno. La vigencia indicada es una condición comercial: no programa automáticamente la baja de sitios de clientes.

Prueba específica (después de `npm run build`, con Node 22.18+ o 24): `node scripts/test-gift-quote.mjs`. Comprueba importes, cambios de plan, exclusiones, mensaje, accesibilidad y responsive; no envía mensajes reales.

## Preparar la entrega

No publicar la página final de un cliente dentro de `public/regalos/plantillas/` ni bajo el dominio de Koderyx. Preparar una carpeta de entrega con el modelo elegido, ajustar `CONFIG`, agregar únicamente medios autorizados y probar la experiencia. Renombrar el HTML como `index.html` si corresponde y desplegar esa carpeta como un sitio estático independiente en Netlify. Configurar allí el dominio del cliente si lo tiene; no hace falta usar `koderyx.com.ar`.

El prototipo de `private/regalos/` puede contener material personal. No moverlo a `public/`, no quitar su exclusión de `.gitignore` y no subirlo a repositorios o servicios de publicación.

## Verificación

Desde la raíz de Koderyx:

```bash
npm run check
npm run build
npm run verify
npm run test:ui
node scripts/test-gift-templates.mjs
```

El build incluye el catálogo en el sitemap, pero no las cinco demos. `scripts/verify-build.mjs` revisa por separado los metadatos de Koderyx y el `noindex`/enlace de regreso de las demos. `scripts/test-ui.mjs` comprueba el filtro y el comportamiento responsive.
