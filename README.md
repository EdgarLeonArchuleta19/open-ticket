<div align="center">

# 🎫 OpenTicket

### Sistema Empresarial de Gestión de Incidencias, Tickets & Mesa de Ayuda (Helpdesk)

[![Vue.js](https://img.shields.io/badge/Vue.js-3.x-4FC08D?style=for-the-badge&logo=vuedotjs&logoColor=white)](https://vuejs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.x-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14+-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![License: Non-Commercial](https://img.shields.io/badge/License-Non--Commercial-emerald?style=for-the-badge)](./LICENSE)

<br/>

**OpenTicket** es una plataforma web completa de grado empresarial diseñada para la administración, canalización, seguimiento y resolución de tickets técnicos, incidencias operativas y soporte interdepartamental.

Desarrollada con una arquitectura limpia, **estética SaaS sobria (blanco dominante / modo oscuro profundo con acentos en verde esmeralda institucional `#047857`)**, control estricto de concurrencia y roles de usuario basados en RBAC.

[Características](#-características-principales) •
[Arquitectura](#-arquitectura-y-seguridad) •
[Puesta en Marcha](#-instalación-y-puesta-en-marcha) •
[Catálogos y Estados](#-catálogos-y-ciclo-de-vida) •
[Licencia](#-licencia)

</div>

---

## 🌟 Características Principales

### 🎨 Experiencia de Usuario & Diseño SaaS
* **Soporte Nativo de Modo Claro / Oscuro:** Interfaz predominantemente blanca por defecto con alternancia fluida a modo oscuro (zinc-900 / negro puro) persistente en `localStorage`.
* **Acentos en Verde Corporativo Sobrio:** Paleta de colores cuidada con tonalidades verdes profesionales (`#047857` / `#059669`), evitando estridencias o degradados innecesarios.
* **Navegación Superior Elevada:** Barra de control con pestañas activas destacadas, alertas de notificaciones en vivo y accesos directos por rol.
* **Componentes de Retroalimentación Global:** Notificaciones flotantes tipo *Toast* y modales de confirmación interactivos para cada acción sensible (cierre de tickets, desactivación de cuentas y eliminación de registros).
* **Paginación Inteligente con Soporte Dark Mode:** Barra de paginación reactiva con selector de elementos (5, 10, 25, 50 registros) y adaptabilidad completa para pantallas móviles y escritorios.

---

### 🛡️ Concurrencia y Seguridad Robusta
* **Generación Atómica de Folios:** Cada ticket recibe un folio único e incremental (`TKT-000001`, `TKT-000002`...) alimentado por secuencias atómicas en PostgreSQL, garantizando cero colisiones ante cargas masivas.
* **Control de Concurrencia Optimista (Detección de *Lost Updates*):** Si dos especialistas visualizan el mismo ticket y uno aplica un cambio, el sistema detecta el desfase de versión mediante `expected_updated_at` y responde con `HTTP 409 Conflict`, protegiendo la información y recargando la pantalla automáticamente.
* **Bloqueo Pesimista por Fila (`SELECT ... FOR UPDATE`):** Transacciones ACID serializadas para cambios de estado, asignación, notas y cierre de tickets.
* **Revocación de Sesión en Tiempo Real:** El middleware de autenticación valida activamente el estado del usuario (`is_active`). Si un administrador desactiva a un empleado, su token JWT queda revocado de inmediato en la siguiente petición.
* **Protección contra Fuerza Bruta y Abuso de API:** Doble capa de limitación con `express-rate-limit` (30 intentos en login y 600 solicitudes por ventana de 15 min en toda la API).
* **Notas Internas Confidenciales:** Los agentes y administradores pueden dejar notas privadas que quedan excluidas a nivel de base de datos para solicitantes.

---

### 📊 Dashboard Analítico y Métricas en Tiempo Real
* **Indicadores Clave:** Total de tickets, pendientes, resueltos hoy y tiempo de resolución promedio calculados directamente desde PostgreSQL.
* **Gráficas Vectoriales Integradas (Sin dependencias pesadas):**
  * **Gráfica de Dona:** Distribución porcentual por estado operativo.
  * **Gráfica de Área / Línea de 7 Días:** Tendencia de tickets creados vs resueltos día por día mediante series temporales (`generate_series`).
  * **Gráfica de Barras:** Carga de trabajo distribuida por departamento destino.
* **Línea de Tiempo Reciente:** Registro cronológico de actividades y eventos relevantes.

---

## 🏗️ Arquitectura y Tecnologías

```
┌────────────────────────────────────────────────────────┐
│              OpenTicket Single-Port Host               │
│                    (Puerto 3000)                       │
├────────────────────────────┬───────────────────────────┤
│    Frontend SPA (Vue 3)    │      API REST Express     │
│   • Tailwind CSS (CDN)     │   • Controladores y Rutas │
│   • Vue Router & Reactive  │   • Middlewares JWT & RBAC│
│   • Toast & Confirm Stack  │   • Rate Limit & Helmet   │
├────────────────────────────┴───────────────────────────┤
│            PostgreSQL Relational Database              │
│    • Transacciones ACID con Bloqueo de Fila            │
│    • Secuencia Nativa ticket_folio_seq                │
│    • Integridad Referencial y Auditoría               │
└────────────────────────────────────────────────────────┘
```

| Capa | Tecnologías | Descripción |
| :--- | :--- | :--- |
| **Frontend** | Vue 3, Vue Router 4, Tailwind CSS, SVG Icons | Interfaz responsiva, temas claro/oscuro y componentes modulares. |
| **Backend** | Node.js, Express, `pg` (node-postgres), JWT, bcryptjs | API RESTful con validaciones estrictas y arquitectura desacoplada. |
| **Base de Datos** | PostgreSQL 14+ | Esquema relacional normalizado con índices de alto rendimiento. |
| **Seguridad** | Helmet, CORS Whitelist, Express-Rate-Limit, JWT | Protección contra ataques web comunes y revocación inmediata. |

---

## 🚀 Instalación y Puesta en Marcha

### Prerrequisitos
* **Node.js** v18 o superior.
* **PostgreSQL** v14 o superior instalado y corriendo en el puerto 5432.
* **npm** o **yarn**.

---

### 1. Configuración de la Base de Datos

En tu cliente de PostgreSQL (`psql` o pgAdmin), crea la base de datos:

```sql
CREATE DATABASE open_ticket;
```

Aplica el esquema relacional con datos estructurados:

```bash
psql -U postgres -d open_ticket -f database/schema.sql
```

---

### 2. Configurar Variables de Entorno

En la carpeta `backend`, copia el archivo de ejemplo o edita `.env`:

```env
PORT=3000
NODE_ENV=development

DB_USER=postgres
DB_HOST=localhost
DB_NAME=open_ticket
DB_PASSWORD=tu_password_aqui
DB_PORT=5432

JWT_SECRET=tu_clave_secreta_jwt_muy_segura_2026
JWT_EXPIRES=8h

CORS_ORIGIN=http://localhost:8080,http://127.0.0.1:8080,http://localhost:3000,http://127.0.0.1:3000
```

---

### 3. Instalar Dependencias y Sembrar Datos

```bash
# 1. Dependencias del backend
cd backend
npm install

# 2. Poblar datos iniciales (usuarios, departamentos, causas y tickets demo)
npm run seed

# 3. Compilar el frontend para producción
cd ../frontend
npm install
npm run build
```

---

### 4. Iniciar el Servidor Unificado

```bash
cd ../backend
npm start
```

Abre tu navegador en:
👉 **[http://localhost:3000](http://localhost:3000)**

---

## 👥 Cuentas de Acceso Preconfiguradas

Tras ejecutar `npm run seed`, las siguientes cuentas están listas para iniciar sesión:

| Usuario | Contraseña | Rol | Alcance en el Sistema |
| :--- | :--- | :--- | :--- |
| **`admin`** | `admin123` | **Administrador** | Acceso global total, KPIs, gestión de usuarios, catálogos y reasignaciones. |
| **`agente.ti`** | `agente123` | **Agente** | Mesa de soporte técnico de Sistemas/TI. Diagnóstico y notas internas. |
| **`agente.redes`** | `agente123` | **Agente** | Especialista de infraestructura de telecomunicaciones y switches. |
| **`solicitante1`** | `solicita123` | **Solicitante** | Portal de usuario para crear tickets y dar seguimiento a sus incidencias. |

---

## 🔄 Catálogos y Ciclo de Vida del Ticket

```
[Nuevo Requerimiento]
         │
         ▼
     [ Nuevo ] ──────► [ Abierto ] ──────► [ En Proceso ]
                             ▲                    │
                             │                    ▼
                             └──────────── [ En Espera ]
                                                  │
                                                  ▼
[ Ticket Cerrado ] ◄─── Confirmación ─── [ Resuelto ]
         │
         └───► [ Reabierto ] (si la solución no fue satisfactoria)
```

1. **Departamentos:** Áreas operativas con código único y responsable asignado.
2. **Categorías y Causas:** Clasificación en 2 niveles donde cada causa define la **prioridad predeterminada** que el sistema asigna de forma automática al ticket.
3. **Control de Estados:** Transiciones guiadas que impiden dobles resoluciones o cierres accidentales.

---

## 📄 Licencia

Este proyecto está protegido bajo una **Licencia de Uso No Comercial**.

Consulta el archivo [LICENSE](./LICENSE) para conocer los términos completos. Se permite el uso, estudio, modificación y ejecución del software exclusivamente para **fines personales, educativos, académicos y de evaluación sin fines de lucro**. Queda estrictamente prohibida su comercialización, reventa o explotación en servicios lucrativos sin autorización por escrito del autor.

---

<div align="center">
  <sub>Desarrollado y mantenido con dedicación por <b>Edgar León Archuleta</b>.</sub><br/>
  <sub>© 2026 OpenTicket. Todos los derechos reservados.</sub>
</div>
