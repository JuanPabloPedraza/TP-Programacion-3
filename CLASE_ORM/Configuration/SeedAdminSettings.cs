namespace CLASE_ORM.Configuration;

public sealed class SeedAdminSettings
{
    public const string SectionName = "SeedAdmin";
    public bool Enabled { get; init; }
    public string Nombre { get; init; } = "Administrador";
    public string Email { get; init; } = string.Empty;
    public string Password { get; init; } = string.Empty;
}
