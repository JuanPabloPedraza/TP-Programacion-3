using System.ComponentModel.DataAnnotations;

namespace CLASE_ORM.Entities.DTO.Auth;

public sealed class RegisterDto
{
    [Required, MaxLength(100)]
    public required string Nombre { get; init; }

    [Required, EmailAddress, MaxLength(256)]
    public required string Email { get; init; }

    [Required, MinLength(8), MaxLength(100)]
    public required string Password { get; init; }
}

public sealed class LoginDto
{
    [Required, EmailAddress]
    public required string Email { get; init; }

    [Required]
    public required string Password { get; init; }
}

public sealed record AuthUserDto(int Id, string Nombre, string Email, string Rol);
public sealed record AuthResponseDto(string Token, DateTime ExpiresAt, AuthUserDto User);
