using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using CLASE_ORM.Application.Exceptions;
using CLASE_ORM.Configuration;
using CLASE_ORM.Context;
using CLASE_ORM.Entities;
using CLASE_ORM.Entities.DTO.Auth;
using CLASE_ORM.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace CLASE_ORM.Infrastructure.Services;

public sealed class AuthService : IAuthService
{
    private readonly AppDbContext _context;
    private readonly JwtSettings _jwtSettings;

    public AuthService(AppDbContext context, JwtSettings jwtSettings)
    {
        _context = context;
        _jwtSettings = jwtSettings;
    }

    public async Task<AuthResponseDto> RegisterAsync(RegisterDto dto, CancellationToken cancellationToken)
    {
        var email = NormalizeEmail(dto.Email);
        if (await _context.Usuarios.AnyAsync(item => item.Email == email, cancellationToken))
        {
            throw new ConflictException("Ya existe una cuenta con ese email.");
        }

        var usuario = new Usuario
        {
            Nombre = dto.Nombre.Trim(),
            Email = email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
            Rol = RolUsuario.Alumno
        };

        _context.Usuarios.Add(usuario);

        try
        {
            await _context.SaveChangesAsync(cancellationToken);
        }
        catch (DbUpdateException)
        {
            throw new ConflictException("Ya existe una cuenta con ese email.");
        }

        return CreateAuthResponse(usuario);
    }

    public async Task<AuthResponseDto> LoginAsync(LoginDto dto, CancellationToken cancellationToken)
    {
        var email = NormalizeEmail(dto.Email);
        var usuario = await _context.Usuarios
            .AsNoTracking()
            .SingleOrDefaultAsync(item => item.Email == email, cancellationToken);

        if (usuario is null || !BCrypt.Net.BCrypt.Verify(dto.Password, usuario.PasswordHash))
        {
            throw new UnauthorizedException("Email o contraseña incorrectos.");
        }

        return CreateAuthResponse(usuario);
    }

    private AuthResponseDto CreateAuthResponse(Usuario usuario)
    {
        var expiresAt = DateTime.UtcNow.AddMinutes(_jwtSettings.DurationMinutes);
        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, usuario.Id.ToString()),
            new Claim(ClaimTypes.NameIdentifier, usuario.Id.ToString()),
            new Claim(JwtRegisteredClaimNames.Name, usuario.Nombre),
            new Claim(JwtRegisteredClaimNames.Email, usuario.Email),
            new Claim(ClaimTypes.Role, usuario.Rol.ToString()),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtSettings.Key));
        var token = new JwtSecurityToken(
            issuer: _jwtSettings.Issuer,
            audience: _jwtSettings.Audience,
            claims: claims,
            expires: expiresAt,
            signingCredentials: new SigningCredentials(key, SecurityAlgorithms.HmacSha256));

        return new AuthResponseDto(
            new JwtSecurityTokenHandler().WriteToken(token),
            expiresAt,
            new AuthUserDto(usuario.Id, usuario.Nombre, usuario.Email, usuario.Rol.ToString()));
    }

    private static string NormalizeEmail(string email) => email.Trim().ToLowerInvariant();
}
