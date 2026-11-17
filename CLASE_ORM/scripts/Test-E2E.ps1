param(
    [string]$BaseUrl = 'http://localhost:5202',
    [string]$AdminEmail = 'admin@claseorm.local',
    [Parameter(Mandatory = $true)]
    [string]$AdminPassword
)

$ErrorActionPreference = 'Stop'
$apiUrl = "$BaseUrl/api"
$suffix = [Guid]::NewGuid().ToString('N').Substring(0, 8)
$password = "E2E-$suffix-Aa1!"
$results = [System.Collections.Generic.List[string]]::new()
$adminToken = $null
$alumnoUserId = $null
$profesorUserId = $null
$materiaId = $null
$alumnoId = $null

function Invoke-Api {
    param(
        [string]$Method,
        [string]$Path,
        [string]$Token,
        [object]$Body
    )

    $headers = @{}
    if ($Token) { $headers.Authorization = "Bearer $Token" }
    $params = @{
        Method = $Method
        Uri = "$apiUrl$Path"
        Headers = $headers
        UseBasicParsing = $true
    }
    if ($null -ne $Body) {
        $params.ContentType = 'application/json'
        $params.Body = $Body | ConvertTo-Json -Depth 5
    }

    try {
        $response = Invoke-WebRequest @params
        $content = $response.Content
        $responseHeaders = $response.Headers
        $status = [int]$response.StatusCode
    }
    catch {
        if (-not $_.Exception.Response) { throw }
        $response = $_.Exception.Response
        $status = [int]$response.StatusCode
        $responseHeaders = $response.Headers
        $reader = [System.IO.StreamReader]::new($response.GetResponseStream())
        $content = $reader.ReadToEnd()
        $reader.Dispose()
    }

    $json = $null
    if (-not [string]::IsNullOrWhiteSpace($content)) {
        try { $json = $content | ConvertFrom-Json } catch {}
    }

    return [pscustomobject]@{
        Status = $status
        Json = $json
        Headers = $responseHeaders
    }
}

function Assert-Status {
    param([string]$Name, $Response, [int]$Expected)
    if ($Response.Status -ne $Expected) {
        throw "$Name esperaba HTTP $Expected y recibió HTTP $($Response.Status)."
    }
    $script:results.Add("OK - $Name (HTTP $Expected)")
}

function Assert-True {
    param([string]$Name, [bool]$Condition)
    if (-not $Condition) { throw "$Name no cumplió la condición esperada." }
    $script:results.Add("OK - $Name")
}

