using System.ComponentModel.DataAnnotations;
using CLASE_ORM.Entities;

namespace CLASE_ORM.Entities.DTO.Usuario;

public sealed record UsuarioDto(int Id, string Nombre, string Email, string Rol);

public sealed class ActualizarRolDto
{
    [Required]
    public RolUsuario Rol { get; init; }
}
