using CLASE_ORM.Application.Common;
using CLASE_ORM.Entities.DTO.Alumno;
using CLASE_ORM.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CLASE_ORM.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public sealed class AlumnoController : ControllerBase
{
    private readonly IAlumnoService _service;

    public AlumnoController(IAlumnoService service) => _service = service;

    [HttpGet]
    public async Task<ActionResult<PagedResult<AlumnoDto>>> GetAll(
        [FromQuery] PaginationQuery query,
        CancellationToken cancellationToken)
        => Ok(await _service.GetPagedAsync(query, cancellationToken));

    [HttpGet("{id:int}")]
    public async Task<ActionResult<AlumnoDto>> GetById(int id, CancellationToken cancellationToken)
        => Ok(await _service.GetByIdAsync(id, cancellationToken));

    [HttpPost]
    [Authorize(Roles = "Administrador,Profesor")]
    public async Task<ActionResult<AlumnoDto>> Create(
        CrearAlumnoDto dto,
        CancellationToken cancellationToken)
    {
        var created = await _service.CreateAsync(dto, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpPut("{id:int}")]
    [Authorize(Roles = "Administrador,Profesor")]
    public async Task<IActionResult> Update(
        int id,
        ActualizarAlumnoDto dto,
        CancellationToken cancellationToken)
    {
        await _service.UpdateAsync(id, dto, cancellationToken);
        return NoContent();
    }

    [HttpDelete("{id:int}")]
    [Authorize(Roles = "Administrador")]
    public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken)
    {
        await _service.DeleteAsync(id, cancellationToken);
        return NoContent();
    }
}
