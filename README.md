# Sistema académico · ASP.NET Core 8 + Angular 20

Trabajo práctico final con API REST, Entity Framework Core Code First, SQL Server, JWT con autorización por roles, frontend Angular y Angular Material.

## Funcionalidades

- Registro e inicio de sesión con JWT.
- Roles `Administrador`, `Profesor` y `Alumno`.
- CRUD de alumnos y materias con permisos por rol.
- Administración de usuarios y roles.
- Paginación y filtrado ejecutados en el servidor.
- Validaciones de entrada y reglas de negocio.
- Respuestas de error globales, estructuradas y con `traceId`.
- Middleware propio de medición de tiempo (`X-Response-Time-Ms`).
- Migraciones Code First y SQL Server en Docker.
- Interfaz responsive construida con Angular Material.

## Clean Architecture

```text
CLASE_ORM (API / Presentation)
├── Controllers
├── Middleware
├── Configuration
├── Application
│   ├── Common
│   ├── DTO
│   ├── Exceptions
│   └── Interfaces
├── Domain
│   └── Entities
└── Infrastructure
    ├── Persistence
    └── Services
```

Dirección de dependencias:

```text
API ───────────────► Application ◄──────── Infrastructure
 │                         │                       │
 └────────────────────────►Domain◄─────────────────┘
```

- `Domain`: entidades y reglas centrales, sin dependencias externas.
- `Application`: contratos, DTO, paginación y excepciones de negocio.
- `Infrastructure`: Entity Framework Core y servicios que implementan los contratos.
- `API`: HTTP, autenticación, autorización, Swagger, middleware e inyección de dependencias.

## Matriz de permisos

| Operación | Administrador | Profesor | Alumno |
|---|:---:|:---:|:---:|
| Consultar alumnos y materias | Sí | Sí | Sí |
| Crear/editar alumnos | Sí | Sí | No |
| Crear/editar materias | Sí | Sí | No |
| Eliminar alumnos y materias | Sí | No | No |
| Listar usuarios y asignar roles | Sí | No | No |
| Eliminar usuarios | Sí | No | No |

El registro público siempre asigna el rol `Alumno`. El rol viaja como claim dentro del JWT y la API lo valida con `[Authorize(Roles = "...")]`.

## Puesta en marcha

### 1. SQL Server

El contenedor usado en desarrollo se llama `clase-orm-sql` y publica `localhost:1433`.

```powershell
docker start clase-orm-sql
```

La contraseña de SQL Server y la cadena de conexión no se guardan en el repositorio. Configurar la conexión mediante User Secrets siguiendo `docs/INSTALACION_DESDE_CERO.md`.

### 2. Secretos locales

```powershell
cd .\CLASE_ORM
dotnet user-secrets set "Jwt:Key" "una-clave-segura-de-al-menos-32-caracteres"
dotnet user-secrets set "ConnectionStrings:Con" "Server=localhost,1433;Database=MiPrimeraBaseDeDatos;User Id=sa;Password=<TU_PASSWORD_SQL>;TrustServerCertificate=True;Encrypt=False;"
dotnet user-secrets set "SeedAdmin:Password" "<TU_PASSWORD_ADMIN>"
```

### 3. Migraciones y API

```powershell
dotnet restore
dotnet ef database update
dotnet run --launch-profile http
```

- API: `http://localhost:5201`
- Swagger: `http://localhost:5201/swagger`

Administrador de demostración, solo en ambiente Development:

```text
Email: admin@claseorm.local
Password: el valor local configurado en SeedAdmin:Password
```

La cuenta se crea automáticamente al iniciar la API cuando está configurado el secreto `SeedAdmin:Password`.

### 4. Angular

```powershell
cd .\TestAngular
npm.cmd ci
npm.cmd start
```

Abrir `http://localhost:4200`.

## Paginación y filtrado

Ejemplo:

```http
GET /api/Alumno?pageNumber=1&pageSize=10&search=programación
```

Respuesta:

```json
{
  "items": [],
  "totalCount": 0,
  "pageNumber": 1,
  "pageSize": 10,
  "totalPages": 0
}
```

## Errores globales

Todos los errores controlados comparten el mismo contrato:

```json
{
  "status": 404,
  "title": "Recurso no encontrado",
  "detail": "No existe la materia con id 25.",
  "instance": "/api/Materia/25",
  "traceId": "...",
  "timestamp": "2026-11-17T14:00:00Z"
}
```

El middleware traduce excepciones de negocio a HTTP 400, 401, 404 y 409; los errores no previstos retornan HTTP 500 sin exponer detalles internos.

## Angular Material

El frontend utiliza `MatTable`, `MatPaginator`, `MatDialog`, `MatFormField`, `MatInput`, `MatSelect`, `MatToolbar`, `MatCard` y `MatButton`.

## Verificación

```powershell
# Backend
dotnet build .\CLASE_ORM\CLASE_ORM.sln

# Frontend
cd .\TestAngular
npm.cmd run build
npm.cmd test -- --watch=false --browsers=ChromeHeadless

# E2E de API (con la API iniciada)
cd ..\CLASE_ORM
powershell -ExecutionPolicy Bypass -File .\scripts\Test-E2E.ps1 -BaseUrl http://localhost:5201 -AdminPassword "<TU_PASSWORD_ADMIN>"
```

La suite E2E valida autenticación, los tres roles, permisos 401/403, paginación, filtrado, middleware, errores globales, CRUD y restricciones relacionales.

Para instalar y ejecutar todo el sistema en una computadora limpia, consultar [docs/INSTALACION_DESDE_CERO.md](docs/INSTALACION_DESDE_CERO.md).

Para preparar la exposición oral consultar [docs/DEFENSA.md](docs/DEFENSA.md).
