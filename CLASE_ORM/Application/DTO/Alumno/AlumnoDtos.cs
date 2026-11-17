using System.ComponentModel.DataAnnotations;

namespace CLASE_ORM.Entities.DTO.Alumno;

public sealed record AlumnoDto(int Id, string Nombre, string Email, int MateriaId, string Materia);

public class CrearAlumnoDto
{
    [Required, StringLength(100, MinimumLength = 2)]
    public required string Nombre { get; init; }

    [Required, EmailAddress, MaxLength(256)]
    public required string Email { get; init; }

    [Range(1, int.MaxValue)]
    public int MateriaId { get; init; }
}

public sealed class ActualizarAlumnoDto : CrearAlumnoDto;
