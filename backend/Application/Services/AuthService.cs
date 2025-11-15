using Microsoft.Extensions.Logging;
using InvestorManagementSystem.Application.DTOs;
using InvestorManagementSystem.Application.Interfaces;
using InvestorManagementSystem.Core.Entities;
using System.Security.Cryptography;
using System.Text;

namespace InvestorManagementSystem.Application.Services;

public class AuthService : IAuthService
{
    private readonly IInvestorRepository _investorRepository;
    private readonly JwtService _jwtService;
    private readonly ILogger<AuthService> _logger;
    private readonly Dictionary<string, string> _refreshTokens = new(); // In production, use Redis or database

    public AuthService(
        IInvestorRepository investorRepository,
        JwtService jwtService,
        ILogger<AuthService> logger)
    {
        _investorRepository = investorRepository;
        _jwtService = jwtService;
        _logger = logger;
    }

    public async Task<AuthResponseDto?> LoginAsync(LoginDto loginDto)
    {
        try
        {
            _logger.LogInformation("Attempting login for email: {Email}", loginDto.Email);

            var investor = await _investorRepository.GetByEmailAsync(loginDto.Email);
            if (investor == null)
            {
                _logger.LogWarning("Login failed: Investor not found for email {Email}", loginDto.Email);
                return null;
            }

            if (!VerifyPassword(loginDto.Password, investor.PasswordHash, investor.PasswordSalt))
            {
                _logger.LogWarning("Login failed: Invalid password for email {Email}", loginDto.Email);
                return null;
            }

            if (investor.Status != InvestorStatus.Active)
            {
                _logger.LogWarning("Login failed: Account not active for email {Email}", loginDto.Email);
                return null;
            }

            var token = _jwtService.GenerateToken(investor);
            var refreshToken = _jwtService.GenerateRefreshToken();
            var expiresAt = DateTime.UtcNow.AddMinutes(60);

            // Store refresh token (in production, store in database)
            _refreshTokens[refreshToken] = investor.Id.ToString();

            // Update last login
            investor.LastLoginAt = DateTime.UtcNow;
            await _investorRepository.UpdateAsync(investor);

            _logger.LogInformation("Login successful for investor {InvestorId}", investor.Id);

            return new AuthResponseDto
            {
                Token = token,
                RefreshToken = refreshToken,
                ExpiresAt = expiresAt,
                Investor = new InvestorDto
                {
                    Id = investor.Id,
                    FirstName = investor.FirstName,
                    LastName = investor.LastName,
                    Email = investor.Email,
                    PhoneNumber = investor.PhoneNumber,
                    DateOfBirth = investor.DateOfBirth,
                    Nationality = investor.Nationality,
                    IdNumber = investor.IdNumber,
                    Status = investor.Status,
                    CreatedAt = investor.CreatedAt,
                    UpdatedAt = investor.UpdatedAt,
                    LastLoginAt = investor.LastLoginAt
                }
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during login for email {Email}", loginDto.Email);
            return null;
        }
    }

    public async Task<AuthResponseDto?> RegisterAsync(RegisterDto registerDto)
    {
        try
        {
            _logger.LogInformation("Attempting registration for email: {Email}", registerDto.Email);

            // Check if investor already exists
            var existingInvestor = await _investorRepository.GetByEmailAsync(registerDto.Email);
            if (existingInvestor != null)
            {
                _logger.LogWarning("Registration failed: Email already exists {Email}", registerDto.Email);
                return null;
            }

            // Create password hash
            var (passwordHash, passwordSalt) = CreatePasswordHash(registerDto.Password);

            var investor = new Investor
            {
                Id = Guid.NewGuid(),
                FirstName = registerDto.FirstName,
                LastName = registerDto.LastName,
                Email = registerDto.Email,
                PhoneNumber = registerDto.PhoneNumber,
                DateOfBirth = registerDto.DateOfBirth,
                Nationality = registerDto.Nationality,
                IdNumber = registerDto.IdNumber,
                Status = InvestorStatus.Pending, // Requires verification
                PasswordHash = passwordHash,
                PasswordSalt = passwordSalt,
                CreatedAt = DateTime.UtcNow
            };

            var createdInvestor = await _investorRepository.AddAsync(investor);

            var token = _jwtService.GenerateToken(createdInvestor);
            var refreshToken = _jwtService.GenerateRefreshToken();
            var expiresAt = DateTime.UtcNow.AddMinutes(60);

            // Store refresh token
            _refreshTokens[refreshToken] = createdInvestor.Id.ToString();

            _logger.LogInformation("Registration successful for investor {InvestorId}", createdInvestor.Id);

            return new AuthResponseDto
            {
                Token = token,
                RefreshToken = refreshToken,
                ExpiresAt = expiresAt,
                Investor = new InvestorDto
                {
                    Id = createdInvestor.Id,
                    FirstName = createdInvestor.FirstName,
                    LastName = createdInvestor.LastName,
                    Email = createdInvestor.Email,
                    PhoneNumber = createdInvestor.PhoneNumber,
                    DateOfBirth = createdInvestor.DateOfBirth,
                    Nationality = createdInvestor.Nationality,
                    IdNumber = createdInvestor.IdNumber,
                    Status = createdInvestor.Status,
                    CreatedAt = createdInvestor.CreatedAt,
                    UpdatedAt = createdInvestor.UpdatedAt,
                    LastLoginAt = createdInvestor.LastLoginAt
                }
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during registration for email {Email}", registerDto.Email);
            return null;
        }
    }

    public async Task<AuthResponseDto?> RefreshTokenAsync(string refreshToken)
    {
        try
        {
            if (!_refreshTokens.TryGetValue(refreshToken, out var investorIdString))
            {
                _logger.LogWarning("Refresh token not found");
                return null;
            }

            if (!Guid.TryParse(investorIdString, out var investorId))
            {
                _logger.LogWarning("Invalid investor ID in refresh token");
                return null;
            }

            var investor = await _investorRepository.GetByIdAsync(investorId);
            if (investor == null)
            {
                _logger.LogWarning("Investor not found for refresh token");
                return null;
            }

            if (investor.Status != InvestorStatus.Active)
            {
                _logger.LogWarning("Account not active for refresh token");
                return null;
            }

            var token = _jwtService.GenerateToken(investor);
            var newRefreshToken = _jwtService.GenerateRefreshToken();
            var expiresAt = DateTime.UtcNow.AddMinutes(60);

            // Remove old refresh token and add new one
            _refreshTokens.Remove(refreshToken);
            _refreshTokens[newRefreshToken] = investorIdString;

            return new AuthResponseDto
            {
                Token = token,
                RefreshToken = newRefreshToken,
                ExpiresAt = expiresAt,
                Investor = new InvestorDto
                {
                    Id = investor.Id,
                    FirstName = investor.FirstName,
                    LastName = investor.LastName,
                    Email = investor.Email,
                    PhoneNumber = investor.PhoneNumber,
                    DateOfBirth = investor.DateOfBirth,
                    Nationality = investor.Nationality,
                    IdNumber = investor.IdNumber,
                    Status = investor.Status,
                    CreatedAt = investor.CreatedAt,
                    UpdatedAt = investor.UpdatedAt,
                    LastLoginAt = investor.LastLoginAt
                }
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during token refresh");
            return null;
        }
    }

    public async Task<bool> ChangePasswordAsync(Guid investorId, ChangePasswordDto changePasswordDto)
    {
        try
        {
            var investor = await _investorRepository.GetByIdAsync(investorId);
            if (investor == null)
            {
                _logger.LogWarning("Investor not found for password change {InvestorId}", investorId);
                return false;
            }

            if (!VerifyPassword(changePasswordDto.CurrentPassword, investor.PasswordHash, investor.PasswordSalt))
            {
                _logger.LogWarning("Invalid current password for investor {InvestorId}", investorId);
                return false;
            }

            var (passwordHash, passwordSalt) = CreatePasswordHash(changePasswordDto.NewPassword);
            investor.PasswordHash = passwordHash;
            investor.PasswordSalt = passwordSalt;
            investor.UpdatedAt = DateTime.UtcNow;

            await _investorRepository.UpdateAsync(investor);

            _logger.LogInformation("Password changed successfully for investor {InvestorId}", investorId);
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error changing password for investor {InvestorId}", investorId);
            return false;
        }
    }

    public async Task<bool> LogoutAsync(string refreshToken)
    {
        try
        {
            _refreshTokens.Remove(refreshToken);
            _logger.LogInformation("Logout successful");
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during logout");
            return false;
        }
    }

    public async Task<bool> ValidateTokenAsync(string token)
    {
        return _jwtService.ValidateToken(token);
    }

    private static (string hash, string salt) CreatePasswordHash(string password)
    {
        using var hmac = new HMACSHA512();
        var salt = Convert.ToBase64String(hmac.Key);
        var hash = Convert.ToBase64String(hmac.ComputeHash(Encoding.UTF8.GetBytes(password)));
        return (hash, salt);
    }

    private static bool VerifyPassword(string password, string hash, string salt)
    {
        using var hmac = new HMACSHA512(Convert.FromBase64String(salt));
        var computedHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(password));
        var hashBytes = Convert.FromBase64String(hash);
        return computedHash.SequenceEqual(hashBytes);
    }
}
