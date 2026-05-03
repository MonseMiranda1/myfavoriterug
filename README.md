# My Favorite Rug

Proyecto web para una tienda de alfombras personalizadas. La idea es que una persona pueda entrar a la pagina, ver productos, revisar el detalle de una alfombra, agregarla al carrito y avanzar al pago.

El proyecto esta separado en dos partes:

- `frontend`: la pagina que ve el usuario.
- `backend`: la API que deberia entregar los datos de productos y conectarse a la base de datos.

## Estado actual

El frontend ya tiene las pantallas principales y esta preparado para pedir productos al backend en:

```txt
http://localhost:8080/api/products
```

El backend existe como proyecto Spring Boot, pero las clases de productos todavia estan vacias. Por eso, para que la tienda muestre productos reales, falta implementar el modelo, repositorio, servicio y controlador de productos.

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
- `controller/`: deberia contener las rutas de la API. Por ejemplo, un controlador para `/api/products`.
- `model/`: deberia contener las clases que representan datos de la base de datos, como `Product`.
- `repository/`: deberia contener las clases que hablan con la base de datos.
- `service/`: deberia contener la logica del negocio antes de responder al frontend.
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

## Flujo basico de datos

1. El usuario abre el frontend.
2. La pagina `/tienda` llama a `getProducts()`.
3. `getProducts()` usa Axios para pedir datos a `http://localhost:8080/api/products`.
4. El backend deberia responder con una lista de productos.
5. React muestra esos productos en la tienda.

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

- Implementar `Product` como entidad JPA en el backend.
- Implementar `ProductRepository` usando Spring Data JPA.
- Implementar `ProductService` para obtener productos.
- Implementar `ProductController` con el endpoint `GET /api/products`.
- Revisar la configuracion de CORS si el frontend no puede comunicarse con el backend.
- Hacer que el boton "Agregar al carrito" guarde productos.
- Completar la logica real del carrito y checkout.
- Mover credenciales sensibles de `application.yaml` a variables de entorno antes de subir o compartir el proyecto.

## Nota para el equipo

Cuando agreguen una carpeta o archivo importante, actualicen este README. Asi todos pueden entender donde va cada cosa sin tener que revisar todo el codigo.
