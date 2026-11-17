using CLASE_ORM.Application.Exceptions;
using Microsoft.EntityFrameworkCore;

namespace CLASE_ORM.Middleware;

public sealed class ExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionHandlingMiddleware> _logger;

    public ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception exception)
        {
            await HandleExceptionAsync(context, exception);
        }
    }

    private async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        var (status, title, detail) = exception switch
        {
            NotFoundException => (StatusCodes.Status404NotFound, "Recurso no encontrado", exception.Message),
            ConflictException => (StatusCodes.Status409Conflict, "Conflicto", exception.Message),
            UnauthorizedException => (StatusCodes.Status401Unauthorized, "No autorizado", exception.Message),
            BusinessValidationException => (StatusCodes.Status400BadRequest, "Solicitud inválida", exception.Message),
            DbUpdateException => (StatusCodes.Status409Conflict, "Conflicto de datos", "La operación viola una restricción de la base de datos."),
            _ => (StatusCodes.Status500InternalServerError, "Error interno", "Ocurrió un error inesperado. Intentá nuevamente.")
        };

        if (status >= 500)
            _logger.LogError(exception, "Unhandled exception. TraceId: {TraceId}", context.TraceIdentifier);
        else
            _logger.LogWarning(exception, "Handled exception. TraceId: {TraceId}", context.TraceIdentifier);

        context.Response.StatusCode = status;
        context.Response.ContentType = "application/json";
        await context.Response.WriteAsJsonAsync(new ApiErrorResponse(
            status,
            title,
            detail,
            context.Request.Path,
            context.TraceIdentifier,
            DateTime.UtcNow));
    }
}
