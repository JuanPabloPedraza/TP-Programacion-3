using CLASE_ORM.Application.Common;
using CLASE_ORM.Entities.DTO.Usuario;

namespace CLASE_ORM.Interfaces;

public interface IUsuarioService
{
    Task<PagedResult<UsuarioDto>> GetPagedAsync(PaginationQuery query, CancellationToken cancellationToken);
    Task UpdateRoleAsync(int id, ActualizarRolDto dto, int currentUserId, CancellationToken cancellationToken);
    Task DeleteAsync(int id, int currentUserId, CancellationToken cancellationToken);
}
