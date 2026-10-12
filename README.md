# Sistema Gestor de Reportes - Telmex

Aplicación web para la gestión de tickets de soporte técnico. Permite a los usuarios
reportar incidencias, asigna automáticamente cada ticket al técnico con menos carga
laboral de su departamento y ofrece a los administradores un panel para supervisar
tickets, personal y problemas recurrentes.

## Características

- **Autenticación por roles** con JWT: `administrador`, `tecnico` y `usuarioNormal`.
- **Contraseñas con hash** `bcrypt` (10 rondas de sal).
- **Creación de tickets** con selección de departamento y tema.
- **Asignación automática** del técnico con menos tickets activos del departamento.
- **Historial de seguimiento** por ticket (creación, cambios de estado, respuestas, cierres).
- **Panel administrativo**: consulta de todos los tickets, filtros y detalle.
- **Gestión de personal**: alta, edición y baja de técnicos y usuarios.
- **Gestión de problemas recurrentes**: agrupa varios tickets bajo un mismo problema y los resuelve en bloque.
- **Confirmación del cliente**: cierre o reapertura del ticket según conformidad.
- **Seguridad**: `helmet`, CORS configurable, rate-limit en el login y envío de `JWT_SECRET` vía entorno.

## Stack tecnológico

| Capa        | Tecnología                                                       |
| ----------- | ---------------------------------------------------------------- |
| Frontend    | Vue 3, Vue Router 4, Bootstrap 5, Axios                          |
| Backend     | Node.js, Express, `pg` (PostgreSQL), JWT, bcrypt, helmet, morgan |
| Base datos  | PostgreSQL                                                       |

## Estructura del proyecto

```
telmex-tickets/
├── backend/                 # API REST en Express
│   ├── server.js            # Punto de entrada
│   ├── src/
│   │   ├── app.js           # Configuración de middleware y rutas
│   │   ├── config/db.js     # Pool de PostgreSQL
│   │   ├── controllers/     # Lógica de negocio por recurso
│   │   ├── middleware/      # auth (JWT + roles), errorHandler
│   │   ├── routes/          # Definición de rutas REST
│   │   └── utils/           # asyncHandler, AppError
│   ├── scripts/seed-users.js# Usuarios de prueba con hash bcrypt
│   ├── package.json
│   └── .env.example         # Variables de entorno de ejemplo
├── frontend/                # SPA con Vue 3
│   ├── public/
│   └── src/
│       ├── components/      # Navbar
│       ├── router/          # Rutas con guardas por rol
│       ├── services/        # api.js (axios) y auth.js (sesión)
│       └── views/           # Pantallas de la aplicación
├── database/
│   └── schema.sql           # Esquema + función + datos base (departamentos/temas)
└── README.md
```

## Requisitos

- Node.js 16 o superior
- PostgreSQL 12 o superior
- npm

## Puesta en marcha

### 1. Base de datos

Crea la base de datos y carga el esquema (tablas, función y datos de
departamentos/temas):

```bash
psql -U postgres -c "CREATE DATABASE telmex;"
psql -U postgres -d telmex -f database/schema.sql
```

### 2. Backend

```bash
cd backend
npm install
copy .env.example .env      # Windows
# cp .env.example .env      # Linux / macOS
npm run seed                # crea los usuarios de prueba (con hash)
npm start
```

El servidor queda escuchando en `http://localhost:3000`.

Variables de entorno soportadas (`backend/.env`):

| Variable      | Descripción                     | Por defecto         |
| ------------- | ------------------------------- | ------------------- |
| `PORT`        | Puerto del servidor API         | `3000`              |
| `NODE_ENV`    | Entorno                         | `development`       |
| `DB_USER`     | Usuario de PostgreSQL           | `postgres`          |
| `DB_HOST`     | Host de PostgreSQL              | `localhost`         |
| `DB_NAME`     | Nombre de la base de datos      | `telmex`            |
| `DB_PASSWORD` | Contraseña                      | `1234`              |
| `DB_PORT`     | Puerto de PostgreSQL            | `5432`              |
| `JWT_SECRET`  | Secreto para firmar los tokens  | *(sin valor)*       |
| `JWT_EXPIRES` | Expiración del token            | `8h`                |
| `CORS_ORIGIN` | Orígenes permitidos (separados por coma) | `http://localhost:8080,http://127.0.0.1:8080` |

> `JWT_SECRET` no tiene valor por defecto: si no se define, el servidor usa una
> advertencia y un secreto aleatorio por proceso (los tokens no sobreviven a un
> reinicio). En producción define siempre `JWT_SECRET`.

### 3. Frontend

```bash
cd frontend
npm install
copy .env.example .env      # opcional: URL de la API en VUE_APP_API_URL
npm run serve
```

La aplicación queda disponible en `http://localhost:8080`.

> El frontend consume la API en `http://localhost:3000` por defecto. Para cambiarlo,
> define `VUE_APP_API_URL` en `frontend/.env` y reconstruye.

## Credenciales de prueba

| Rol            | Usuario                | Contraseña        |
| -------------- | ---------------------- | ----------------- |
| Administrador  | `admin`                | `admin123`        |
| Técnico        | `tecnico_cambios`      | `cambio123`       |
| Técnico        | `tecnico_problemas`    | `problemas123`    |
| Usuario normal | `usuario1`             | `usuario123`      |
| Usuario normal | `usuario2`             | `usuario456`      |
| Usuario normal | `usuario3`             | `usuario789`      |

