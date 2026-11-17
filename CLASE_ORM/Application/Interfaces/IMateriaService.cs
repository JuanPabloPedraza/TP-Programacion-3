using CLASE_ORM.Application.Common;
using CLASE_ORM.Entities.DTO.Materia;

namespace CLASE_ORM.Interfaces;

public interface IMateriaService
{
    Task<PagedResult<MateriaDto>> GetPagedAsync(PaginationQuery query, CancellationToken cancellationToken);
    Task<MateriaDetalleDto> GetByIdAsync(int id, CancellationToken cancellationToken);
    Task<MateriaDto> CreateAsync(CrearMateriaDto dto, CancellationToken cancellationToken);
    Task UpdateAsync(int id, ActualizarMateriaDto dto, CancellationToken cancellationToken);
    Task DeleteAsync(int id, CancellationToken cancellationToken);
}
