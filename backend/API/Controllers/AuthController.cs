using Microsoft.AspNetCore.Mvc;
using MediatR;
using InvestorManagementSystem.Application.Commands.Auth;
using InvestorManagementSystem.Application.DTOs;

namespace InvestorManagementSystem.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly ILogger<AuthController> _logger;

    public AuthController(IMediator mediator, ILogger<AuthController> logger)
    {
        _mediator = mediator;
        _logger = logger;
    }

    /// <summary>
    /// Login investor
    /// </summary>
    [HttpPost("login")]
    public async Task<ActionResult<AuthResponseDto>> Login([FromBody] LoginDto loginDto)
    {
        try
        {
            var result = await _mediator.Send(new LoginCommand(loginDto));
            if (result == null)
                return Unauthorized(new { message = "Invalid email or password" });

            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during login");
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Register new investor
    /// </summary>
    [HttpPost("register")]
    public async Task<ActionResult<AuthResponseDto>> Register([FromBody] RegisterDto registerDto)
    {
        try
        {
            var result = await _mediator.Send(new RegisterCommand(registerDto));
            if (result == null)
                return BadRequest(new { message = "Registration failed. Email may already exist." });

            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during registration");
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Refresh access token
    /// </summary>
    [HttpPost("refresh")]
    public async Task<ActionResult<AuthResponseDto>> RefreshToken([FromBody] RefreshTokenDto refreshTokenDto)
    {
        try
        {
            var result = await _mediator.Send(new RefreshTokenCommand(refreshTokenDto));
            if (result == null)
                return Unauthorized(new { message = "Invalid refresh token" });

            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during token refresh");
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Change password
    /// </summary>
    [HttpPost("change-password")]
    public async Task<ActionResult> ChangePassword([FromBody] ChangePasswordDto changePasswordDto)
    {
        try
        {
            // Get investor ID from JWT token
            var investorIdClaim = User.FindFirst("investor_id")?.Value;
            if (string.IsNullOrEmpty(investorIdClaim) || !Guid.TryParse(investorIdClaim, out var investorId))
            {
                return Unauthorized(new { message = "Invalid token" });
            }

            var result = await _mediator.Send(new ChangePasswordCommand(investorId, changePasswordDto));
            if (!result)
                return BadRequest(new { message = "Password change failed" });

            return Ok(new { message = "Password changed successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during password change");
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Logout
    /// </summary>
    [HttpPost("logout")]
    public async Task<ActionResult> Logout([FromBody] RefreshTokenDto refreshTokenDto)
    {
        try
        {
            // In a real implementation, you would invalidate the refresh token
            return Ok(new { message = "Logged out successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during logout");
            return StatusCode(500, "Internal server error");
        }
    }
}
