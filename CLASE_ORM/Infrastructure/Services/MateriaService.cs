using CLASE_ORM.Application.Common;
using CLASE_ORM.Application.Exceptions;
using CLASE_ORM.Context;
using CLASE_ORM.Entities;
using CLASE_ORM.Entities.DTO.Materia;
using CLASE_ORM.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace CLASE_ORM.Infrastructure.Services;

public sealed class MateriaService : IMateriaService
{
    private readonly AppDbContext _context;

    public MateriaService(AppDbContext context) => _context = context;

    public async Task<PagedResult<MateriaDto>> GetPagedAsync(
        PaginationQuery query,
        CancellationToken cancellationToken)
    {
        var materias = _context.Materias.AsNoTracking();
        var search = query.Search?.Trim();

        if (!string.IsNullOrWhiteSpace(search))
        {
            materias = materias.Where(item => item.Nombre.Contains(search));
        }

        var totalCount = await materias.CountAsync(cancellationToken);
        var items = await materias
            .OrderBy(item => item.Nombre)
            .Skip((query.PageNumber - 1) * query.PageSize)
            .Take(query.PageSize)
            .Select(item => new MateriaDto(item.Id, item.Nombre, item.Alumnos.Count))
            .ToListAsync(cancellationToken);

        return new PagedResult<MateriaDto>(items, totalCount, query.PageNumber, query.PageSize);
    }

    public async Task<MateriaDetalleDto> GetByIdAsync(int id, CancellationToken cancellationToken)
    {
        return await _context.Materias
            .AsNoTracking()
            .Where(item => item.Id == id)
            .Select(item => new MateriaDetalleDto(
                item.Id,
                item.Nombre,
                item.Alumnos
                    .OrderBy(alumno => alumno.Nombre)
                    .Select(alumno => new AlumnoResumenDto(alumno.Id, alumno.Nombre, alumno.Email))
                    .ToList()))
            .SingleOrDefaultAsync(cancellationToken)
            ?? throw new NotFoundException($"No existe la materia con id {id}.");
    }

    public async Task<MateriaDto> CreateAsync(CrearMateriaDto dto, CancellationToken cancellationToken)
    {
        var nombre = await ValidateNameAsync(dto.Nombre, null, cancellationToken);
        var materia = new Materia { Nombre = nombre };
        _context.Materias.Add(materia);
        await _context.SaveChangesAsync(cancellationToken);
        return new MateriaDto(materia.Id, materia.Nombre, 0);
    }

    public async Task UpdateAsync(int id, ActualizarMateriaDto dto, CancellationToken cancellationToken)
    {
        var materia = await _context.Materias.FindAsync([id], cancellationToken)
            ?? throw new NotFoundException($"No existe la materia con id {id}.");

        materia.Nombre = await ValidateNameAsync(dto.Nombre, id, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task DeleteAsync(int id, CancellationToken cancellationToken)
    {
        var materia = await _context.Materias.FindAsync([id], cancellationToken)
            ?? throw new NotFoundException($"No existe la materia con id {id}.");

        if (await _context.Alumnos.AnyAsync(item => item.MateriaId == id, cancellationToken))
        {
            throw new ConflictException("No se puede eliminar una materia que tiene alumnos asociados.");
        }

        _context.Materias.Remove(materia);
        await _context.SaveChangesAsync(cancellationToken);
    }

    private async Task<string> ValidateNameAsync(
        string nombre,
        int? currentId,
        CancellationToken cancellationToken)
    {
        var normalized = nombre.Trim();
        var exists = await _context.Materias.AnyAsync(
            item => item.Id != currentId && item.Nombre == normalized,
            cancellationToken);

        if (exists)
        {
            throw new ConflictException("Ya existe una materia con ese nombre.");
        }

        return normalized;
    }
}
