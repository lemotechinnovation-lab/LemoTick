using Microsoft.AspNetCore.Mvc;
using MediatR;
using InvestorManagementSystem.Application.Commands.Notifications;
using InvestorManagementSystem.Application.Queries.Notifications;
using InvestorManagementSystem.Application.DTOs;

namespace InvestorManagementSystem.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class NotificationsController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly ILogger<NotificationsController> _logger;

    public NotificationsController(IMediator mediator, ILogger<NotificationsController> logger)
    {
        _mediator = mediator;
        _logger = logger;
    }

    /// <summary>
    /// Get all notifications
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<NotificationDto>>> GetNotifications()
    {
        try
        {
            var notifications = await _mediator.Send(new GetAllNotificationsQuery());
            return Ok(notifications);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving notifications");
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Get notification by ID
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<NotificationDto>> GetNotification(Guid id)
    {
        try
        {
            var notification = await _mediator.Send(new GetNotificationByIdQuery(id));
            if (notification == null)
                return NotFound();

            return Ok(notification);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving notification {NotificationId}", id);
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Create new notification
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<NotificationDto>> CreateNotification([FromBody] CreateNotificationDto createNotificationDto)
    {
        try
        {
            var notification = await _mediator.Send(new CreateNotificationCommand(createNotificationDto));
            return CreatedAtAction(nameof(GetNotification), new { id = notification.Id }, notification);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating notification");
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Get notifications by investor ID
    /// </summary>
    [HttpGet("investor/{investorId}")]
    public async Task<ActionResult<IEnumerable<NotificationDto>>> GetNotificationsByInvestor(Guid investorId)
    {
        try
        {
            var notifications = await _mediator.Send(new GetNotificationsByInvestorQuery(investorId));
            return Ok(notifications);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving notifications for investor {InvestorId}", investorId);
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Get unread notifications by investor ID
    /// </summary>
    [HttpGet("investor/{investorId}/unread")]
    public async Task<ActionResult<IEnumerable<NotificationDto>>> GetUnreadNotificationsByInvestor(Guid investorId)
    {
        try
        {
            var notifications = await _mediator.Send(new GetUnreadNotificationsByInvestorQuery(investorId));
            return Ok(notifications);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving unread notifications for investor {InvestorId}", investorId);
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Mark notification as read
    /// </summary>
    [HttpPut("{id}/mark-as-read")]
    public async Task<ActionResult> MarkAsRead(Guid id)
    {
        try
        {
            var result = await _mediator.Send(new MarkNotificationAsReadCommand(id));
            if (!result)
                return NotFound();

            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error marking notification as read {NotificationId}", id);
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Mark all notifications as read for an investor
    /// </summary>
    [HttpPut("investor/{investorId}/mark-all-as-read")]
    public async Task<ActionResult<int>> MarkAllAsRead(Guid investorId)
    {
        try
        {
            var count = await _mediator.Send(new MarkAllNotificationsAsReadCommand(investorId));
            return Ok(new { markedCount = count });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error marking all notifications as read for investor {InvestorId}", investorId);
            return StatusCode(500, "Internal server error");
        }
    }
}

