using CLASE_ORM.Application.Common;
using CLASE_ORM.Entities.DTO.Alumno;

namespace CLASE_ORM.Interfaces;

public interface IAlumnoService
{
    Task<PagedResult<AlumnoDto>> GetPagedAsync(PaginationQuery query, CancellationToken cancellationToken);
    Task<AlumnoDto> GetByIdAsync(int id, CancellationToken cancellationToken);
    Task<AlumnoDto> CreateAsync(CrearAlumnoDto dto, CancellationToken cancellationToken);
    Task UpdateAsync(int id, ActualizarAlumnoDto dto, CancellationToken cancellationToken);
    Task DeleteAsync(int id, CancellationToken cancellationToken);
}