try {
    $anonymous = Invoke-Api GET '/Alumno' $null $null
    Assert-Status 'Autorización bloquea acceso anónimo' $anonymous 401

    $adminLogin = Invoke-Api POST '/auth/login' $null @{
        email = $AdminEmail
        password = $AdminPassword
    }
    Assert-Status 'Login administrador' $adminLogin 200
    Assert-True 'JWT informa rol Administrador' ($adminLogin.Json.user.rol -eq 'Administrador')
    $adminToken = $adminLogin.Json.token

    $alumnoEmail = "e2e-alumno-$suffix@example.test"
    $alumnoRegister = Invoke-Api POST '/auth/register' $null @{
        nombre = 'Alumno E2E'
        email = $alumnoEmail
        password = $password
    }
    Assert-Status 'Registro público' $alumnoRegister 200
    Assert-True 'Registro asigna rol Alumno' ($alumnoRegister.Json.user.rol -eq 'Alumno')
    $alumnoUserId = [int]$alumnoRegister.Json.user.id
    $alumnoToken = $alumnoRegister.Json.token

    $profesorEmail = "e2e-profesor-$suffix@example.test"
    $profesorRegister = Invoke-Api POST '/auth/register' $null @{
        nombre = 'Profesor E2E'
        email = $profesorEmail
        password = $password
    }
    Assert-Status 'Registro de candidato a profesor' $profesorRegister 200
    $profesorUserId = [int]$profesorRegister.Json.user.id

    $usuarios = Invoke-Api GET "/Usuarios?pageNumber=1&pageSize=5&search=$suffix" $adminToken $null
    Assert-Status 'Filtrado y paginación de usuarios' $usuarios 200
    Assert-True 'Filtro encuentra usuarios creados' ($usuarios.Json.totalCount -eq 2)

    $promote = Invoke-Api PUT "/Usuarios/$profesorUserId/rol" $adminToken @{ rol = 'Profesor' }
    Assert-Status 'Administrador asigna rol Profesor' $promote 204

    $profesorLogin = Invoke-Api POST '/auth/login' $null @{
        email = $profesorEmail
        password = $password
    }
    Assert-True 'Nuevo JWT refleja rol Profesor' ($profesorLogin.Json.user.rol -eq 'Profesor')
    $profesorToken = $profesorLogin.Json.token

    $materia = Invoke-Api POST '/Materia' $profesorToken @{ nombre = "E2E-$suffix" }
    Assert-Status 'Profesor crea materia' $materia 201
    $materiaId = [int]$materia.Json.id

    $forbiddenDelete = Invoke-Api DELETE "/Materia/$materiaId" $profesorToken $null
    Assert-Status 'Profesor no puede eliminar materia' $forbiddenDelete 403

    $forbiddenCreate = Invoke-Api POST '/Materia' $alumnoToken @{ nombre = "NoPermitida-$suffix" }
    Assert-Status 'Alumno no puede crear materia' $forbiddenCreate 403

    $paged = Invoke-Api GET "/Materia?pageNumber=1&pageSize=5&search=E2E-$suffix" $alumnoToken $null
    Assert-Status 'Alumno puede consultar con filtro' $paged 200
    Assert-True 'Respuesta paginada contiene metadatos' ($paged.Json.totalCount -eq 1 -and $paged.Json.pageSize -eq 5)
    Assert-True 'Middleware agrega tiempo de respuesta' ($null -ne $paged.Headers['X-Response-Time-Ms'])

    $invalidPagination = Invoke-Api GET '/Materia?pageNumber=0&pageSize=101' $alumnoToken $null
    Assert-Status 'Validación global rechaza paginación inválida' $invalidPagination 400
    Assert-True 'Error de validación tiene estructura común' ($invalidPagination.Json.title -like 'Error de valid*' -and $null -ne $invalidPagination.Json.traceId)

    $createdAlumno = Invoke-Api POST '/Alumno' $profesorToken @{
        nombre = 'Alumno académico E2E'
        email = $alumnoEmail
        materiaId = $materiaId
    }
    Assert-Status 'Profesor crea alumno académico' $createdAlumno 201
    $alumnoId = [int]$createdAlumno.Json.id

    $detail = Invoke-Api GET "/Materia/$materiaId" $alumnoToken $null
    Assert-Status 'Detalle de materia con alumnos no genera ciclo JSON' $detail 200
    Assert-True 'Detalle incluye alumno asociado' ($detail.Json.alumnos.Count -eq 1)

    $conflict = Invoke-Api DELETE "/Materia/$materiaId" $adminToken $null
    Assert-Status 'No elimina materia con alumnos' $conflict 409
    Assert-True 'Conflicto retorna detalle descriptivo' ($conflict.Json.detail -like '*alumnos asociados*')

    $deleteAlumno = Invoke-Api DELETE "/Alumno/$alumnoId" $adminToken $null
    Assert-Status 'Administrador elimina alumno' $deleteAlumno 204
    $alumnoId = $null

    $deleteMateria = Invoke-Api DELETE "/Materia/$materiaId" $adminToken $null
    Assert-Status 'Administrador elimina materia vacía' $deleteMateria 204
    $deletedMateriaId = $materiaId
    $materiaId = $null

    $notFound = Invoke-Api GET "/Materia/$deletedMateriaId" $adminToken $null
    Assert-Status 'Recurso eliminado retorna 404' $notFound 404
    Assert-True 'Middleware estructura NotFound' ($notFound.Json.title -eq 'Recurso no encontrado' -and $null -ne $notFound.Json.traceId)

    $deleteAlumnoUser = Invoke-Api DELETE "/Usuarios/$alumnoUserId" $adminToken $null
    Assert-Status 'Administrador elimina usuario Alumno' $deleteAlumnoUser 204
    $alumnoUserId = $null

    $deleteProfesorUser = Invoke-Api DELETE "/Usuarios/$profesorUserId" $adminToken $null
    Assert-Status 'Administrador elimina usuario Profesor' $deleteProfesorUser 204
    $profesorUserId = $null
}
finally {
    if ($adminToken) {
        if ($alumnoId) { try { Invoke-Api DELETE "/Alumno/$alumnoId" $adminToken $null | Out-Null } catch {} }
        if ($materiaId) { try { Invoke-Api DELETE "/Materia/$materiaId" $adminToken $null | Out-Null } catch {} }
        if ($alumnoUserId) { try { Invoke-Api DELETE "/Usuarios/$alumnoUserId" $adminToken $null | Out-Null } catch {} }
        if ($profesorUserId) { try { Invoke-Api DELETE "/Usuarios/$profesorUserId" $adminToken $null | Out-Null } catch {} }
    }
}

$results | ForEach-Object { Write-Host $_ }
Write-Host "TOTAL: $($results.Count) pruebas E2E exitosas."
