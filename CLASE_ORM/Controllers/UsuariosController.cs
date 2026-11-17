using System.Security.Claims;
using CLASE_ORM.Application.Common;
using CLASE_ORM.Entities.DTO.Usuario;
using CLASE_ORM.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CLASE_ORM.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Administrador")]
public sealed class UsuariosController : ControllerBase
{
    private readonly IUsuarioService _service;

    public UsuariosController(IUsuarioService service) => _service = service;

    [HttpGet]
    public async Task<ActionResult<PagedResult<UsuarioDto>>> GetAll(
        [FromQuery] PaginationQuery query,
        CancellationToken cancellationToken)
        => Ok(await _service.GetPagedAsync(query, cancellationToken));

    [HttpPut("{id:int}/rol")]
    public async Task<IActionResult> UpdateRole(
        int id,
        ActualizarRolDto dto,
        CancellationToken cancellationToken)
    {
        var currentUserId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        await _service.UpdateRoleAsync(id, dto, currentUserId, cancellationToken);
        return NoContent();
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken)
    {
        var currentUserId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        await _service.DeleteAsync(id, currentUserId, cancellationToken);
        return NoContent();
    }
}
