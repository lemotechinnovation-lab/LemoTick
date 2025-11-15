using System.ComponentModel.DataAnnotations;

namespace InvestorManagementSystem.Core.Entities;

/// <summary>
/// Represents a trade executed by the bot
/// </summary>
public class Trade
{
    public Guid Id { get; set; }
    
    [Required]
    public Guid PortfolioId { get; set; }
    
    [Required]
    [StringLength(50)]
    public string Symbol { get; set; } = string.Empty;
    
    [Required]
    public TradeType Type { get; set; }
    
    [Required]
    public TradeDirection Direction { get; set; }
    
    [Required]
    public decimal Amount { get; set; }
    
    [Required]
    public decimal EntryPrice { get; set; }
    
    public decimal? ExitPrice { get; set; }
    
    [Required]
    public decimal Stake { get; set; }
    
    public decimal? Profit { get; set; }
    
    public decimal? Loss { get; set; }
    
    [Required]
    public TradeStatus Status { get; set; } = TradeStatus.Open;
    
    [Required]
    public DateTime EntryTime { get; set; } = DateTime.UtcNow;
    
    public DateTime? ExitTime { get; set; }
    
    [StringLength(1000)]
    public string? Notes { get; set; }
    
    [StringLength(100)]
    public string? Strategy { get; set; }
    
    [StringLength(50)]
    public string? Signal { get; set; }
    
    // Risk management
    public decimal? StopLoss { get; set; }
    public decimal? TakeProfit { get; set; }
    
    // Bot integration
    [StringLength(100)]
    public string? BotId { get; set; }
    
    [StringLength(100)]
    public string? ExternalTradeId { get; set; }
    
    // Navigation properties
    public virtual Portfolio Portfolio { get; set; } = null!;
}

/// <summary>
/// Trade type enumeration
/// </summary>
public enum TradeType
{
    BinaryOption = 0,
    CFD = 1,
    Forex = 2,
    Crypto = 3,
    Stock = 4
}

/// <summary>
/// Trade direction enumeration
/// </summary>
public enum TradeDirection
{
    Buy = 0,
    Sell = 1,
    Rise = 2,
    Fall = 3
}

/// <summary>
/// Trade status enumeration
/// </summary>
public enum TradeStatus
{
    Open = 0,
    Closed = 1,
    Cancelled = 2,
    Expired = 3,
    Failed = 4
}
