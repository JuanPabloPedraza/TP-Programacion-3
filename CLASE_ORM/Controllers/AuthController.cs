using CLASE_ORM.Entities.DTO.Auth;
using CLASE_ORM.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CLASE_ORM.Controllers;

[ApiController]
[Route("api/[controller]")]
[AllowAnonymous]
public sealed class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService) => _authService = authService;

    [HttpPost("register")]
    public async Task<ActionResult<AuthResponseDto>> Register(
        RegisterDto dto,
        CancellationToken cancellationToken)
        => Ok(await _authService.RegisterAsync(dto, cancellationToken));

    [HttpPost("login")]
    public async Task<ActionResult<AuthResponseDto>> Login(
        LoginDto dto,
        CancellationToken cancellationToken)
        => Ok(await _authService.LoginAsync(dto, cancellationToken));
}
