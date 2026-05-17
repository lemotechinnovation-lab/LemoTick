using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using InvestorManagementSystem.Application.DTOs;
using InvestorManagementSystem.Core.Entities;
using InvestorManagementSystem.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace InvestorManagementSystem.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class NotificationController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<NotificationController> _logger;

    public NotificationController(
        ApplicationDbContext context,
        ILogger<NotificationController> logger)
    {
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Get all notifications for the current user
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<List<NotificationDto>>> GetNotifications([FromQuery] int limit = 50)
    {
        try
        {
            var userId = GetCurrentUserId();

            var notifications = await _context.Set<Notification>()
                .Where(n => n.UserId == userId)
                .OrderByDescending(n => n.CreatedAt)
                .Take(limit)
                .ToListAsync();

            var dtos = notifications.Select(n => new NotificationDto
            {
                Id = n.Id,
                Type = Enum.Parse<NotificationType>(n.Type, true),
                Title = n.Title,
                Message = n.Message,
                Icon = n.Icon,
                IconColor = n.IconColor,
                Link = n.Link,
                IsRead = n.IsRead,
                CreatedAt = n.CreatedAt,
                Metadata = string.IsNullOrEmpty(n.MetadataJson)
                    ? null
                    : JsonSerializer.Deserialize<Dictionary<string, object>>(n.MetadataJson)
            }).ToList();

            return Ok(dtos);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting notifications");
            return StatusCode(500, new { error = "Internal server error" });
        }
    }

    /// <summary>
    /// Get notification statistics
    /// </summary>
    [HttpGet("stats")]
    public async Task<ActionResult<NotificationStatsDto>> GetStats()
    {
        try
        {
            var userId = GetCurrentUserId();

            var totalCount = await _context.Set<Notification>()
                .Where(n => n.UserId == userId)
                .CountAsync();

            var unreadCount = await _context.Set<Notification>()
                .Where(n => n.UserId == userId && !n.IsRead)
                .CountAsync();

            return Ok(new NotificationStatsDto
            {
                TotalCount = totalCount,
                UnreadCount = unreadCount
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting notification stats");
            return StatusCode(500, new { error = "Internal server error" });
        }
    }

    /// <summary>
    /// Mark a notification as read
    /// </summary>
    [HttpPost("{id}/read")]
    public async Task<IActionResult> MarkAsRead(Guid id)
    {
        try
        {
            var userId = GetCurrentUserId();

            var notification = await _context.Set<Notification>()
                .FirstOrDefaultAsync(n => n.Id == id && n.UserId == userId);

            if (notification == null)
                return NotFound(new { error = "Notification not found" });

            notification.IsRead = true;
            await _context.SaveChangesAsync();

            return Ok(new { message = "Notification marked as read" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error marking notification as read");
            return StatusCode(500, new { error = "Internal server error" });
        }
    }

    /// <summary>
    /// Mark all notifications as read
    /// </summary>
    [HttpPost("read-all")]
    public async Task<IActionResult> MarkAllAsRead()
    {
        try
        {
            var userId = GetCurrentUserId();

            await _context.Set<Notification>()
                .Where(n => n.UserId == userId && !n.IsRead)
                .ExecuteUpdateAsync(setters => setters.SetProperty(n => n.IsRead, true));

            return Ok(new { message = "All notifications marked as read" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error marking all notifications as read");
            return StatusCode(500, new { error = "Internal server error" });
        }
    }

    /// <summary>
    /// Delete a notification
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteNotification(Guid id)
    {
        try
        {
            var userId = GetCurrentUserId();

            var notification = await _context.Set<Notification>()
                .FirstOrDefaultAsync(n => n.Id == id && n.UserId == userId);

            if (notification == null)
                return NotFound(new { error = "Notification not found" });

            _context.Set<Notification>().Remove(notification);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Notification deleted" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting notification");
            return StatusCode(500, new { error = "Internal server error" });
        }
    }

    /// <summary>
    /// Clear all notifications
    /// </summary>
    [HttpDelete("clear")]
    public async Task<IActionResult> ClearAll()
    {
        try
        {
            var userId = GetCurrentUserId();

            await _context.Set<Notification>()
                .Where(n => n.UserId == userId)
                .ExecuteDeleteAsync();

            return Ok(new { message = "All notifications cleared" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error clearing notifications");
            return StatusCode(500, new { error = "Internal server error" });
        }
    }

    /// <summary>
    /// Create a notification (for testing or admin use)
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<NotificationDto>> CreateNotification([FromBody] CreateNotificationDto dto)
    {
        try
        {
            var userId = GetCurrentUserId();

            var notification = new Notification
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                Type = dto.Type.ToString().ToLower(),
                Title = dto.Title,
                Message = dto.Message,
                Icon = dto.Icon,
                IconColor = dto.IconColor,
                Link = dto.Link,
                IsRead = false,
                CreatedAt = DateTime.UtcNow,
                MetadataJson = dto.Metadata != null ? JsonSerializer.Serialize(dto.Metadata) : null
            };

            _context.Set<Notification>().Add(notification);
            await _context.SaveChangesAsync();

            var result = new NotificationDto
            {
                Id = notification.Id,
                Type = dto.Type,
                Title = notification.Title,
                Message = notification.Message,
                Icon = notification.Icon,
                IconColor = notification.IconColor,
                Link = notification.Link,
                IsRead = notification.IsRead,
                CreatedAt = notification.CreatedAt,
                Metadata = dto.Metadata
            };

            return CreatedAtAction(nameof(GetNotifications), result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating notification");
            return StatusCode(500, new { error = "Internal server error" });
        }
    }

    private Guid GetCurrentUserId()
    {
        var userIdClaim = User.FindFirstValue("investor_id");
        if (string.IsNullOrEmpty(userIdClaim))
            throw new UnauthorizedAccessException("User ID not found in token");

        return Guid.Parse(userIdClaim);
    }
}
