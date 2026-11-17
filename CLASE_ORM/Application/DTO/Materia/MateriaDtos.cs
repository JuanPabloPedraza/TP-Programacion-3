using System.ComponentModel.DataAnnotations;

namespace CLASE_ORM.Entities.DTO.Materia;

public sealed record MateriaDto(int Id, string Nombre, int CantidadAlumnos);
public sealed record AlumnoResumenDto(int Id, string Nombre, string Email);
public sealed record MateriaDetalleDto(int Id, string Nombre, IReadOnlyCollection<AlumnoResumenDto> Alumnos);

public class CrearMateriaDto
{
    [Required(ErrorMessage = "El nombre es obligatorio.")]
    [StringLength(25, MinimumLength = 2, ErrorMessage = "El nombre debe tener entre 2 y 25 caracteres.")]
    public required string Nombre { get; init; }
}

public sealed class ActualizarMateriaDto : CrearMateriaDto;
