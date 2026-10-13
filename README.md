# Task System

[![CI](https://github.com/1LuciaLemes/lucia-taskflow/actions/workflows/ci.yml/badge.svg)](https://github.com/1LuciaLemes/lucia-taskflow/actions/workflows/ci.yml)

Aplicación web para gestionar el trabajo de un equipo de desarrollo:
organiza tareas en un tablero con subtareas anidadas de múltiples
niveles, arrastra y suelta para reordenar, filtra, buscá de forma
global y seguí el avance con progreso ponderado y resumen de esfuerzo.

Construida como monorepo con npm workspaces: una API REST en el
backend y una aplicación React en el frontend, con persistencia en
memoria (por defecto) o en PostgreSQL.

## Capturas

### Desktop

![Vista desktop](assets/capturas/desktop.png)

### Mobile

![Vista mobile](assets/capturas/mobile_completo.png)

## Funcionalidades

- **Jerarquía de tareas**: tareas principales con subtareas anidadas
  en tantos niveles como haga falta.
- **Tablero con drag & drop**: reordenar tareas y mover subtareas
  entre padres arrastrándolas, con indicadores visuales de destino.
- **Estados y prioridades**: estados `PENDING`, `IN_PROGRESS` y
  `COMPLETE`; prioridades `LOW`, `MEDIUM` y `HIGH` con badge visual.
- **Estimación de esfuerzo**: horas estimadas por tarea, con resumen
  total pendiente, en curso y completado.
- **Progreso ponderado**: barra de progreso que considera el árbol
  completo de subtareas (no solo las tareas raíz).
- **Búsqueda global**: buscador que encuentra tareas en cualquier
  nivel de la jerarquía y resalta las coincidencias.
- **Filtros y paginación**: orden, prioridad y paginado de a 6 por
  página en el tablero.
- **Diseño responsive**: layout adaptado a desktop y mobile.
- **Persistencia configurable**: repositorio en memoria sin
  configuración, o PostgreSQL definiendo `DATABASE_URL`.

## Stack tecnológico

| Capa      | Tecnologías |
| --------- | ----------- |
| Backend   | Node.js, Express, TypeScript |
| Frontend  | React, TypeScript, Vite, Tailwind CSS |
| Base de datos | PostgreSQL (opcional) |
| Tests     | Vitest, Supertest |
| Lint      | ESLint (flat config) |
| Deploy    | Docker Compose |

## Arquitectura

```
frontend (React)  →  API REST  →  routes → controllers → services → repositories
                                                             │
                                              ┌──────────────┴──────────────┐
                                              │                             │
                                     InMemoryTaskRepository         PgTaskRepository
                                                                    (DATABASE_URL)
```

- **Monorepo con npm workspaces**: `packages/shared/`, `backend/`,
  `frontend/` y `docs/` conviven en el mismo repositorio.
- **Tipos y validaciones compartidas**: `packages/shared` centraliza los
  enums, inputs y funciones de validación que usan tanto el backend como
  el frontend (una única fuente de verdad).
- **Separación de capas en el backend**: las rutas derivan en
  controllers (HTTP), services (lógica de negocio y validación) y
  repositories (persistencia). La persistencia se elige en tiempo de
  arranque según `DATABASE_URL`.
- **El frontend se comunica exclusivamente con la API REST**; en
  desarrollo usa un proxy (`/tasks` → `http://localhost:3000`).

### Estructura de código

```
packages/shared/
  src/
    task.ts        # enums, TaskBase, inputs y tipos auxiliares del dominio
    validation.ts  # validaciones puras (título, estimación, enums)
    index.ts       # exports públicos
```

```
backend/
  src/
    controllers/   # manejo de peticiones HTTP y respuestas
    routes/        # definición de rutas de la API
    services/      # lógica de negocio (jerarquía, orden, estimaciones)
    repositories/  # acceso a datos (interfaz + en memoria + PostgreSQL)
    models/        # entidades del dominio
    types/         # tipos TypeScript compartidos
    db/            # pool de conexión a PostgreSQL
    utils/         # utilidades y helpers
    app.ts         # configuración de la aplicación Express
    server.ts      # arranque del servidor
  db/
    schema.sql     # esquema de la base de datos (auto-aplicado en Docker)
```

```
frontend/
  src/
    components/    # componentes de UI reutilizables
    pages/         # vistas principales (dashboard)
    services/      # cliente HTTP para consumir la API REST
    hooks/         # hooks de React reutilizables
    state/         # estado global (drag & drop)
    types/         # tipos TypeScript compartidos
    utils/         # utilidades y helpers
    App.tsx        # componente raíz
    main.tsx       # punto de entrada
```

## Cómo probar la app

### Con Docker (recomendado)

Único requisito: [Docker](https://docs.docker.com/get-docker/) con
Docker Compose.

```bash
git clone https://github.com/1LuciaLemes/lucia-taskflow.git
cd lucia-taskflow
docker compose up
```

Levanta los tres servicios:

| Servicio | Descripción                    | URL                  |
| -------- | ------------------------------ | -------------------- |
| frontend | Aplicación web (nginx)         | http://localhost:8080 |
| backend  | API REST                       | http://localhost:3000 |
| postgres | Base de datos PostgreSQL       | localhost:5432       |

Abrí http://localhost:8080 y ya podés usar la app. El esquema de la
base de datos se crea automáticamente la primera vez
(`backend/db/schema.sql`).

### Sin Docker (desarrollo local)

Requisitos: Node.js 20 o superior.

```bash
npm install
```

Se necesitan dos terminales en la raíz del proyecto:

```bash
# Terminal 1: backend en http://localhost:3000
npm run dev -w task-system-backend

# Terminal 2: frontend en http://localhost:5173
npm run dev -w task-system-frontend
```

Por defecto el backend guarda en memoria (los datos se pierden al
reiniciar). Para usar PostgreSQL, levantá solo la base con Docker y
definí `DATABASE_URL`:

```bash
docker compose up -d postgres

# Linux/macOS
DATABASE_URL=postgres://task:task@localhost:5432/tasks npm run dev -w task-system-backend

# Windows PowerShell
$env:DATABASE_URL="postgres://task:task@localhost:5432/tasks"; npm run dev -w task-system-backend
```

Opcionalmente definí `PGSSL=true` si la conexión lo requiere. Para
detener la base: `docker compose stop postgres` (conserva los datos)
o `docker compose down -v` (borra el volumen).

### Variables de entorno

Configurables mediante un archivo `.env` en la raíz (ver
`.env.example`):

| Variable            | Predeterminado | Descripción            |
| ------------------- | -------------- | ---------------------- |
| `POSTGRES_USER`     | `task`         | Usuario de PostgreSQL   |
| `POSTGRES_PASSWORD` | `task`         | Contraseña de PostgreSQL|
| `POSTGRES_DB`       | `tasks`        | Base de datos           |
| `DATABASE_URL`      | —              | URL de conexión (activa PostgreSQL) |
| `PGSSL`             | `false`        | SSL para la conexión    |
| `PORT`              | `3000`         | Puerto del backend      |
| `CORS_ORIGIN`       | —              | Orígenes permitidos (lista separada por comas) |
| `DEMO_API_KEY`      | —              | Si está definida, protege las escrituras de la demo |
| `VITE_API_URL`      | —              | URL del backend que consume el frontend (build) |
| `VITE_DEMO_MODE`    | `false`        | Muestra el cartel de demo en el frontend |

## Deploy

La demo pública se despliega en dos servicios gratuitos, **sin base de
datos**:

| Parte      | Plataforma | Detalle                                            |
| ---------- | ---------- | -------------------------------------------------- |
| Frontend   | Vercel     | raíz del proyecto: `frontend/`                     |
| Backend    | Render     | raíz del repositorio (necesita `packages/shared`)  |

El backend corre **sin `DATABASE_URL`**, por lo que usa la persistencia
en memoria: la demo es totalmente usable (crear, editar, borrar), pero
los datos **se reinician solos** cuando el servicio vuelve a arrancar.
Es intencional: nada se guarda de forma permanente hasta que exista
autenticación.

Backend en Render:

- **Build**: `npm ci && npm run build -w @task-system/shared && npm run build -w task-system-backend`
- **Start**: `npm run start -w task-system-backend`
- **Variables**: `CORS_ORIGIN` (URL del frontend). Opcional:
  `DEMO_API_KEY` para exigir el header `x-api-key` en las escrituras.

Frontend en Vercel:

- **Root directory**: `frontend`
- **Variables de build**: `VITE_API_URL` (URL del backend) y
  `VITE_DEMO_MODE=true` para mostrar el cartel de demo.

### Con persistencia (PostgreSQL)

Para guardar de verdad, definí `DATABASE_URL` (por ejemplo con
[Neon](https://neon.tech)) y `PGSSL=true` en el backend. La tabla
`tasks` se crea con `backend/db/schema.sql`. Con `DEMO_API_KEY`
definida, el backend deja pasar las lecturas pero exige el header
`x-api-key` para crear, editar o borrar.

## Comandos

Desde la raíz del proyecto:

| Comando          | Descripción                             |
| ---------------- | --------------------------------------- |
| `npm run dev -w task-system-backend`  | Backend en desarrollo (watch)  |
| `npm run dev -w task-system-frontend` | Frontend en desarrollo (Vite)  |
| `npm run build`   | Compila shared, backend y frontend      |
| `npm test`        | Ejecuta los tests de backend y frontend |
| `npm run lint`    | Analiza el código con ESLint            |
| `docker compose up` | Levanta todo en contenedores          |

## Tests

```bash
npm test
```

- **Backend**: lógica de negocio (services) y API end-to-end con
  Supertest.
- **Frontend**: cliente HTTP, utilidades de árbol, búsqueda,
  validación y formato.

## Documentación

- [`docs/requirements.md`](docs/requirements.md) — requisitos funcionales y técnicos.
- [`docs/architecture.md`](docs/architecture.md) — arquitectura del sistema.
- [`docs/ai-usage.md`](docs/ai-usage.md) — registro del uso de herramientas de IA.
