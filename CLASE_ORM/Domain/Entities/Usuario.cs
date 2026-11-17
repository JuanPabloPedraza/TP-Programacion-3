namespace CLASE_ORM.Entities;

public class Usuario
{
    public int Id { get; set; }
    public required string Nombre { get; set; }
    public required string Email { get; set; }
    public required string PasswordHash { get; set; }
    public RolUsuario Rol { get; set; } = RolUsuario.Alumno;
}
