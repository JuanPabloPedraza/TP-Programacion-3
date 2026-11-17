using CLASE_ORM.Application.Common;
using CLASE_ORM.Application.Exceptions;
using CLASE_ORM.Context;
using CLASE_ORM.Entities;
using CLASE_ORM.Entities.DTO.Alumno;
using CLASE_ORM.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace CLASE_ORM.Infrastructure.Services;

public sealed class AlumnoService : IAlumnoService
{
    private readonly AppDbContext _context;

    public AlumnoService(AppDbContext context) => _context = context;

    public async Task<PagedResult<AlumnoDto>> GetPagedAsync(
        PaginationQuery query,
        CancellationToken cancellationToken)
    {
        var alumnos = _context.Alumnos.AsNoTracking();
        var search = query.Search?.Trim();

        if (!string.IsNullOrWhiteSpace(search))
        {
            alumnos = alumnos.Where(item =>
                item.Nombre.Contains(search) ||
                item.Email.Contains(search) ||
                item.Materia.Nombre.Contains(search));
        }

        var totalCount = await alumnos.CountAsync(cancellationToken);
        var items = await alumnos
            .OrderBy(item => item.Nombre)
            .Skip((query.PageNumber - 1) * query.PageSize)
            .Take(query.PageSize)
            .Select(item => new AlumnoDto(
                item.Id,
                item.Nombre,
                item.Email,
                item.MateriaId,
                item.Materia.Nombre))
            .ToListAsync(cancellationToken);

        return new PagedResult<AlumnoDto>(items, totalCount, query.PageNumber, query.PageSize);
    }

    public async Task<AlumnoDto> GetByIdAsync(int id, CancellationToken cancellationToken)
    {
        return await _context.Alumnos
            .AsNoTracking()
            .Where(item => item.Id == id)
            .Select(item => new AlumnoDto(
                item.Id,
                item.Nombre,
                item.Email,
                item.MateriaId,
                item.Materia.Nombre))
            .SingleOrDefaultAsync(cancellationToken)
            ?? throw new NotFoundException($"No existe el alumno con id {id}.");
    }

    public async Task<AlumnoDto> CreateAsync(CrearAlumnoDto dto, CancellationToken cancellationToken)
    {
        await EnsureMateriaExistsAsync(dto.MateriaId, cancellationToken);

        var alumno = new Alumno
        {
            Nombre = dto.Nombre.Trim(),
            Email = dto.Email.Trim().ToLowerInvariant(),
            MateriaId = dto.MateriaId
        };

        _context.Alumnos.Add(alumno);
        await _context.SaveChangesAsync(cancellationToken);
        return await GetByIdAsync(alumno.Id, cancellationToken);
    }

    public async Task UpdateAsync(int id, ActualizarAlumnoDto dto, CancellationToken cancellationToken)
    {
        var alumno = await _context.Alumnos.FindAsync([id], cancellationToken)
            ?? throw new NotFoundException($"No existe el alumno con id {id}.");

        await EnsureMateriaExistsAsync(dto.MateriaId, cancellationToken);
        alumno.Nombre = dto.Nombre.Trim();
        alumno.Email = dto.Email.Trim().ToLowerInvariant();
        alumno.MateriaId = dto.MateriaId;
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task DeleteAsync(int id, CancellationToken cancellationToken)
    {
        var alumno = await _context.Alumnos.FindAsync([id], cancellationToken)
            ?? throw new NotFoundException($"No existe el alumno con id {id}.");

        _context.Alumnos.Remove(alumno);
        await _context.SaveChangesAsync(cancellationToken);
    }

    private async Task EnsureMateriaExistsAsync(int materiaId, CancellationToken cancellationToken)
    {
        if (!await _context.Materias.AnyAsync(item => item.Id == materiaId, cancellationToken))
        {
            throw new BusinessValidationException($"La materia con id {materiaId} no existe.");
        }
    }
}
