# Análisis del prototipo

Se revisó el HTML completo, sus estilos y todo su JavaScript antes de implementar las plantillas. El original tiene 15.613.064 bytes. Se conservó intacto en la raíz y se creó una copia idéntica en `referencias/pagina-prototipo.html`.

## Estructura y experiencia original

- Documento HTML autónomo con CSS y JavaScript inline, tipografía de sistema y Georgia.
- Apertura a pantalla completa, carta, tres galerías generadas desde arreglos, bloque fotográfico con cita, lista de intenciones, sección centrada en un mes concreto, tres juegos y mensaje final.
- Fondo oscuro violeta, degradados rosa/dorado, tarjetas translúcidas, sombras, bordes redondeados y tamaños tipográficos con `clamp`.
- Galerías en grilla de doce columnas; variantes grandes, pequeñas, medias y panorámicas. A menos de 760 px pasan a una columna. Las imágenes usan `object-fit: cover`.
- Recursos personales embebidos: 41 apariciones de imágenes y un audio. El peso se concentra en esos recursos. No se copiaron a los documentos públicos.

## JavaScript e interacciones

- Generación de 90 estrellas y corazones mediante temporizador; partículas al interactuar.
- Aparición de secciones con `IntersectionObserver`.
- Galerías creadas dinámicamente, ampliación en un lightbox, cierre con botón, fondo y Escape.
- Medidor incremental, elecciones con mensajes y memoria de ocho cartas/cuatro parejas. Bloqueo temporal durante parejas incorrectas.
- Música embebida con reproducción/pausa, intento automático al cargar y activación por el primer toque o tecla.

## Aspectos a corregir al convertirlo en producto

- Contenidos íntimos, referencias temporales, nombres de archivos y medios personales no son material reutilizable.
- El autoplay y los disparadores globales de audio contradicen el control voluntario pedido.
- Las fotos se activaban mediante figuras con clic: faltaban botones accesibles y gestión modal del foco.
- Las animaciones no contemplaban `prefers-reduced-motion`; el temporizador de corazones era permanente.
- Parte del contenido dependía de animaciones de revelado que podían dejarlo invisible sin JavaScript.
- No existía un objeto central que reuniera la personalización.

## Aplicación a la reconciliación nueva

Se conserva la progresión apertura → carta → galería → recuerdos → compromisos → memoria → cierre. El diseño pasa a una carta en papel crema con sobre ilustrado, bordó, rosa suave y detalles dorados. Todos los mensajes son nuevos y genéricos, sin plazos para responder ni promesas que condicionen al destinatario.

La memoria se mezcla con Fisher–Yates, tiene etiquetas accesibles, estado anunciado y reinicio. Las fotos reales usan botones y un diálogo nativo. Los efectos son breves y respetan movimiento reducido. El audio es opcional, no se carga anticipadamente y solo se reproduce desde su control específico.

Las otras cuatro experiencias se construyeron con composiciones y motivos propios, sin reutilizar fotografías, música ni textos privados.
