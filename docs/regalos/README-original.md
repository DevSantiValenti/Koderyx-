# Momentos digitales · Koderyx

Catálogo de cinco experiencias personalizables. HTML5, CSS3 y JavaScript vanilla; sin framework, Node.js, npm, instalación, compilación, backend ni base de datos.

## Archivos

```text
Pagina-prototipo.html                 original intacto (privado)
referencias/pagina-prototipo.html     copia idéntica (privada)
site/index.html                      catálogo comercial
site/plantillas/reconciliacion.html
site/plantillas/pedido-noviazgo.html
site/plantillas/feliz-cumpleanos.html
site/plantillas/invitacion-cumpleanos.html
site/plantillas/propuesta-matrimonio.html
netlify.toml                         publica exclusivamente site
.gitignore                           excluye los originales privados
README.md                            esta guía
docs/analisis-prototipo.md            análisis de la referencia
docs/verificacion.md                 alcance de las comprobaciones
```

El logo oficial está incrustado sin modificaciones en los seis HTML. No hay hojas de estilo, scripts, fuentes ni imágenes remotas necesarias para abrir las demos. Los placeholders son dibujos CSS. Las fotos y música que agregues después deben viajar con cada entrega.

## Probar localmente

Abrí `site/index.html` con doble clic en tu navegador. También podés abrir cualquiera de los cinco HTML por separado. No necesitan servidor. Las fotos de ejemplo funcionan sin conexión; los enlaces a WhatsApp, Maps y Koderyx requieren Internet.

Si preferís una vista previa HTTP y tenés Python instalado, desde la raíz:

```bash
python3 -m http.server 8765 --bind 127.0.0.1 --directory site
```

Abrí `http://127.0.0.1:8765`. Es solo una herramienta opcional de revisión; no es una dependencia de las páginas. Detenela con Ctrl+C. Nunca sirvas la raíz del proyecto, porque contiene el prototipo privado.

## Personalizar

En el HTML elegido, buscá `const CONFIG` al comienzo del único bloque `<script>`. Editá ese objeto; no hace falta alterar la lógica posterior. Los comentarios marcan su comienzo y final.

Propiedades comunes:

- `nombreDestinatario`, `nombreRemitente`, `tituloPrincipal`, `bajada`: apertura y firma.
- `tituloCarta`, `mensajePrincipal`: carta y dedicatoria, cuando corresponde. Usá `\n\n` para separar párrafos.
- `fotos`: una lista de objetos `{ "src": "fotos/recuerdo.webp", "pie": "Un día especial", "alt": "Descripción de la fotografía" }`. Las rutas son relativas al HTML. También admite rutas como strings. `src: ""` muestra una ilustración; `fotos: []` genera tres placeholders. Una foto rota vuelve al placeholder.
- `historia`: recuerdos con `fecha`, `titulo` y `texto`. `fecha` es texto libre; se puede indicar una fecha real o un hito sin fecha.
- `motivos`: tarjetas con `titulo` y `texto`.
- `colorPrincipal`, `colorFondo`, `colorTexto`, `colorSuave`, `colorPapel`, `colorBorde`: colores hexadecimales completos, por ejemplo `#853b4f`. Los valores inválidos conservan los colores del diseño. Revisá el contraste después de cambiarlos.
- `musica`: `""` oculta controles. Una ruta local, por ejemplo `"audio/dedicatoria.mp3"`, habilita reproducir/pausar y silenciar. Usá audio propio o autorizado. No hay autoplay ni activación con otros botones.
- `modoDemo`: `true` muestra el encabezado de demo y el enlace al catálogo; `false` los oculta para una entrega independiente.
- `indexar`: `false` deja `noindex,follow`. Mantenelo así para regalos personales; no es protección por contraseña. Si decidís indexar una entrega, revisá también su título y descripción en `<head>`.

Los textos se asignan con `textContent`, por lo que no admiten etiquetas HTML. Conservá comillas y comas del objeto. Escapá comillas internas con `\"`. Si un texto contiene literalmente `</script>`, escribí `<\/script>` para no cerrar el bloque HTML. No pegues código de terceros dentro de CONFIG.

### Ajustes por experiencia

