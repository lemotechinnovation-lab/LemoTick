using System;
using System.Collections.Generic;

namespace InvestorManagementSystem.Core.Entities;

public class Notification
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string Type { get; set; } = string.Empty; // trade_alert, kyc_update, etc.
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public string? Icon { get; set; }
    public string? IconColor { get; set; }
    public string? Link { get; set; }
    public bool IsRead { get; set; }
    public DateTime CreatedAt { get; set; }
    public string? MetadataJson { get; set; } // JSON string for metadata
}
