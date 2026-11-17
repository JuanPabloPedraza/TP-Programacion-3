namespace CLASE_ORM.Configuration;

public sealed class JwtSettings
{
    public const string SectionName = "Jwt";
    public required string Issuer { get; init; }
    public required string Audience { get; init; }
    public int DurationMinutes { get; init; } = 1440;
    public required string Key { get; init; }
}
