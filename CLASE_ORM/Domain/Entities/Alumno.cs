namespace CLASE_ORM.Entities;

public class Alumno
{
    public int Id { get; set; }
    public required string Nombre { get; set; }
    public required string Email { get; set; }
    public int MateriaId { get; set; }
    public Materia Materia { get; set; } = null!;
}
