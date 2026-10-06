# Task System — Architecture

## 1. Visión general de la arquitectura

El sistema es una aplicación web de gestión de tareas compuesta por un
frontend y un backend dentro del mismo repositorio.

- **Frontend:** aplicación web React + TypeScript.
- **Backend:** API REST construida con Node.js + Express + TypeScript.
- **Persistencia:** PostgreSQL, abstraída mediante un patrón Repository.
- **Tests:** Vitest para lógica de negocio y Supertest para tests de API.

El frontend se comunica exclusivamente con el backend mediante una API
REST. El backend es responsable de la lógica de negocio y del acceso a
datos. La persistencia está abstraída de modo que la lógica de negocio
no dependa directamente de PostgreSQL.

El esquema general es:

```
Frontend (React)
      │
      │ HTTP JSON (REST)
      ▼
Backend (Express)
      │
      ├── Routes
      ├── Controllers
      ├── Services (lógica de negocio)
      └── Repositories (acceso a datos)
             │
             ▼
        PostgreSQL
```

---

## 2. Responsabilidades del frontend

- Renderizar el dashboard principal (tarjetas de tareas raíz
  horizontales y subtareas verticales).
- Permitir crear, ver, editar y eliminar tareas.
- Mostrar el detalle de una tarea con sus subtareas.
- Diferenciar visualmente prioridades y estados.
- Comunicarse con el backend únicamente a través de la API REST.

El frontend no contiene lógica de negocio: solo presenta datos y
traduce las acciones del usuario en llamadas HTTP.

---

## 3. Responsabilidades del backend

- Exponer una API REST CRUD para tareas.
- Aplicar validación de datos (título obligatorio y no solo espacios,
  estimación no negativa, etc.).
- Implementar la lógica de negocio: jerarquía de subtareas, orden,
  eliminación en cascada y cálculos de estimaciones.
- Orquestar las operaciones de persistencia a través de repositorios.
- No depender directamente de la implementación concreta de
  PostgreSQL.

---

## 4. Responsabilidades del paquete compartido

`packages/shared` es un workspace npm que centraliza los tipos del
dominio y las validaciones puras usadas por backend y frontend, para
evitar duplicación entre ambas capas.

- Define los enums del dominio (`TaskStatus`, `TaskPriority`,
  `TaskKind`), la base de `Task`, los inputs de la API
  (`CreateTaskInput`, `UpdateTaskInput`) y los tipos auxiliares
  (`EffortSummary`, `SubtreeStats`, `ApiErrorPayload`).
- Expone las validaciones puras: título obligatorio, estimación
  numérica no negativa, pertenencia a enums, y los validadores de
  formulario del frontend.
- No depende de Express, React, ni de la persistencia: es código puro
  compilado a `dist/` y consumido por ambos proyectos vía su `exports`.

El backend define su `Task` con timestamps `Date`; el frontend usa
`Task` con timestamps `string` (formato JSON). Ambos extienden la
`TaskBase` compartida.

---

## 5. Responsabilidades de la capa de repositorio/persistencia

- Encapsular el acceso a los datos.
- Proveer una interfaz uniforme para las operaciones CRUD de tareas.
- Permitir implementaciones intercambiables (en memoria durante las
  primeras etapas y PostgreSQL posteriormente) sin modificar la lógica
  de negocio.
- Centralizar las consultas relacionadas con la jerarquía de tareas.

---

## 6. Flujo de una operación

Descripción de una operación de ejemplo (crear una tarea):

1. El usuario completa el formulario en el frontend.
2. El frontend valida los datos con las funciones de `packages/shared`.
3. El frontend envía una petición `POST /tasks` con los datos en JSON.
4. La ruta correspondiente enruta la petición hacia el controller.
5. El controller extrae y valida la estructura básica de la petición.
6. El controller delega en el service, que aplica la lógica de negocio
   (validaciones compartidas, valores iniciales, cálculo de `position`,
   etc.).
7. El service llama al repository, que persiste la tarea.
8. El repository devuelve la tarea persistida (con `id`, `createdAt`,
   `updatedAt`).
9. El service retorna el resultado al controller.
10. El controller responde con la representación JSON de la tarea.
11. El frontend recibe la respuesta y actualiza la interfaz.

De manera análoga fluyen las operaciones de lectura, actualización y
eliminación. En todos los casos la comunicación entre frontend y
backend es exclusivamente HTTP JSON.

---

## 7. Estructura de carpetas

### Raíz

