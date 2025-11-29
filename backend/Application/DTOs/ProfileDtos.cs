namespace InvestorManagementSystem.Application.DTOs;

/// <summary>
/// Investor profile information
/// </summary>
public class ProfileDto
{
    public Guid Id { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public DateTime DateOfBirth { get; set; }
    public string Nationality { get; set; } = string.Empty;
    public string IdNumber { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime? LastLoginAt { get; set; }
}

/// <summary>
/// Update profile DTO
/// </summary>
public class UpdateProfileDto
{
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public string Nationality { get; set; } = string.Empty;
}

/// <summary>
/// Notification preferences DTO
/// </summary>
public class NotificationPreferencesDto
{
    public bool EmailNotifications { get; set; }
    public bool PushNotifications { get; set; }
    public bool TradeAlerts { get; set; }
    public bool RiskAlerts { get; set; }
    public bool PerformanceReports { get; set; }
}