| HTML | Ajustes particulares |
| --- | --- |
| `reconciliacion.html` | `tituloFinal`, `mensajeFinal` y `mensajeJuego`; carta, compromisos y recuerdos. |
| `pedido-noviazgo.html` | `pregunta`, `respuestaSi`, `respuestaNo`. Ambos botones funcionan; las respuestas no se envían. |
| `feliz-cumpleanos.html` | `edad` opcional (`""` la oculta), `tituloSorpresa`, `mensajeSorpresa`. La caja revela la dedicatoria. |
| `invitacion-cumpleanos.html` | Fecha ISO, zona horaria, lugar, dirección, WhatsApp y mensaje. Ver sección siguiente. |
| `propuesta-matrimonio.html` | `pregunta`, `respuestaSi`, `respuestaDespues`, carta e historia. La alternativa permite pedir tiempo o rechazar. |

### Invitación y cuenta regresiva

La demo usa una fecha y ubicación ilustrativas, con un aviso visible. «Confirmar asistencia» abre un mensaje de prueba a Koderyx, no una confirmación ficticia guardada.

Para una invitación real, cambiá al menos:

```javascript
modoDemo: false,
nombreDestinatario: "Nombre de la persona",
edad: "", // opcional; admite valores de 1 a 130
fechaEvento: "2027-12-18T21:00:00-03:00", // REEMPLAZAR por la fecha real
zonaHoraria: "America/Argentina/Cordoba",
etiquetaHorario: "Hora de Argentina",
lugar: "Nombre real del lugar",
direccion: "Dirección completa, ciudad, provincia",
whatsapp: "", // REEMPLAZAR por el número real del anfitrión, con país y área
mensajeWhatsApp: "¡Hola! Confirmo mi asistencia al cumpleaños de {nombre}."
```

La fecha debe incluir `Z` o un desplazamiento explícito como `-03:00`. Se validan días imposibles, horas y zona horaria. Una fecha vacía o inválida no muestra números engañosos; una fecha pasada muestra que el momento ya llegó. La cuenta depende del reloj del dispositivo, sin servicio externo.

WhatsApp admite entre 8 y 15 dígitos; se eliminan espacios, paréntesis, `+` y guiones. Un valor vacío o inválido oculta el enlace. Esto valida formato, no comprueba si la cuenta existe. Maps busca la dirección configurada; no muestra una ubicación obtenida del visitante.

### WhatsApp comercial

En `site/index.html`, el objeto `CONFIG` centraliza el número `5493624701036` y el mensaje comercial. Para cambiarlo, editá `CONFIG.whatsapp`. Los enlaces se actualizan al cargar. El número figura una sola vez en el catálogo. El contacto por WhatsApp requiere JavaScript; sin él se muestra un aviso en la sección de contacto.

## Entregar una página a un cliente

1. Copiá el HTML elegido a una carpeta de entrega, fuera de `site` si no querés publicarlo en el catálogo.
2. Editá CONFIG, poné `modoDemo: false` y reemplazá datos ilustrativos.
3. Agregá fotos/audio y comprobá sus rutas. Para una entrega web podés renombrar el HTML como `index.html`.
4. Revisá el título y la descripción del `<head>`: los del catálogo son metadatos de demostración.
5. Probá en celular y computadora, incluidas respuestas negativas, enlaces y archivos multimedia.

## Publicar en Netlify

La configuración es estática: carpeta de publicación **`site`**, comando de compilación vacío. No se necesita preset de framework.

- **Repositorio:** conectá el repositorio a Netlify y usá `netlify.toml` de la raíz. El `.gitignore` evita agregar los originales privados en nuevos commits. No subas esos archivos manualmente.
- **Carga manual:** arrastrá únicamente la carpeta `site` a la carga manual de Netlify. No arrastres la carpeta del proyecto completa. El `index.html` debe quedar en la raíz de lo que subís.

Los cambios de CONFIG se publican al volver a desplegar. No hay panel ni sincronización automática desde el disco local.

Documentación oficial: https://docs.netlify.com/build/configure-builds/file-based-configuration/

Este trabajo prepara los archivos; no crea un sitio ni publica en una cuenta de Netlify. Una vez definido el dominio definitivo, se pueden añadir `canonical`, `og:url` y una imagen social propia sin inventar URLs ahora.
