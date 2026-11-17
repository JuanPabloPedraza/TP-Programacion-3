using System.ComponentModel.DataAnnotations;

namespace CLASE_ORM.Application.Common;

public sealed class PaginationQuery
{
    [Range(1, int.MaxValue)]
    public int PageNumber { get; init; } = 1;

    [Range(1, 100)]
    public int PageSize { get; init; } = 10;

    [MaxLength(100)]
    public string? Search { get; init; }
}
