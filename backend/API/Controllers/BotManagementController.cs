using InvestorManagementSystem.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace InvestorManagementSystem.API.Controllers;

/// <summary>
/// Bot management and control endpoints
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize] // Require authentication
public class BotManagementController : ControllerBase
{
    private readonly IBotManagementService _botManagementService;
    private readonly ILogger<BotManagementController> _logger;

    public BotManagementController(
        IBotManagementService botManagementService,
        ILogger<BotManagementController> logger)
    {
        _botManagementService = botManagementService;
        _logger = logger;
    }

    /// <summary>
    /// Get current bot status
    /// </summary>
    [HttpGet("status")]
    public async Task<ActionResult<BotStatusResult>> GetStatus()
    {
        try
        {
            var status = await _botManagementService.GetStatusAsync();
            return Ok(status);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting bot status");
            return StatusCode(500, new { message = "Error getting bot status", error = ex.Message });
        }
    }

    /// <summary>
    /// Start the trading bot
    /// </summary>
    [HttpPost("start")]
    public async Task<ActionResult<BotCommandResult>> StartBot()
    {
        try
        {
            _logger.LogInformation("Start bot command received");
            var result = await _botManagementService.StartBotAsync();

            if (result.Success)
                return Ok(result);
            else
                return BadRequest(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error starting bot");
            return StatusCode(500, new BotCommandResult
            {
                Success = false,
                Message = $"Error starting bot: {ex.Message}"
            });
        }
    }

    /// <summary>
    /// Stop the trading bot
    /// </summary>
    [HttpPost("stop")]
    public async Task<ActionResult<BotCommandResult>> StopBot()
    {
        try
        {
            _logger.LogInformation("Stop bot command received");
            var result = await _botManagementService.StopBotAsync();

            if (result.Success)
                return Ok(result);
            else
                return BadRequest(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error stopping bot");
            return StatusCode(500, new BotCommandResult
            {
                Success = false,
                Message = $"Error stopping bot: {ex.Message}"
            });
        }
    }

    /// <summary>
    /// Restart the trading bot
    /// </summary>
    [HttpPost("restart")]
    public async Task<ActionResult<BotCommandResult>> RestartBot()
    {
        try
        {
            _logger.LogInformation("Restart bot command received");
            var result = await _botManagementService.RestartBotAsync();

            if (result.Success)
                return Ok(result);
            else
                return BadRequest(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error restarting bot");
            return StatusCode(500, new BotCommandResult
            {
                Success = false,
                Message = $"Error restarting bot: {ex.Message}"
            });
        }
    }

    /// <summary>
    /// Get bot metrics
    /// </summary>
    [HttpGet("metrics")]
    public async Task<ActionResult<BotMetrics>> GetMetrics()
    {
        try
        {
            var metrics = await _botManagementService.GetMetricsAsync();

            if (metrics != null)
                return Ok(metrics);
            else
                return NotFound(new { message = "Bot metrics not available" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting bot metrics");
            return StatusCode(500, new { message = "Error getting bot metrics", error = ex.Message });
        }
    }
}

