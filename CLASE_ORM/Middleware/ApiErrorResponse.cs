namespace CLASE_ORM.Middleware;

public sealed record ApiErrorResponse(
    int Status,
    string Title,
    string Detail,
    string Instance,
    string TraceId,
    DateTime Timestamp,
    IReadOnlyDictionary<string, string[]>? Errors = null);
