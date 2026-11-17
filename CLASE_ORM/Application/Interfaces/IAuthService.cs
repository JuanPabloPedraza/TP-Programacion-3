using CLASE_ORM.Entities.DTO.Auth;

namespace CLASE_ORM.Interfaces;

public interface IAuthService
{
    Task<AuthResponseDto> RegisterAsync(RegisterDto dto, CancellationToken cancellationToken);
    Task<AuthResponseDto> LoginAsync(LoginDto dto, CancellationToken cancellationToken);
}
