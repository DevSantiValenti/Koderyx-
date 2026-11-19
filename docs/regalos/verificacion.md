# Comprobaciones realizadas

## Resultado

67 comprobaciones automatizadas en el navegador integrado: **0 errores**. Se realizaron además pruebas manuales de filtros, respuestas, apertura del regalo y reproducción/pausa de un archivo WAV silencioso de prueba. La página temporal de pruebas se retiró de `site` al terminar.

## Cobertura

- Seis páginas a 360, 430 y 1280 px: sin desbordamiento horizontal y con un único encabezado principal.
- Inspección visual de las cinco aperturas móviles y de escritorio y del catálogo.
- Galerías vacías, foto configurada, proporción `object-fit: cover`, recuperación del placeholder ante imagen rota, apertura/cierre del diálogo.
- Personalización del nombre como texto literal, color configurable, encabezado de demo ocultable.
- Memoria: ocho cartas, cuatro parejas completadas y reinicio.
- Noviazgo y matrimonio: revelado de pregunta, respuesta positiva, respuesta negativa/tiempo y partículas.
- Cumpleaños: edad opcional y apertura de la dedicatoria del regalo.
- Invitación: fecha futura, fecha vacía, fecha pasada, día imposible, zona ausente e inválida; sin `NaN` ni cuenta regresiva inválida.
- Enlaces de WhatsApp y Maps: codificación de nombre/dirección; ocultación ante número inválido o dirección vacía; diferencia entre mensaje de demo y de entrega.
- Música: controles ocultos sin archivo, visibles con archivo, sin autoplay, estado de silencio y reproducción/pausa desde el botón.
- Filtros del catálogo y WhatsApp comercial correcto.
- Revisión estática de identificadores únicos, enlaces locales, anclas, objetos CONFIG, títulos y ausencia de dependencias remotas necesarias.
- Configuración TOML validada con el esquema JSON oficial de Netlify.
- Comparación binaria del original con su copia privada y comprobación de que ninguno de los 42 recursos personales incrustados del prototipo aparece en los HTML públicos.

## Correcciones durante la revisión

Se corrigió el desbordamiento de una órbita CSS en la plantilla de cumpleaños, se ajustó el título del pedido de noviazgo en móvil y se separaron adornos del texto en las dos propuestas. El horario de la invitación se expresa en formato de 24 horas y con una etiqueta legible de zona horaria.

## Límites de la validación

Las pruebas se ejecutaron en el navegador integrado, por HTTP local y documentos autónomos `srcdoc`. Su política no permite navegar directamente a `file://`, por lo que no se realizó esa apertura automatizada. Los archivos no utilizan fetch, módulos, imports ni recursos compartidos para funcionar; están preparados para abrirse directamente en un navegador normal.

No se hicieron pruebas en teléfonos físicos ni en Safari/Firefox, mediciones de Lighthouse, una auditoría WCAG completa o un despliegue real. `prefers-reduced-motion` está implementado tanto en CSS como en las partículas JavaScript; no se cambió la preferencia del sistema durante esta revisión. No se enviaron mensajes por WhatsApp. Las imágenes y el audio de pruebas fueron sintéticos, sin material personal ni canciones comerciales.
