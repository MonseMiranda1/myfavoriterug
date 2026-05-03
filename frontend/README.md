# Frontend

Esta carpeta contiene la parte visual de My Favorite Rug. Esta hecha con React, TypeScript y Vite.

Para ver la documentacion completa del proyecto, revisar el `README.md` de la carpeta principal.

## Como correrlo

```bash
npm install
npm run dev
```

La aplicacion se abre normalmente en:

```txt
http://localhost:5173
```

## Carpetas principales

- `src/pages/`: pantallas completas, como inicio, tienda, carrito y checkout.
- `src/components/`: piezas reutilizables, como navbar, footer, hero y categorias.
- `src/routes/`: rutas de navegacion de React Router.
- `src/services/`: comunicacion con el backend.
- `src/assets/`: imagenes, logos, iconos y fuentes.
- `public/`: archivos publicos que Vite sirve directamente.

## Conexion con backend

El frontend pide productos a:

```txt
http://localhost:8080/api/products
```

Esa URL esta configurada en:

```txt
src/services/api.ts
```
