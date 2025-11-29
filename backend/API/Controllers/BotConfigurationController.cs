using InvestorManagementSystem.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace InvestorManagementSystem.API.Controllers;

/// <summary>
/// Request model for raw YAML configuration update
/// </summary>
public class YamlConfigRequest
{
    public string yaml { get; set; } = string.Empty;
}

/// <summary>
/// Bot configuration management endpoints
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize] // Require authentication
public class BotConfigurationController : ControllerBase
{
    private readonly IBotConfigurationService _botConfigurationService;
    private readonly ILogger<BotConfigurationController> _logger;

    public BotConfigurationController(
        IBotConfigurationService botConfigurationService,
        ILogger<BotConfigurationController> logger)
    {
        _botConfigurationService = botConfigurationService;
        _logger = logger;
    }

    /// <summary>
    /// Get current bot configuration (structured)
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<Dictionary<string, object>>> GetConfiguration()
    {
        try
        {
            var config = await _botConfigurationService.GetConfigurationAsync();

            if (config != null)
                return Ok(config);
            else
                return NotFound(new { message = "Bot configuration not found" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting bot configuration");
            return StatusCode(500, new { message = "Error getting bot configuration", error = ex.Message });
        }
    }

    /// <summary>
    /// Get current bot configuration (raw YAML)
    /// </summary>
    [HttpGet("raw")]
    public async Task<ActionResult<string>> GetConfigurationRaw()
    {
        try
        {
            var yaml = await _botConfigurationService.GetConfigurationRawAsync();

            if (yaml != null)
                return Ok(new { yaml });
            else
                return NotFound(new { message = "Bot configuration not found" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting bot configuration");
            return StatusCode(500, new { message = "Error getting bot configuration", error = ex.Message });
        }
    }

    /// <summary>
    /// Update bot configuration (structured)
    /// </summary>
    [HttpPut]
    public async Task<ActionResult<BotCommandResult>> UpdateConfiguration([FromBody] Dictionary<string, object> config)
    {
        try
        {
            _logger.LogInformation("Update bot configuration command received");
            var result = await _botConfigurationService.UpdateConfigurationAsync(config);

            if (result.Success)
                return Ok(result);
            else
                return BadRequest(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating bot configuration");
            return StatusCode(500, new BotCommandResult
            {
                Success = false,
                Message = $"Error updating configuration: {ex.Message}"
            });
        }
    }

    /// <summary>
    /// Update bot configuration (raw YAML) - preserves comments and formatting
    /// </summary>
    [HttpPut("raw")]
    public async Task<ActionResult<BotCommandResult>> UpdateConfigurationRaw([FromBody] YamlConfigRequest request)
    {
        try
        {
            _logger.LogInformation("Update bot configuration (raw) command received");
            _logger.LogInformation($"Received YAML length: {request.yaml?.Length ?? 0}");

            if (string.IsNullOrEmpty(request.yaml))
            {
                return BadRequest(new BotCommandResult
                {
                    Success = false,
                    Message = "YAML content is required"
                });
            }

            var result = await _botConfigurationService.UpdateConfigurationRawAsync(request.yaml);

            if (result.Success)
                return Ok(result);
            else
                return BadRequest(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating bot configuration (raw)");
            return StatusCode(500, new BotCommandResult
            {
                Success = false,
                Message = $"Error updating configuration: {ex.Message}"
            });
        }
    }

    /// <summary>
    /// Reset bot configuration to backup
    /// </summary>
    [HttpPost("reset")]
    public async Task<ActionResult<BotCommandResult>> ResetConfiguration()
    {
        try
        {
            _logger.LogInformation("Reset bot configuration command received");
            var result = await _botConfigurationService.ResetConfigurationAsync();

            if (result.Success)
                return Ok(result);
            else
                return BadRequest(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error resetting bot configuration");
            return StatusCode(500, new BotCommandResult
            {
                Success = false,
                Message = $"Error resetting configuration: {ex.Message}"
            });
        }
    }
}