Los técnicos de cada departamento siguen el patrón `tecnico_<area>` con contraseña
`<area>123` (ej. `tecnico_redes` / `redes123`). Al ejecutar `npm run seed`, las
contraseñas se guardan con `bcrypt` y el script es idempotente (no duplica usuarios).

## Roles y flujo

1. **Usuario normal**: crea tickets y hace seguimiento desde "Crear Ticket".
   Cuando un técnico marca el ticket como `resuelto`, el usuario confirma (cierra) o reabre.
2. **Técnico**: atiende sus tickets asignados, actualiza estado/prioridad y responde.
   El técnico del departamento *Problemas* gestiona los problemas recurrentes.
3. **Administrador**: supervisa todos los tickets, gestiona el personal y las configuraciones.

La sesión se guarda en `localStorage` (`token` y `usuario`). El interceptor de
axios añade `Authorization: Bearer <token>` a cada petición y, ante un `401`,
limpia la sesión y redirige al login.

Estados de un ticket: `abierto` → `en proceso` → `resuelto` → `cerrado`.

## Endpoints de la API

Todas las rutas bajo `/api` requieren `Authorization: Bearer <token>` salvo el login.

### Autenticación

| Método | Ruta              | Rol      | Descripción                    |
| ------ | ----------------- | -------- | ------------------------------ |
| POST   | `/api/auth/login` | Público  | Inicio de sesión → `{token, usuario}` |
| GET    | `/api/auth/me`    | Cualquier autenticado | Datos del usuario actual |

### Catálogos

| Método | Ruta                            | Rol         | Descripción                          |
| ------ | ------------------------------- | ----------- | ------------------------------------ |
| GET    | `/api/departamentos`            | Cualquiera  | Departamentos (excluye "Problemas")  |
| GET    | `/api/departamentos/:id/temas`  | Cualquiera  | Temas de un departamento             |
| GET    | `/api/admin/departamentos`      | Administrador | Todos los departamentos            |

### Tickets

| Método | Ruta                          | Rol          | Descripción                              |
| ------ | ----------------------------- | ------------ | ---------------------------------------- |
| POST   | `/api/tickets`                | usuarioNormal | Crear ticket; el técnico se asigna solo |
| GET    | `/api/tickets/mios`           | usuarioNormal | Tickets creados por el usuario           |
| GET    | `/api/tickets/asignados`      | tecnico      | Tickets asignados al técnico del token   |
| GET    | `/api/tickets/:id`            | Dueño/técnico/admin | Detalle `{ticket, historial, tecnico}` |
| GET    | `/api/tickets/:id/historial`  | Dueño/técnico/admin | Historial del ticket                 |
| PUT    | `/api/tickets/:id`            | técnico/admin | Actualizar estado y prioridad           |
| POST   | `/api/tickets/:id/responder`  | técnico/admin | Agregar respuesta al historial          |
| POST   | `/api/tickets/:id/cerrar`     | usuarioNormal (dueño) | Confirmar solución y cerrar       |
| POST   | `/api/tickets/:id/reabrir`    | usuarioNormal (dueño) | Reabrir con `{motivo}`             |

### Administración

| Método | Ruta                              | Rol          | Descripción                      |
| ------ | --------------------------------- | ------------ | -------------------------------- |
| GET    | `/api/admin/tickets`              | Administrador | Todos los tickets con `usuario`, `tecnico`, `departamento`, `tema` |
| GET    | `/api/admin/tickets/:id`          | Administrador | Detalle de un ticket            |
| GET    | `/api/admin/tickets/:id/historial`| Administrador | Historial de un ticket          |

### Usuarios (personal)

| Método | Ruta               | Rol          | Descripción                      |
| ------ | ------------------ | ------------ | -------------------------------- |
| GET    | `/api/usuarios`    | Administrador | Listar usuarios (sin administradores) |
| POST   | `/api/usuarios`    | Administrador | Crear usuario (`{username, password, nombre, tipo, departamento_id}`) |
| PUT    | `/api/usuarios/:id`| Administrador | Actualizar usuario              |
| DELETE | `/api/usuarios/:id`| Administrador | Eliminar usuario                |

### Problemas recurrentes

| Método | Ruta                          | Rol    | Descripción                              |
| ------ | ----------------------------- | ------ | ---------------------------------------- |
| POST   | `/api/problemas`              | tecnico | Crear problema y vincular tickets `{titulo, descripcion, ticketsRelacionados}` |
| GET    | `/api/problemas`              | tecnico | Listar problemas                        |
| GET    | `/api/problemas/:id`          | tecnico | Detalle del problema con sus tickets    |
| POST   | `/api/problemas/:id/resolver` | tecnico | Resolver problema `{solucion}`; cierra sus tickets en bloque |

## Guardas de rutas (frontend)

| Ruta                     | Rol requerido  |
| ------------------------ | -------------- |
| `/crear-ticket`          | `usuarioNormal` |
| `/detalle-ticket-cliente/:id` | `usuarioNormal` |
| `/tickets-asignados`     | `tecnico`       |
| `/detalles-ticket/:id`   | `tecnico`       |
| `/problemas`             | `tecnico`       |
| `/ver-tickets`           | `administrador` |
| `/personal`              | `administrador` |
| `/configuraciones`       | `administrador` |