# Guion breve para la defensa

## 1. Presentación

“El sistema administra alumnos, materias y usuarios. Tiene una API ASP.NET Core 8, una SPA Angular 20 y SQL Server. La persistencia se implementa con Entity Framework Core y migraciones Code First.”

## 2. Clean Architecture

Mostrar la solución y explicar:

1. `Domain` contiene entidades y el enum de roles; no conoce EF, HTTP ni Angular.
2. `Application` define contratos, DTO, paginación y excepciones.
3. `Infrastructure` implementa los contratos y accede a SQL Server mediante `AppDbContext`.
4. La API recibe HTTP, aplica autorización y delega; los controladores no contienen reglas de persistencia.
5. Las dependencias apuntan hacia el dominio, no al revés.

Ejemplo para mostrar: `AlumnoController → IAlumnoService → AlumnoService → AppDbContext`.

## 3. ORM y Code First

- Las clases C# son el modelo de dominio.
- `AppDbContext` configura longitudes, índices, relaciones y conversiones.
- Las migraciones versionan el esquema.
- La última migración agrega roles, restricciones e índice único para materias.
- `dotnet ef database update` sincroniza SQL Server con el modelo.

## 4. Autenticación y roles

- BCrypt almacena hashes, nunca contraseñas planas en la tabla.
- Al iniciar sesión se crea un JWT con identificador, email y rol.
- `[Authorize]` exige autenticación.
- `[Authorize(Roles = "Administrador,Profesor")]` aplica autorización.
- Angular oculta acciones según el rol, pero la seguridad real siempre está en la API.

Demostración recomendada:

1. Ingresar como administrador.
2. Crear un usuario mediante registro.
3. Cambiarlo a Profesor desde “Usuarios y roles”.
4. Mostrar que Profesor crea y edita, pero recibe 403 al eliminar.
5. Mostrar que Alumno solo consulta.

## 5. Paginación y filtrado

- Angular envía `pageNumber`, `pageSize` y `search`.
- EF aplica `Where`, `Skip` y `Take` antes de ejecutar SQL.
- La API responde elementos y metadatos (`totalCount`, `totalPages`).
- Esto evita traer toda la tabla al navegador.

## 6. Middleware y excepciones

- `RequestTimingMiddleware` mide cada petición y agrega `X-Response-Time-Ms`.
- `ExceptionHandlingMiddleware` centraliza errores y evita `try/catch` repetidos.
- Excepciones como `NotFoundException` y `ConflictException` se traducen a códigos HTTP.
- Cada error incluye `traceId`, útil para correlacionarlo con logs.

Demostración recomendada: intentar borrar una materia con alumnos y mostrar el HTTP 409 descriptivo.

## 7. Angular Material

Mostrar tabla, paginador, diálogo, inputs, select de roles, toolbar y card. Explicar que son componentes standalone importados solamente donde se usan.

## 8. Preguntas frecuentes

**¿Por qué DTO y no entidades directamente?**

Para controlar el contrato, evitar ciclos JSON y no exponer el modelo de persistencia.

**¿Dónde está la seguridad real?**

En la API. Ocultar botones mejora UX, pero no reemplaza `[Authorize]`.

**¿Por qué async?**

Para no bloquear hilos mientras SQL Server procesa operaciones de entrada/salida.

**¿Por qué se usa `AsNoTracking`?**

Las consultas de lectura no necesitan seguimiento y consumen menos memoria.

**¿Qué ocurre con un error inesperado?**

El middleware lo registra y retorna HTTP 500 genérico sin filtrar stack traces.

**¿Cómo se comprobó?**

Build backend, build Angular, 14 tests de frontend y una suite E2E que cubre autenticación, roles, CRUD, filtros y errores.

## 9. Checklist antes de presentar

- Docker Desktop abierto y contenedor SQL en estado `Up`.
- `dotnet ef database update` ejecutado.
- Clave JWT configurada en User Secrets.
- API y Angular iniciados en terminales separadas.
- Login administrador probado.
- Swagger y navegador abiertos.
- Ejecutar `scripts/Test-E2E.ps1` si se desea demostrar la verificación automática.
