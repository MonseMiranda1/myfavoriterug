# My Favorite Rug

Proyecto web para una tienda de alfombras personalizadas. La idea es que una persona pueda entrar a la pagina, ver productos, revisar el detalle de una alfombra, agregarla al carrito y avanzar al pago.

El proyecto esta separado en dos partes:

- `frontend`: la pagina que ve el usuario.
- `backend`: la API que deberia entregar los datos de productos y conectarse a la base de datos.

## Estado actual

El frontend ya tiene las pantallas principales y consume el backend en:

```txt
http://localhost:8080/api
```

El backend ya tiene endpoints para productos, pedidos, pagos y autenticacion de clientes. La tienda puede pedir productos al backend, crear pedidos y manejar inicio de sesion de clientes con un token de sesion.

## Tecnologias usadas

### Frontend

- React
- TypeScript
- Vite
- React Router
- Axios
- Tailwind CSS

### Backend

- Java 21
- Spring Boot
- Maven
- Spring Web MVC
- Spring Data JPA
- PostgreSQL

## Estructura del proyecto

```txt
myfavoriterug/
+-- backend/
+-- frontend/
+-- .vscode/
+-- .gitignore
`-- README.md
```

### `backend/`

Contiene el servidor hecho con Spring Boot. Esta parte se encarga de la logica del negocio, la conexion con la base de datos y los endpoints que consume el frontend.

Archivos y carpetas importantes:

```txt
backend/
+-- pom.xml
+-- mvnw
+-- mvnw.cmd
`-- src/
    +-- main/
    |   +-- java/rug/backend/
    |   |   +-- BackendApplication.java
    |   |   +-- controller/
    |   |   +-- model/
    |   |   +-- repository/
    |   |   `-- service/
    |   `-- resources/
    |       `-- application.yaml
    `-- test/
```

- `pom.xml`: define las dependencias del backend, como Spring Boot, JPA y PostgreSQL.
- `mvnw` y `mvnw.cmd`: permiten ejecutar Maven sin instalarlo globalmente.
- `BackendApplication.java`: archivo principal que inicia el backend.
- `controller/`: rutas de la API, por ejemplo `/api/products`, `/api/orders`, `/api/payments` y `/api/auth`.
- `model/`: entidades JPA que representan datos de la base de datos, como `Product`, `CustomerOrder`, `Payment` y `AccountUser`.
- `repository/`: interfaces de Spring Data JPA para consultar y guardar datos.
- `service/`: logica del negocio antes de responder al frontend.
- `application.yaml`: configuracion del backend, incluyendo la conexion a PostgreSQL.
- `test/`: pruebas automaticas del backend.

### `frontend/`

Contiene la aplicacion visual hecha con React. Es lo que abre el usuario en el navegador.

Archivos y carpetas importantes:

```txt
frontend/
+-- package.json
+-- vite.config.ts
+-- index.html
+-- public/
`-- src/
    +-- assets/
    +-- components/
    +-- pages/
    +-- routes/
    +-- services/
    +-- App.tsx
    +-- main.tsx
    +-- App.css
    `-- index.css
```

- `package.json`: define dependencias y comandos del frontend.
- `vite.config.ts`: configuracion de Vite.
- `index.html`: HTML base donde se monta React.
- `public/`: archivos publicos como iconos o favicon.
- `src/assets/`: imagenes, logos, tipografias e iconos usados por la interfaz.
- `src/components/`: partes reutilizables de la pagina, como `Navbar`, `Footer`, `Hero`, `Categories` y `HowItWorks`.
- `src/pages/`: pantallas completas de la aplicacion.
- `src/routes/`: configuracion de rutas de React Router.
- `src/services/`: funciones para comunicarse con el backend.
- `src/main.tsx`: punto de entrada de React.
- `src/App.tsx`: componente base de la aplicacion.
- `src/index.css` y `src/App.css`: estilos generales.

## Paginas del frontend

- `/`: pagina de inicio. Muestra navbar, banner principal, seccion de funcionamiento, categorias y footer.
- `/tienda`: lista productos pedidos al backend.
- `/producto/:id`: muestra el detalle de un producto segun su `id`.
- `/carrito`: pantalla del carrito. Actualmente tiene contenido base.
- `/checkout`: pantalla de pago. Actualmente tiene contenido base.

## Como ejecutar el proyecto

Se recomienda abrir dos terminales: una para el backend y otra para el frontend.

### 1. Ejecutar el backend

Desde la raiz del proyecto:

```bash
cd backend
./mvnw spring-boot:run
```

En Windows tambien se puede usar:

```bash
cd backend
mvnw.cmd spring-boot:run
```

Por defecto deberia quedar disponible en:

```txt
http://localhost:8080
```

### 2. Ejecutar el frontend

Desde otra terminal:

```bash
cd frontend
npm install
npm run dev
```

Vite mostrara una URL parecida a:

```txt
http://localhost:5173
```

Esa es la pagina que se abre en el navegador.

## Comandos utiles

### Frontend

```bash
npm run dev
npm run build
npm run lint
npm run preview
```

- `npm run dev`: levanta el frontend en modo desarrollo.
- `npm run build`: genera la version final para produccion.
- `npm run lint`: revisa errores de estilo o codigo.
- `npm run preview`: permite revisar localmente la version generada por `build`.

### Backend

```bash
./mvnw spring-boot:run
./mvnw test
```

