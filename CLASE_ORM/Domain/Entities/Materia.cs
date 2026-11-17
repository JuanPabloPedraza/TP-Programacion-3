namespace CLASE_ORM.Entities;

public class Materia
{
    public int Id { get; set; }
    public required string Nombre { get; set; }
    public ICollection<Alumno> Alumnos { get; set; } = new List<Alumno>();
}
