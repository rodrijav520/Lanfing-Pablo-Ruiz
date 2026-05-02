# Deploy Instructions - Pablo Ruiz Landing Page

Fecha de generacion: 2026-04-23

---

## Requisitos

- Hosting estatico (Netlify, Vercel, GitHub Pages, o cualquier servidor web basico)
- Dominio configurado (pendiente de registrar segun brief)
- Acceso a internet para cargar Google Fonts (Playfair Display + Inter)

## Estructura de archivos

```
landing/
  index.html      - Pagina principal
  styles.css      - Estilos completos
  script.js       - Logica del calendario, animaciones, interacciones
```

Archivos externos referenciados:
- `../../assets/logo.png` - Logo de Pablo Ruiz
- `../../referencias/Hero03.jpeg` - Imagen de la seccion de solucion

## Pasos de deploy

1. Subir los 3 archivos (index.html, styles.css, script.js) al servidor
2. Subir la carpeta `assets/` con el logo al nivel correcto o ajustar las rutas de imagenes
3. Subir la imagen Hero03.jpeg al servidor o reemplazar con imagen apropiada
4. Verificar que las rutas de imagenes son correctas en el servidor de produccion
5. Probar la pagina en navegador

### Ajuste de rutas para produccion

Las rutas actuales son relativas para desarrollo local. Para produccion, cambiar:
- `../../assets/logo.png` por la ruta correcta en el servidor (ej: `/assets/logo.png` o URL absoluta)
- `../../referencias/Hero03.jpeg` por la ruta correcta o reemplazar con imagen propia

## Formulario / Calendario

- **Servicio usado:** JavaScript puro con localStorage
- **Endpoint:** No hay backend - las citas se guardan en localStorage del navegador
- **Campos que captura:** Nombre, Email, WhatsApp, Tipo de consulta, Fecha, Hora
- **Donde llegan los leads:** localStorage del navegador del visitante

### IMPORTANTE - Integracion con backend pendiente

El calendario actual funciona como demo/prototipo. Para produccion real se necesita:

1. **Opcion A - Google Forms:** Enviar los datos del formulario a un Google Form que alimente un Google Sheet
2. **Opcion B - Formspree/Formsubmit:** Integrar con servicio gratuito de formularios (formspree.io o formsubmit.co)
3. **Opcion C - WhatsApp directo:** Redirigir al usuario a WhatsApp con los datos pre-llenados
4. **Opcion D - Email:** Usar EmailJS para enviar notificacion por email sin backend

Recomendacion: Opcion C (WhatsApp directo) para fase 1, dado que Pablo cierra por WhatsApp segun el brief.

## Horarios configurados en el calendario

Basado en la disponibilidad de Pablo:
- **Martes, Jueves, Viernes:** 4:00 PM, 5:00 PM, 6:00 PM
- **Sabado:** 8:00 AM a 4:00 PM (slots cada hora, pausa al mediodia)
- **Domingo:** 8:00 AM a 11:00 AM
- **Lunes y Miercoles:** No disponible (practicas universitarias)

Para cambiar horarios, editar el objeto `SCHEDULE` en `script.js` (lineas 119-127).

## Pixel y tracking

### Pixel de Meta
No instalado actualmente. Para instalar:
1. Crear pixel en Meta Business Suite
2. Agregar el script del pixel en el `<head>` del index.html, antes del cierre de `</head>`
3. Agregar evento de conversion `fbq('track', 'Schedule')` en la funcion `showBookingSuccess` de script.js

### Google Analytics
No instalado actualmente. Para instalar:
1. Crear propiedad en Google Analytics 4
2. Agregar el tag de GA4 en el `<head>` del index.html
3. Configurar eventos personalizados para: click en CTA, agendamiento completado, click en WhatsApp

### Google Tag Manager
No instalado. Instalar GTM es la opcion recomendada para gestionar todos los tags desde un solo lugar.

## Elementos pendientes antes de publicar

1. **FOTO DE PABLO** - Actualmente hay placeholders. Necesita:
   - Foto profesional para el hero (formato vertical, 4:5)
   - Foto/retrato para la seccion "Sobre Pablo" (formato vertical, 3:4)
   - Ambas deben ser fotos reales de Pablo, no stock

2. **NUMERO DE WHATSAPP** - Reemplazar `50200000000` por el numero real de Pablo en:
   - Todos los links de WhatsApp en index.html (buscar y reemplazar)

3. **EMAIL DE CONTACTO** - Reemplazar `contacto@pabloruiz.gt` por el email real

4. **INTEGRACION DE FORMULARIO** - Conectar el calendario con un servicio real de captura de leads

5. **DOMINIO** - Registrar dominio y configurar hosting

## Pruebas antes de publicar

1. Abrir index.html en navegador y verificar que carga correctamente
2. Probar el calendario: seleccionar dia, horario, llenar formulario, confirmar
3. Verificar que la pagina se ve bien en movil (usar DevTools del navegador)
4. Verificar que todos los links de navegacion funcionan
5. Verificar que el boton de WhatsApp abre la conversacion correcta
6. Probar en Chrome, Firefox y Safari
7. Verificar velocidad con PageSpeed Insights despues del deploy

## Notas tecnicas

- La pagina funciona abriendo el index.html directamente en el navegador (no necesita servidor)
- No tiene dependencias externas excepto Google Fonts
- JavaScript es vanilla, sin frameworks ni librerias
- CSS usa variables personalizadas (custom properties) para facil personalizacion de colores
- Responsive: funciona en movil (320px+), tablet y desktop
- Animaciones usan Intersection Observer para performance optima
