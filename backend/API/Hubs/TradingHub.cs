using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using System.Security.Claims;

namespace InvestorManagementSystem.API.Hubs;

/// <summary>
/// SignalR Hub for real-time trading updates from Deriv
/// </summary>
[Authorize]
public class TradingHub : Hub
{
    private readonly ILogger<TradingHub> _logger;
    private static readonly Dictionary<string, HashSet<string>> _investorConnections = new();
    private static readonly object _lock = new();

    public TradingHub(ILogger<TradingHub> logger)
    {
        _logger = logger;
    }

    public override async Task OnConnectedAsync()
    {
        var investorId = Context.User?.FindFirst("investor_id")?.Value;

        if (!string.IsNullOrEmpty(investorId))
        {
            lock (_lock)
            {
                if (!_investorConnections.ContainsKey(investorId))
                {
                    _investorConnections[investorId] = new HashSet<string>();
                }
                _investorConnections[investorId].Add(Context.ConnectionId);
            }

            await Groups.AddToGroupAsync(Context.ConnectionId, $"investor_{investorId}");

            _logger.LogInformation("Investor {InvestorId} connected to TradingHub with connection {ConnectionId}",
                investorId, Context.ConnectionId);
        }

        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        var investorId = Context.User?.FindFirst("investor_id")?.Value;

        if (!string.IsNullOrEmpty(investorId))
        {
            lock (_lock)
            {
                if (_investorConnections.ContainsKey(investorId))
                {
                    _investorConnections[investorId].Remove(Context.ConnectionId);
                    if (_investorConnections[investorId].Count == 0)
                    {
                        _investorConnections.Remove(investorId);
                    }
                }
            }

            await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"investor_{investorId}");

            _logger.LogInformation("Investor {InvestorId} disconnected from TradingHub", investorId);
        }

        await base.OnDisconnectedAsync(exception);
    }

    /// <summary>
    /// Subscribe to specific portfolio updates
    /// </summary>
    public async Task SubscribeToPortfolio(Guid portfolioId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, $"portfolio_{portfolioId}");
        _logger.LogInformation("Connection {ConnectionId} subscribed to portfolio {PortfolioId}",
            Context.ConnectionId, portfolioId);
    }

    /// <summary>
    /// Unsubscribe from portfolio updates
    /// </summary>
    public async Task UnsubscribeFromPortfolio(Guid portfolioId)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"portfolio_{portfolioId}");
        _logger.LogInformation("Connection {ConnectionId} unsubscribed from portfolio {PortfolioId}",
            Context.ConnectionId, portfolioId);
    }

    /// <summary>
    /// Subscribe to all trading updates (admin/global view)
    /// </summary>
    public async Task SubscribeToAllTrades()
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, "all_trades");
        _logger.LogInformation("Connection {ConnectionId} subscribed to all trades", Context.ConnectionId);
    }

    /// <summary>
    /// Get connection IDs for a specific investor
    /// </summary>
    public static List<string> GetConnectionIdsForInvestor(string investorId)
    {
        lock (_lock)
        {
            return _investorConnections.TryGetValue(investorId, out var connections)
                ? connections.ToList()
                : new List<string>();
        }
    }

    /// <summary>
    /// Check if investor is online
    /// </summary>
    public static bool IsInvestorOnline(string investorId)
    {
        lock (_lock)
        {
            return _investorConnections.ContainsKey(investorId) &&
                   _investorConnections[investorId].Count > 0;
        }
    }
}

