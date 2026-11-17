using CLASE_ORM.Application.Common;
using CLASE_ORM.Application.Exceptions;
using CLASE_ORM.Context;
using CLASE_ORM.Entities.DTO.Usuario;
using CLASE_ORM.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace CLASE_ORM.Infrastructure.Services;

public sealed class UsuarioService : IUsuarioService
{
    private readonly AppDbContext _context;

    public UsuarioService(AppDbContext context) => _context = context;

    public async Task<PagedResult<UsuarioDto>> GetPagedAsync(
        PaginationQuery query,
        CancellationToken cancellationToken)
    {
        var usuarios = _context.Usuarios.AsNoTracking();
        var search = query.Search?.Trim();

        if (!string.IsNullOrWhiteSpace(search))
        {
            usuarios = usuarios.Where(item =>
                item.Nombre.Contains(search) || item.Email.Contains(search));
        }

        var totalCount = await usuarios.CountAsync(cancellationToken);
        var items = await usuarios
            .OrderBy(item => item.Nombre)
            .Skip((query.PageNumber - 1) * query.PageSize)
            .Take(query.PageSize)
            .Select(item => new UsuarioDto(item.Id, item.Nombre, item.Email, item.Rol.ToString()))
            .ToListAsync(cancellationToken);

        return new PagedResult<UsuarioDto>(items, totalCount, query.PageNumber, query.PageSize);
    }

    public async Task UpdateRoleAsync(
        int id,
        ActualizarRolDto dto,
        int currentUserId,
        CancellationToken cancellationToken)
    {
        if (id == currentUserId)
        {
            throw new ConflictException("No podés modificar tu propio rol.");
        }

        var usuario = await _context.Usuarios.FindAsync([id], cancellationToken)
            ?? throw new NotFoundException($"No existe el usuario con id {id}.");

        usuario.Rol = dto.Rol;
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task DeleteAsync(int id, int currentUserId, CancellationToken cancellationToken)
    {
        if (id == currentUserId)
        {
            throw new ConflictException("No podés eliminar tu propia cuenta.");
        }

        var usuario = await _context.Usuarios.FindAsync([id], cancellationToken)
            ?? throw new NotFoundException($"No existe el usuario con id {id}.");

        _context.Usuarios.Remove(usuario);
        await _context.SaveChangesAsync(cancellationToken);
    }
}
