using InvestorManagementSystem.Application.DTOs;

namespace InvestorManagementSystem.Application.Interfaces;

public interface IAuthService
{
    Task<AuthResponseDto?> LoginAsync(LoginDto loginDto);
    Task<AuthResponseDto?> RegisterAsync(RegisterDto registerDto);
    Task<AuthResponseDto?> RefreshTokenAsync(string refreshToken);
    Task<bool> ChangePasswordAsync(Guid investorId, ChangePasswordDto changePasswordDto);
    Task<bool> LogoutAsync(string refreshToken);
    Task<bool> ValidateTokenAsync(string token);
}
