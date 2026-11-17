using CLASE_ORM.Entities;
using Microsoft.EntityFrameworkCore;

namespace CLASE_ORM.Context;

public sealed class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Alumno> Alumnos => Set<Alumno>();
    public DbSet<Materia> Materias => Set<Materia>();
    public DbSet<Profesor> Profesores => Set<Profesor>();
    public DbSet<Usuario> Usuarios => Set<Usuario>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Alumno>(entity =>
        {
            entity.Property(item => item.Nombre).HasMaxLength(100).IsRequired();
            entity.Property(item => item.Email).HasMaxLength(256).IsRequired();
            entity.HasOne(item => item.Materia)
                .WithMany(item => item.Alumnos)
                .HasForeignKey(item => item.MateriaId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<Materia>(entity =>
        {
            entity.Property(item => item.Nombre).HasMaxLength(25).IsRequired();
            entity.HasIndex(item => item.Nombre).IsUnique();
        });

        modelBuilder.Entity<Profesor>()
            .Property(item => item.Nombre)
            .HasMaxLength(100)
            .IsRequired();

        modelBuilder.Entity<Usuario>(entity =>
        {
            entity.Property(item => item.Nombre).HasMaxLength(100).IsRequired();
            entity.Property(item => item.Email).HasMaxLength(256).IsRequired();
            entity.Property(item => item.PasswordHash).HasMaxLength(200).IsRequired();
            entity.Property(item => item.Rol)
                .HasConversion<string>()
                .HasMaxLength(20)
                .HasDefaultValue(RolUsuario.Alumno);
            entity.HasIndex(item => item.Email).IsUnique();
        });
    }
}
