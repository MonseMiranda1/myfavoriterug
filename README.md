# My Favorite Rug

Aplicacion web full stack para una tienda de alfombras personalizadas. Incluye catalogo, personalizacion y cotizaciones, carrito, checkout, pagos, portal de clientes, reseñas y un panel administrativo.

## Funcionalidades

### Tienda y contenido

- Inicio con categorias, proceso de trabajo, contenido multimedia y reseñas aprobadas.
- Catalogo con busqueda, filtros, ordenamiento, paginacion y cache local.
- Detalle de productos con galeria de imagenes.
- Carrito persistente en el navegador.
- Paginas de galeria, blog, contacto, envios, terminos y metodos de pago.
- Interfaz disponible en español e ingles.
- Carga diferida de rutas e imagenes para mejorar el rendimiento.

### Personalizacion y ventas

- Formulario para solicitar una alfombra personalizada.
- Carga y vista previa de una imagen de referencia.
- Seleccion de tamaño, lana, colores y comentarios.
- Generacion y seguimiento de cotizaciones.
- Checkout con informacion de despacho y resumen del pedido.
- Metodos de pago mediante Flow, PayPal y transferencia bancaria.
- Confirmacion de orden y seguimiento de estados.

### Portal de clientes

- Registro, inicio y cierre de sesion.
- Recuperacion de contraseña mediante token enviado por correo.
- Perfil editable con nombre, telefono, RUT/DNI, direccion, pais y ciudad/estado.
- Historial y seguimiento de pedidos.
- Historial de cotizaciones.
- Envio de reseñas con calificacion, comentario y foto desde pedidos entregados.

### Panel administrativo

- Autenticacion administrativa con sesion separada.
- Gestion de productos, categorias e imagenes.
- Gestion de pedidos y estados de despacho.
- Gestion de cotizaciones y clientes.
- Gestion de pagos y ordenes de compra.
- Moderacion y eliminacion de reseñas.

## Tecnologias

### Frontend

- React 19
- TypeScript
- Vite
- React Router
- Axios
- Zustand
- CSS y PostCSS

### Backend

- Java 21
- Spring Boot 4
- Spring Web MVC
- Spring Data JPA
- PostgreSQL
- Maven Wrapper
- Cloudinary para imagenes en produccion
- Resend para recuperacion de contraseña
- Flow para pagos
- Docker

## Estructura

```text
myfavoriterug/
|-- backend/
|   |-- Dockerfile
|   |-- pom.xml
|   `-- src/
|       |-- main/java/rug/backend/
|       |   |-- config/
|       |   |-- controller/
|       |   |-- model/
|       |   |-- repository/
|       |   `-- service/
|       |-- main/resources/application.yaml
|       `-- test/
|-- frontend/
|   |-- public/
|   |-- src/
|   |   |-- assets/
|   |   |-- components/
|   |   |-- data/
|   |   |-- pages/
|   |   |-- routes/
|   |   `-- services/
|   |-- .env.example
|   |-- package.json
|   `-- vite.config.ts
`-- README.md
```

## Rutas del frontend

| Ruta | Descripcion |
| --- | --- |
| `/` | Inicio y reseñas de clientes |
| `/tienda` | Catalogo de productos |
| `/producto/:id` | Detalle de producto |
| `/personaliza` | Solicitud de alfombra personalizada |
| `/carrito` | Carrito de compras |
| `/checkout` | Datos de despacho y pago |
| `/orden-confirmada` | Confirmacion del pedido |
| `/cuenta` | Perfil, registro e inicio de sesion |
| `/cuenta/pedidos` | Historial de pedidos y envio de reseñas |
| `/cuenta/cotizaciones` | Historial de cotizaciones |
| `/cuenta/seguimiento` | Seguimiento de pedidos |
| `/galeria` | Galeria de trabajos |
| `/blog` | Guias y publicaciones |
| `/sobre-nosotros` | Informacion del proyecto |
| `/contacto` | Contacto |
| `/envios` | Informacion de envios |
| `/terminos` | Terminos y condiciones |
| `/metodos-de-pago` | Metodos de pago disponibles |
| `/admin` | Panel administrativo |

Las rutas secundarias se cargan con `React.lazy` para reducir la carga inicial.

## API del backend

La API utiliza el prefijo `/api`.

| Recurso | Endpoints principales |
| --- | --- |
| Autenticacion | `/auth/register`, `/auth/login`, `/auth/me`, `/auth/logout` |
| Recuperacion | `/auth/password-reset/request`, `/auth/password-reset/confirm` |
| Administracion | `/admin/login`, `/admin/logout` |
| Productos | `/products`, `/products/{id}`, `/products/images` |
| Pedidos | `/orders`, `/orders/mine`, `/orders/{id}` |
| Pagos | `/payments`, `/payments/intent`, `/payments/flow/confirmation` |
| Cotizaciones | `/quotes`, `/quotes/me` |
| Reseñas | `/reviews`, `/reviews/admin`, `/reviews/{id}/approval` |
| Ordenes de compra | `/purchase-orders` |