```
packages/shared/  # tipos del dominio y validaciones compartidas
backend/          # API REST (Express + TypeScript)
frontend/         # aplicación web (React + TypeScript + Tailwind)
docs/             # documentación
```

### Backend

```
backend/
  src/
    controllers/   # manejo de peticiones HTTP y respuestas
    routes/        # definición de rutas de la API
    services/      # lógica de negocio
    repositories/  # acceso a datos (interfaz + implementaciones)
    models/        # entidades del dominio
    types/         # tipos TypeScript compartidos
    utils/         # utilidades y helpers
    app.ts         # configuración de la aplicación Express
    server.ts      # arranque del servidor
```

### Frontend

```
frontend/
  src/
    components/    # componentes de UI reutilizables
    pages/         # páginas/vistas principales (dashboard, detalle)
    services/      # cliente HTTP para consumir la API REST
    hooks/         # hooks de React reutilizables
    types/         # tipos TypeScript compartidos
    utils/         # utilidades y helpers
    App.tsx        # componente raíz
    main.tsx       # punto de entrada
```

---

## 8. Separación de responsabilidades

La separación entre capas sigue un flujo descendente:

- **Routes:** definen los endpoints HTTP y los asocian a los métodos
  de los controllers.
- **Controllers:** reciben las peticiones HTTP, validan la estructura
  básica de entrada, invocan los métodos de los services y construyen
  las respuestas HTTP.
- **Services:** contienen la lógica de negocio (validaciones, reglas
  de jerarquía, cálculo de estimaciones, eliminación en cascada).
  No conocen detalles de Express ni de PostgreSQL.
- **Repositories:** abstraen el acceso a datos detrás de una interfaz.
  La lógica de negocio depende solo de esa interfaz.

Esta división garantiza que cada capa tenga una única responsabilidad
y que los cambios en una capa no se propaguen a las demás.

---

## 9. Jerarquía de tareas y subtareas

La jerarquía se representa con el campo `parentTaskId`:

- Una tarea raíz tiene `parentTaskId = null`.
- Una subtarea referencia a su tarea padre mediante `parentTaskId`.
- No se crean endpoints separados para subtareas: se utilizan los
  mismos endpoints de tareas.

El orden dentro de cada nivel jerárquico se maneja con el campo
`position`.

Las operaciones que requieren conocer la jerarquía completa (calcular
estimaciones, eliminar en cascada, construir el árbol para la vista) se
resuelven en la capa de servicios a partir de los datos provistos por
los repositorios.

---

## 10. Independencia entre lógica de negocio y PostgreSQL

La separación se logra mediante el patrón Repository:

- Se define una interfaz de repositorio (por ejemplo, `TaskRepository`)
  con las operaciones que la lógica de negocio necesita.
- Se implementa una versión en memoria para las primeras etapas de
  desarrollo y los tests.
- Posteriormente se implementa una versión sobre PostgreSQL que cumpla
  la misma interfaz.

Los services dependen de la interfaz, nunca de la implementación
concreta. Esto permite evolucionar desde la implementación en memoria
hacia PostgreSQL sin modificar la lógica de negocio.

---

## 11. Organización de los tests

- **Tests unitarios de lógica de negocio (Vitest):** cubren las reglas
  de los services: validación de tareas, estimaciones, jerarquía,
  cálculo recursivo de estimaciones, eliminación de descendientes,
  estados y prioridades.
- **Tests de API (Vitest + Supertest):** cubren los flujos principales
  de los endpoints REST contra la aplicación Express, usando
  preferiblemente el repositorio en memoria.

Los tests se agrupan a nivel de módulo o capa dentro de cada proyecto
(backend/frontend) según corresponda.

---

## 12. Docker Compose

`docker compose up` levanta tres servicios con una red interna:

- **backend:** API REST en Node.js (build desde la raíz con
  `backend/Dockerfile`), puerto `3000`, conectado a PostgreSQL.
- **frontend:** build de Vite servido por nginx (`frontend/Dockerfile`),
  puerto `8080`.
- **postgres:** base de datos PostgreSQL 16 con volumen persistente y
  healthcheck; el esquema (`backend/db/schema.sql`) se aplica al primer
  arranque.

Las variables de PostgreSQL se configuran en un `.env` en la raíz
(`POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`).

---

A diferencia de las decisiones pendientes de las primeras etapas, el
esquema de datos, el contrato API, el orden por `position` y el build
con Vite ya están definidos e implementados según documentan este
archivo, `docs/requirements.md` y el README.