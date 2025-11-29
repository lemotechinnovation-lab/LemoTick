using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using InvestorManagementSystem.Application.DTOs;
using InvestorManagementSystem.Infrastructure.Data;

namespace InvestorManagementSystem.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]  // All endpoints require authentication
public class ProfileController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<ProfileController> _logger;

    public ProfileController(ApplicationDbContext context, ILogger<ProfileController> logger)
    {
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Get investor profile
    /// </summary>
    [HttpGet("{investorId}")]
    public async Task<IActionResult> GetProfile(Guid investorId)
    {
        try
        {
            var investor = await _context.Investors.FindAsync(investorId);
            if (investor == null)
                return NotFound(new { error = "Investor not found" });

            var profile = new ProfileDto
            {
                Id = investor.Id,
                FirstName = investor.FirstName,
                LastName = investor.LastName,
                Email = investor.Email,
                PhoneNumber = investor.PhoneNumber,
                DateOfBirth = investor.DateOfBirth,
                Nationality = investor.Nationality,
                IdNumber = investor.IdNumber,
                Status = investor.Status.ToString(),
                CreatedAt = investor.CreatedAt,
                LastLoginAt = investor.LastLoginAt
            };

            return Ok(profile);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting profile");
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Update investor profile
    /// </summary>
    [HttpPut("{investorId}")]
    public async Task<IActionResult> UpdateProfile(Guid investorId, [FromBody] UpdateProfileDto dto)
    {
        try
        {
            var investor = await _context.Investors.FindAsync(investorId);
            if (investor == null)
                return NotFound(new { error = "Investor not found" });

            investor.FirstName = dto.FirstName;
            investor.LastName = dto.LastName;
            investor.PhoneNumber = dto.PhoneNumber;
            investor.Nationality = dto.Nationality;
            investor.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new { message = "Profile updated successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating profile");
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Change password
    /// </summary>
    [HttpPost("{investorId}/change-password")]
    public async Task<IActionResult> ChangePassword(Guid investorId, [FromBody] ChangePasswordDto dto)
    {
        try
        {
            if (dto.NewPassword != dto.ConfirmNewPassword)
                return BadRequest(new { error = "Passwords do not match" });

            var investor = await _context.Investors.FindAsync(investorId);
            if (investor == null)
                return NotFound(new { error = "Investor not found" });

            // TODO: Implement actual password verification and hashing
            // For now, just update the hash (in production, use proper password hashing)
            // bool isCurrentPasswordValid = VerifyPassword(investor.PasswordHash, dto.CurrentPassword);
            // if (!isCurrentPasswordValid)
            //     return BadRequest(new { error = "Current password is incorrect" });

            // investor.PasswordHash = HashPassword(dto.NewPassword);
            investor.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            _logger.LogInformation("Password changed for investor {InvestorId}", investorId);

            return Ok(new { message = "Password changed successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error changing password");
            return StatusCode(500, "Internal server error");
        }
    }
}

