# Verificación de entrega · 12 de octubre de 2026

## Compilación y estructura

- `npm run check`: 0 errores, 0 advertencias.
- `npm run build`: 10 páginas estáticas generadas en `dist/`.
- `npm run verify`: 336 referencias internas a enlaces, anclas y recursos comprobadas, sin roturas.
- Metadatos únicos, canonical, Open Graph, Twitter cards, JSON-LD, favicon, robots y sitemap verificados.
- Ocho páginas de contenido en el sitemap. Gracias y 404 excluidas de forma intencional.
- GA4 ausente sin configuración; una compilación aislada con un ID de prueba confirmó la carga condicional. El ID de prueba no está en `dist/`.

## Navegador

- 60 combinaciones de ruta/ancho: las diez páginas a 360, 390, 768, 1024, 1440 y 1920 px.
- Sin desbordes horizontales detectados.
- Auditorías axe en inicio, contacto, servicios, privacidad y las tres fichas de proyectos, a 390 y 1440 px: sin incidencias detectadas en las reglas examinadas.
- Menú móvil con apertura, cierre mediante Escape y devolución del foco; cierre al navegar.
- FAQ operable por teclado; navegación y formulario disponibles sin JavaScript.
- Formulario: campos obligatorios, formato del teléfono, preselección de servicio, POST URL-encoded, honeypot y nombre de formulario.
- Respuesta 503 simulada: conserva datos, muestra aviso y habilita reintento. Respuesta exitosa simulada: navega a `/gracias`.
- Los cinco eventos solicitados se verificaron con un receptor local de prueba. `form_submit` solo se registró después de la respuesta exitosa.
- Sin errores inesperados en consola. El error HTTP 503 pertenece a la simulación intencional.

## Lighthouse móvil

Medición final en la compilación de producción servida localmente, con Chromium/Edge y Lighthouse 13.5.0:

| Categoría | Puntaje |
| --- | ---: |
| Rendimiento | 100 |
| Accesibilidad | 100 |
| Buenas prácticas | 100 |
| SEO | 100 |

LCP: aproximadamente 1,4 s. CLS: 0. Durante la revisión se corrigió un salto inicial del menú móvil y se precargó la fuente principal. Las etiquetas visibles y los nombres accesibles también pasaron la comprobación adicional de Lighthouse.

El informe completo queda en `reports/lighthouse-mobile.report.html`; las mediciones dependen del entorno y no son una promesa de resultados idénticos en producción.

## Alcance de estas comprobaciones

No se publicó en Netlify ni se modificaron DNS. No se enviaron consultas reales ni datos personales a terceros. La recepción real, las notificaciones de Netlify Forms, la redirección de dominio y las cabeceras del hosting requieren una comprobación posterior al despliegue.

La identidad de los cuatro proyectos se incorporó desde los logos proporcionados. Las capturas de SONRÍE+ y ELECTRODENTAL NEA son reales. Siguen pendientes las capturas de los gimnasios y la confirmación de tecnologías de los proyectos. El email comercial y el ID de GA4 están listos para configurarse cuando estén disponibles.