Los endpoints protegidos de clientes reciben:

```text
Authorization: Bearer <token>
```

El cliente Axios compartido esta en `frontend/src/services/http.ts`. Lee `VITE_API_URL`, agrega la sesion administrativa cuando corresponde y normaliza mensajes de error.

## Estados principales

Pedidos:

```text
PENDING_PAYMENT
CONFIRMED
IN_PRODUCTION
SHIPPED
DELIVERED
CANCELLED
```

Pagos:

```text
PENDING
AUTHORIZED
PAID
FAILED
CANCELLED
```

## Configuracion local

### Requisitos

- Node.js compatible con Vite 8
- npm
- Java 21
- PostgreSQL

### Backend

Crear `backend/.env` con los valores necesarios:

```dotenv
DATABASE_URL=jdbc:postgresql://localhost:5432/myfavoriterug
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=postgres

FRONTEND_BASE_URL=http://localhost:5173
BACKEND_BASE_URL=http://localhost:8080
FRONTEND_ALLOWED_ORIGIN_PATTERNS=

ADMIN_USERNAME=admin
ADMIN_PASSWORD=una-clave-segura

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
CLOUDINARY_PRODUCT_FOLDER=myfavoriterug/products
CLOUDINARY_REVIEW_FOLDER=myfavoriterug/reviews

FLOW_API_URL=https://sandbox.flow.cl/api
FLOW_API_KEY=
FLOW_SECRET_KEY=

RESEND_API_KEY=
```

Las imagenes usan almacenamiento local cuando Cloudinary no esta configurado. Los archivos locales se guardan bajo `backend/uploads/`.

Ejecutar el backend en Windows:

```powershell
cd backend
.\mvnw.cmd spring-boot:run
```

En macOS o Linux:

```bash
cd backend
./mvnw spring-boot:run
```

El backend queda disponible por defecto en `http://localhost:8080`.

### Frontend

Crear `frontend/.env` a partir de `frontend/.env.example`:

```dotenv
VITE_API_URL=http://localhost:8080/api
```

La URL debe apuntar al backend, comenzar con `http://` o `https://` y terminar en `/api`.

Ejecutar:

```bash
cd frontend
npm install
npm run dev
```

Vite queda disponible normalmente en `http://localhost:5173`.

## Comandos utiles

Frontend:

```bash
npm run dev
npm run build
npm run lint
npm run preview
```

Backend en Windows:

```powershell
.\mvnw.cmd spring-boot:run
.\mvnw.cmd test
.\mvnw.cmd package
```

Backend en macOS o Linux:

```bash
./mvnw spring-boot:run
./mvnw test
./mvnw package
```

## Persistencia en el navegador

- Zustand persiste la sesion del cliente en `localStorage`.
- La sesion administrativa se guarda en `sessionStorage`.
- El carrito, preferencias de idioma, categorias y cache del catalogo usan `localStorage`.
- La tienda muestra el catalogo cacheado mientras actualiza los productos desde el backend.

## Seguridad actual

- Las contraseñas de clientes se guardan con PBKDF2, salt y SHA-256.
- Las sesiones de clientes se validan mediante tokens almacenados en la base de datos.
- Los tokens de recuperacion tienen expiracion y se invalidan despues de usarse.
- Las credenciales administrativas se leen desde variables de entorno.
- CORS se configura mediante la URL y los patrones permitidos del frontend.
- Los secretos y archivos `.env` no deben subirse al repositorio.

Para produccion se recomienda usar cookies `HttpOnly` y `Secure` para sesiones, rotar secretos, restringir CORS y proteger todas las operaciones administrativas desde el backend.

## Imagenes y archivos

- Productos y reseñas admiten carga de imagenes.
- En produccion se pueden almacenar en Cloudinary.
- Sin Cloudinary, el backend sirve archivos desde las carpetas locales configuradas.
- El backend limita cada archivo a `8 MB` y cada solicitud multipart a `32 MB`.

## Pagos

- Flow crea una intencion de pago y confirma el resultado mediante callback.
- PayPal genera una intencion pendiente dentro del flujo actual.
- Transferencia bancaria crea el pedido y muestra los datos necesarios para completar el pago manualmente.
- El panel administrativo permite revisar y actualizar estados de pago.

## Pruebas y despliegue

El backend incluye pruebas para la aplicacion, autenticacion, productos y pedidos. El frontend se valida mediante TypeScript, ESLint y el build de Vite.

El backend incluye un `Dockerfile` multi-stage basado en Java 21, preparado para servicios como Render. El frontend puede desplegarse como aplicacion estatica; en produccion debe configurarse `VITE_API_URL` con la URL publica del backend.

Antes de desplegar:

1. Configurar PostgreSQL y todas las variables de entorno necesarias.
2. Cambiar las credenciales administrativas por defecto.
3. Configurar `FRONTEND_BASE_URL`, `BACKEND_BASE_URL` y CORS.
4. Configurar Cloudinary para que las imagenes sobrevivan reinicios del servidor.
5. Configurar Flow y Resend si se utilizaran pagos y recuperacion de contraseña.