- `spring-boot:run`: levanta el backend.
- `test`: ejecuta las pruebas del backend.

En Windows, cambiar `./mvnw` por `mvnw.cmd`.

## Cliente Axios del frontend

El frontend usa Axios para comunicarse con el backend. La instancia compartida esta en:

```txt
frontend/src/services/http.ts
```

Ese archivo define:

```ts
export const API = axios.create({
  baseURL: "http://localhost:8080/api",
});
```

Todos los servicios del frontend deben importar esa instancia en vez de crear otra:

```ts
import { API } from "./http";
```

Esto evita repetir la URL base y deja un solo lugar para configurar headers, interceptores o cambios de ambiente.

Servicios que usan el cliente compartido:

- `frontend/src/services/api.ts`: productos y categorias.
- `frontend/src/services/orders.ts`: pedidos y pagos.
- `frontend/src/services/accountAuth.ts`: login, registro, perfil y logout.

`http.ts` tambien expone `getApiErrorMessage()`, que permite mostrar mensajes enviados por el backend en respuestas como:

```json
{ "message": "Correo o contraseña incorrectos." }
```

## Autenticacion de clientes

La autenticacion real ocurre en el backend. El frontend solo muestra el formulario y guarda la sesion devuelta por la API.

Archivos principales del backend:

- `backend/src/main/java/rug/backend/controller/AuthController.java`
- `backend/src/main/java/rug/backend/service/AuthService.java`
- `backend/src/main/java/rug/backend/model/AccountUser.java`
- `backend/src/main/java/rug/backend/model/AccountSession.java`
- `backend/src/main/java/rug/backend/repository/AccountUserRepository.java`
- `backend/src/main/java/rug/backend/repository/AccountSessionRepository.java`

Endpoints disponibles:

```txt
POST  /api/auth/register
POST  /api/auth/login
GET   /api/auth/me
PATCH /api/auth/me
POST  /api/auth/logout
```

### Registro

`POST /api/auth/register`

Body esperado:

```json
{
  "name": "Cliente",
  "email": "cliente@email.com",
  "password": "secreto123",
  "phone": "",
  "rut": "",
  "address": ""
}
```

Respuesta:

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

### Login

`POST /api/auth/login`

Body esperado:

```json
{
  "email": "cliente@email.com",
  "password": "secreto123"
}
```

Si las credenciales son correctas, responde igual que registro: token y datos del usuario. Si son incorrectas, responde `401` con un mensaje de error.

### Sesion actual

`GET /api/auth/me`

Debe enviarse el token en el header:

```txt
Authorization: Bearer token-de-sesion
```

Respuesta:

```json
{
  "name": "Cliente",
  "email": "cliente@email.com",
  "phone": "",
  "rut": "",
  "address": ""
}
```

### Actualizar perfil

`PATCH /api/auth/me`

Tambien requiere:

```txt
Authorization: Bearer token-de-sesion
```

Body esperado:

```json
{
  "name": "Cliente actualizado",
  "phone": "+56912345678",
  "rut": "11111111-1",
  "address": "Santiago, Chile"
}
```

### Logout

`POST /api/auth/logout`

El backend elimina la sesion asociada al token. El frontend tambien borra la sesion guardada en `localStorage`.

### Seguridad actual

- La contraseña no se guarda en texto plano.
- `AuthService` guarda un hash PBKDF2 con salt.
- El navegador guarda el token y los datos del usuario en `localStorage`.
- El token se envia como `Authorization: Bearer ...` para endpoints protegidos.

Pendiente recomendado para produccion:

- Mover el token a cookies `HttpOnly` y `Secure`.
- Agregar expiracion de sesiones.
- Agregar Spring Security o JWT si se necesita control de roles.
- Mover el login admin al backend. Actualmente el panel admin todavia tiene credenciales hardcodeadas en frontend.

## Flujo basico de datos

1. El usuario abre el frontend.
2. La pagina `/tienda` llama a `getProducts()`.
3. `getProducts()` usa `API` desde `frontend/src/services/http.ts`.
4. Axios pide datos a `http://localhost:8080/api/products`.
5. El backend responde con una lista de productos.
6. React muestra esos productos en la tienda.

Flujo basico de login:

1. El usuario escribe correo y contraseña en el frontend.
2. `AccountGate` llama a `loginAccount()` o `registerAccount()`.
3. `accountAuth.ts` envia la solicitud a `/api/auth/login` o `/api/auth/register`.
4. El backend valida credenciales y devuelve token + usuario.
5. El frontend guarda `{ token, user }` en `localStorage`.
6. Para `/api/auth/me`, el frontend envia `Authorization: Bearer token`.

El tipo de producto esperado por el frontend es:

```ts
type Product = {
  id: number | string;
  name: string;
  price: number;
  image: string;
};
```

## Tareas pendientes recomendadas

- Revisar la configuracion de CORS si el frontend no puede comunicarse con el backend.
- Hacer que el boton "Agregar al carrito" guarde productos.
- Completar la logica real del carrito y checkout.
- Proteger endpoints admin desde backend.
- Mover el login admin al backend.
- Agregar expiracion de tokens de sesion.
- Mover credenciales sensibles de `application.yaml` a variables de entorno antes de subir o compartir el proyecto.

## Nota para el equipo

Cuando agreguen una carpeta o archivo importante, actualicen este README. Asi todos pueden entender donde va cada cosa sin tener que revisar todo el codigo.
