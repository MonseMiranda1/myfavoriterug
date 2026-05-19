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

El frontend se comunica con el backend usando Axios. La instancia compartida esta en:

```txt
src/services/http.ts
```

Ese archivo configura la URL base:

```txt
http://localhost:8080/api
```

Los servicios no deben crear nuevas instancias de Axios. Deben importar el cliente compartido:

```ts
import { API } from "./http";
```

Servicios actuales:

- `src/services/api.ts`: productos y categorias.
- `src/services/orders.ts`: pedidos y pagos.
- `src/services/accountAuth.ts`: registro, login, perfil y logout.

## Login de clientes

El login no se valida en el frontend. El frontend envia email y contraseña al backend:

```txt
POST /api/auth/login
```

Si el login es correcto, el backend responde:

```json
{
  "token": "token-de-sesion",
  "user": {
    "name": "Cliente",
    "email": "cliente@email.com",
    "phone": "",
    "rut": "",
    "address": ""
  }
}
```

El frontend guarda esa sesion en `localStorage` usando la key:

```txt
my-favorite-rug-account-session
```

Para consultar o actualizar el perfil se envia el token:

```txt
Authorization: Bearer token-de-sesion
```

Archivos involucrados:

- `src/components/AccountGate.tsx`: formulario de login/registro.
- `src/services/accountAuth.ts`: llamadas a `/api/auth`.
- `src/pages/Account.tsx`: edicion de perfil.

Nota: el login admin todavia vive en `src/pages/Admin.tsx` con credenciales hardcodeadas. Conviene moverlo al backend en una siguiente etapa.
