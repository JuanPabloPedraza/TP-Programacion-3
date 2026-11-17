using CLASE_ORM.Context;
using CLASE_ORM.Entities;
using Microsoft.EntityFrameworkCore;

namespace CLASE_ORM.Configuration;

public static class DevelopmentDataSeeder
{
    public static async Task SeedAdminAsync(WebApplication app)
    {
        if (!app.Environment.IsDevelopment()) return;

        var settings = app.Configuration
            .GetSection(SeedAdminSettings.SectionName)
            .Get<SeedAdminSettings>();

        if (settings is not { Enabled: true } ||
            string.IsNullOrWhiteSpace(settings.Email) ||
            string.IsNullOrWhiteSpace(settings.Password))
            return;

        await using var scope = app.Services.CreateAsyncScope();
        var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var email = settings.Email.Trim().ToLowerInvariant();
        var admin = await context.Usuarios.SingleOrDefaultAsync(item => item.Email == email);

        if (admin is null)
        {
            context.Usuarios.Add(new Usuario
            {
                Nombre = settings.Nombre.Trim(),
                Email = email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(settings.Password),
                Rol = RolUsuario.Administrador
            });
        }
        else
        {
            admin.Rol = RolUsuario.Administrador;
        }

        await context.SaveChangesAsync();
    }
}
