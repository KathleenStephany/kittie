# Kittie.exe · micrositio retro-poético

Este repositorio contiene un micrositio estático para exhibir tus poemas en un
ambiente inspirado en consolas clásicas. Incluye secciones para:

- Poema principal en formato texto con estética de monitor CRT.
- Galería de poemas en imágenes con controles retro.
- Poema digital incrustado (HTML/CSS/JS propios).
- Video poema vía iframe (YouTube, Vimeo u otro servicio).
- Bot poético para respuestas generativas sencillas.

## Estructura

```
index.html           # Página principal
styles/main.css      # Estilos generales del micrositio
scripts/gallery.js   # Lógica para la galería de imágenes
assets/
  imagenes/          # Añade aquí tus poemas en imagen (.jpg, .png, etc.)
  poema-digital/     # Mini sitio para tu poema interactivo
  bot/               # Mini sitio para tu bot poético
```

## Cómo abrir el micrositio

Tienes dos formas sencillas de verlo en tu computadora:

1. **Abrir directamente el archivo.** Haz doble clic en `index.html` (o ábrelo
   con tu navegador favorito). Verás el micrositio, aunque algunos navegadores
   limitan funciones como iframes locales.
2. **Usar un servidor estático ligero.** Desde la carpeta del proyecto ejecuta:

   ```bash
   python3 -m http.server 8080
   ```

   Luego entra a <http://localhost:8080> en tu navegador. Con esto todo el
   contenido embebido funcionará como en producción.

## Cómo personalizar

1. **Poema principal:** edita el bloque dentro de `<section id="poema-principal">`.
2. **Galería:** reemplaza las rutas en `index.html` y añade tus imágenes en
   `assets/imagenes/`.
3. **Poema digital:** sustituye el contenido de `assets/poema-digital/` con tu
   versión (puede ser HTML puro o una app ligera).
4. **Video poema:** cambia la URL del iframe (YouTube, Vimeo, archivo propio).
5. **Bot:** modifica `assets/bot/` con la lógica o integración de tu bot.

Luego sirve los archivos con cualquier servidor estático o sube la carpeta a tu
hosting favorito.
