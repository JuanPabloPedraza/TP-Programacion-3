# Instalación y puesta en marcha desde cero

Esta guía permite preparar y ejecutar el sistema académico en una computadora limpia con Windows y PowerShell.

Al finalizar estarán funcionando:

- SQL Server 2022 dentro de Docker, en el puerto `1433`.
- La API ASP.NET Core 8, en `http://localhost:5201`.
- El frontend Angular 20, en `http://localhost:4200`.

> Todos los comandos parten de la carpeta raíz `.NET-ANGULAR`, que contiene las carpetas `CLASE_ORM` y `TestAngular`.

## 1. Requisitos previos

Instalar:

1. [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0).
2. [Node.js](https://nodejs.org/) con npm. Se recomienda una versión LTS compatible con Angular 20.
3. [Docker Desktop](https://www.docker.com/products/docker-desktop/) configurado para usar contenedores Linux.
4. Git, únicamente si el proyecto se obtiene mediante `git clone`.
5. Google Chrome, si se ejecutarán las pruebas unitarias del frontend.

Versiones con las que fue verificado este proyecto:

```text
.NET SDK:              8.0.427
Node.js:               22.22.3
npm:                   9.7.1
Docker:                29.5.2
Entity Framework CLI:  8.0.x
```

Comprobar las instalaciones desde PowerShell:

```powershell
dotnet --version
node --version
npm.cmd --version
docker --version
```

Docker Desktop debe estar iniciado antes de continuar. Comprobarlo con:

```powershell
docker info
```

## 2. Ubicar el proyecto

Obtener el repositorio mediante Git o descomprimirlo. La estructura esperada es:

```text
.NET-ANGULAR
├── CLASE_ORM
│   ├── CLASE_ORM.sln
│   ├── CLASE_ORM.csproj
│   └── scripts
├── TestAngular
│   └── package.json
├── docs
└── README.md
```

Abrir PowerShell en la carpeta `.NET-ANGULAR`. Para confirmar que se está en el lugar correcto:

```powershell
Get-ChildItem
```

Deben verse, como mínimo, las carpetas `CLASE_ORM` y `TestAngular`.

## 3. Crear SQL Server en Docker

Ejecutar una sola vez:

```powershell
docker run --name clase-orm-sql `
  -e "ACCEPT_EULA=Y" `
  -e "MSSQL_PID=Developer" `
  -e "MSSQL_SA_PASSWORD=<TU_PASSWORD_SQL>" `
  -p 1433:1433 `
  -v clase-orm-sqldata:/var/opt/mssql `
  -d mcr.microsoft.com/mssql/server:2022-latest
```

El comando crea el contenedor `clase-orm-sql` y el volumen persistente `clase-orm-sqldata`. Reemplazar `<TU_PASSWORD_SQL>` por una contraseña segura que cumpla la política de SQL Server y conservarla para configurar User Secrets.

La primera descarga puede tardar varios minutos. Verificar el estado:

```powershell
docker ps --filter "name=clase-orm-sql"
docker logs clase-orm-sql
```

Esperar hasta que el log indique que SQL Server está listo para aceptar conexiones. Si el contenedor ya existía pero estaba detenido, no hay que crearlo nuevamente:

```powershell
docker start clase-orm-sql
```

## 4. Preparar el backend

### 4.1 Restaurar y compilar

Desde la raíz `.NET-ANGULAR`:

```powershell
dotnet restore .\CLASE_ORM\CLASE_ORM.sln
dotnet build .\CLASE_ORM\CLASE_ORM.sln
```

La compilación correcta debe finalizar con `0 errores`.

### 4.2 Configurar los secretos locales

La API exige una clave JWT de al menos 32 caracteres, una conexión SQL Server y una contraseña para el administrador de demostración. Guardarlas mediante User Secrets para no escribirlas en el repositorio:

```powershell
dotnet user-secrets set "Jwt:Key" "<TU_CLAVE_JWT_DE_32_CARACTERES_O_MAS>" --project .\CLASE_ORM\CLASE_ORM.csproj
dotnet user-secrets set "ConnectionStrings:Con" "Server=localhost,1433;Database=MiPrimeraBaseDeDatos;User Id=sa;Password=<TU_PASSWORD_SQL>;TrustServerCertificate=True;Encrypt=False;" --project .\CLASE_ORM\CLASE_ORM.csproj
dotnet user-secrets set "SeedAdmin:Password" "<TU_PASSWORD_ADMIN>" --project .\CLASE_ORM\CLASE_ORM.csproj
```

Reemplazar cada marcador `<...>` por un valor local. La contraseña SQL debe ser la misma utilizada al crear el contenedor. Ninguno de estos valores se guarda en Git.

### 4.3 Instalar la herramienta de Entity Framework

Si `dotnet ef --version` todavía no funciona:

```powershell
dotnet tool install --global dotnet-ef --version 8.0.34
```

Si ya existe otra versión global y se desea actualizarla:

```powershell
dotnet tool update --global dotnet-ef --version 8.0.34
```

Después de una instalación nueva puede ser necesario cerrar y abrir PowerShell.

### 4.4 Crear la base de datos con Code First

Con SQL Server iniciado:

```powershell
dotnet ef database update `
  --project .\CLASE_ORM\CLASE_ORM.csproj `
  --startup-project .\CLASE_ORM\CLASE_ORM.csproj `
  --context AppDbContext
```

Entity Framework aplicará las migraciones y creará `MiPrimeraBaseDeDatos`, sus tablas, relaciones, índices y restricciones.

### 4.5 Iniciar la API

```powershell
dotnet run --project .\CLASE_ORM\CLASE_ORM.csproj --launch-profile http
```

Mantener esta terminal abierta. Comprobar en el navegador:

- Swagger: `http://localhost:5201/swagger`
- Dirección base de la API: `http://localhost:5201/api`

Al arrancar en modo Development, la API crea o actualiza el usuario administrador de demostración.

## 5. Preparar e iniciar Angular

Abrir una segunda ventana de PowerShell en `.NET-ANGULAR` y ejecutar:

```powershell
Set-Location .\TestAngular
npm.cmd ci
npm.cmd start
```

`npm.cmd ci` instala exactamente las dependencias declaradas en `package-lock.json`. Mantener esta terminal abierta y acceder a:

```text
http://localhost:4200
```

En desarrollo, Angular se conecta automáticamente con `http://localhost:5201/api`.

## 6. Iniciar sesión

Credenciales del administrador de demostración:

```text
Correo:     admin@claseorm.local
Contraseña: el valor configurado en SeedAdmin:Password
Rol:        Administrador
```

Este usuario permite probar todos los módulos, incluida la administración de roles. Los nuevos usuarios registrados desde la pantalla pública reciben el rol `Alumno`.

## 7. Ejecutar las pruebas

### Backend

Desde `.NET-ANGULAR`:

```powershell
dotnet build .\CLASE_ORM\CLASE_ORM.sln
```

### Frontend

```powershell
Set-Location .\TestAngular
npm.cmd run build
npm.cmd test -- --watch=false --browsers=ChromeHeadless
Set-Location ..
```

La suite actual contiene 14 pruebas unitarias del frontend.

### Pruebas E2E de la API

SQL Server y la API deben estar iniciados. Desde `.NET-ANGULAR`, en una tercera terminal:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass `
  -File .\CLASE_ORM\scripts\Test-E2E.ps1 `
  -BaseUrl http://localhost:5201 `
  -AdminPassword "<TU_PASSWORD_ADMIN>"
```

La suite actual realiza 29 verificaciones sobre autenticación, roles, permisos, CRUD, paginación, filtros, middleware, excepciones y restricciones relacionales.

## 8. Arranque habitual después de la primera instalación

No es necesario repetir la creación del contenedor, `npm ci`, User Secrets ni las migraciones cada vez. El arranque diario requiere tres terminales.

Terminal 1 — SQL Server:

```powershell
docker start clase-orm-sql
```

Terminal 2 — API, desde `.NET-ANGULAR`:

```powershell
dotnet run --project .\CLASE_ORM\CLASE_ORM.csproj --launch-profile http
```

Terminal 3 — Angular, desde `.NET-ANGULAR`:

```powershell
Set-Location .\TestAngular
npm.cmd start
```

## 9. Detener el sistema

Detener Angular y la API con `Ctrl+C` en sus respectivas terminales. Luego detener SQL Server:

```powershell
docker stop clase-orm-sql
```

El volumen conserva la base de datos para el próximo arranque.

## 10. Reiniciar completamente la base de datos

Esta operación elimina todos los datos. Utilizarla únicamente si se desea comenzar de cero:

```powershell
docker rm -f clase-orm-sql
docker volume rm clase-orm-sqldata
```

Después hay que repetir las secciones 3 y 4.4.

## 11. Problemas frecuentes

### `npm.ps1` no puede ejecutarse por la política de scripts

Usar `npm.cmd` como indican los comandos de esta guía.

### El nombre `clase-orm-sql` ya está en uso

El contenedor ya fue creado. Iniciarlo con:

```powershell
docker start clase-orm-sql
```

### El puerto 1433 ya está ocupado

Comprobar qué contenedor lo utiliza con `docker ps`. Detener el servicio en conflicto o cambiar de forma coordinada el puerto publicado por Docker y el puerto del secreto `ConnectionStrings:Con`.

### La API informa que falta `Jwt:Key` o `ConnectionStrings:Con`

Repetir la sección 4.2, verificando que `--project` apunte a `CLASE_ORM.csproj`.

### La API no puede conectarse a SQL Server

Verificar:

```powershell
docker ps --filter "name=clase-orm-sql"
docker logs clase-orm-sql
```

El contenedor debe figurar como `Up`, el puerto debe ser `1433` y SQL Server debe haber terminado de iniciar.

### `dotnet ef` no se reconoce

Instalar la herramienta como se explica en la sección 4.3 y abrir otra terminal. En Windows, las herramientas globales se encuentran normalmente en `%USERPROFILE%\.dotnet\tools`.

### Angular muestra errores de red o CORS

Confirmar que:

- La API está activa en `http://localhost:5201`.
- Angular fue iniciado con `npm.cmd start` y está en `http://localhost:4200`.
- Se está utilizando `environment.development.ts`.

### Una petición devuelve 401 o 403

- `401 Unauthorized`: falta iniciar sesión o el token JWT venció.
- `403 Forbidden`: el usuario está autenticado, pero su rol no permite esa operación.

## 12. Lista de control final

- [ ] Docker Desktop está iniciado.
- [ ] `clase-orm-sql` figura como `Up`.
- [ ] `dotnet build` termina sin errores.
- [ ] Las migraciones fueron aplicadas.
- [ ] Swagger abre en `http://localhost:5201/swagger`.
- [ ] Angular abre en `http://localhost:4200`.
- [ ] El administrador puede iniciar sesión.
- [ ] Las pruebas Angular terminan correctamente.
- [ ] La suite E2E informa 29 pruebas aprobadas.

Las contraseñas y claves incluidas aquí son exclusivas del entorno de desarrollo y de la presentación académica. No deben reutilizarse en producción.
