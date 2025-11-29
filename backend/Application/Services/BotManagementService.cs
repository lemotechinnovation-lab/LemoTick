using System.Diagnostics;
using System.Net.Sockets;
using System.Text.Json;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace InvestorManagementSystem.Application.Services;

/// <summary>
/// Service for managing the trading bot lifecycle and status
/// </summary>
public interface IBotManagementService
{
    Task<BotStatusResult> GetStatusAsync();
    Task<BotCommandResult> StartBotAsync();
    Task<BotCommandResult> StopBotAsync();
    Task<BotCommandResult> RestartBotAsync();
    Task<BotMetrics?> GetMetricsAsync();
}

public class BotManagementService : IBotManagementService
{
    private readonly ILogger<BotManagementService> _logger;
    private readonly string _botDirectory;
    private readonly string _pythonExecutable;
    private Process? _botProcess;

    public BotManagementService(ILogger<BotManagementService> logger, IConfiguration configuration)
    {
        _logger = logger;

        // Get bot directory from configuration or use default
        _botDirectory = configuration["Bot:Directory"] ?? Path.Combine(Directory.GetCurrentDirectory(), "..", "..", "bot");
        _pythonExecutable = configuration["Bot:PythonExecutable"] ?? "python";

        _logger.LogInformation($"Bot directory: {_botDirectory}");
    }

    public async Task<BotStatusResult> GetStatusAsync()
    {
        try
        {
            var status = new BotStatusResult
            {
                IsRunning = IsBotRunning(),
                StartedAt = null, // TODO: Track start time
                Uptime = null,
                ProcessId = _botProcess?.Id
            };

            // Try to get metrics from Prometheus endpoint
            var metrics = await GetMetricsAsync();
            if (metrics != null)
            {
                status.IsHealthy = true;
                status.CurrentMetrics = metrics;
            }

            return status;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting bot status");
            return new BotStatusResult
            {
                IsRunning = false,
                IsHealthy = false,
                ErrorMessage = ex.Message
            };
        }
    }

    public async Task<BotCommandResult> StartBotAsync()
    {
        try
        {
            if (IsBotRunning())
            {
                return new BotCommandResult
                {
                    Success = false,
                    Message = "Bot is already running"
                };
            }

            // Verify bot directory exists
            if (!Directory.Exists(_botDirectory))
            {
                return new BotCommandResult
                {
                    Success = false,
                    Message = $"Bot directory not found: {_botDirectory}"
                };
            }

            // Start bot process
            var startInfo = new ProcessStartInfo
            {
                FileName = _pythonExecutable,
                Arguments = "run_bot.py",
                WorkingDirectory = _botDirectory,
                UseShellExecute = false,
                RedirectStandardOutput = true,
                RedirectStandardError = true,
                CreateNoWindow = true
            };

            // Set environment variables for the bot
            startInfo.EnvironmentVariables["PROMETHEUS_PORT"] = "9092";

            _botProcess = new Process { StartInfo = startInfo };

            // Capture output
            _botProcess.OutputDataReceived += (sender, args) =>
            {
                if (!string.IsNullOrEmpty(args.Data))
                    _logger.LogInformation($"[BOT] {args.Data}");
            };

            _botProcess.ErrorDataReceived += (sender, args) =>
            {
                if (!string.IsNullOrEmpty(args.Data))
                    _logger.LogError($"[BOT ERROR] {args.Data}");
            };

            _botProcess.Start();
            _botProcess.BeginOutputReadLine();
            _botProcess.BeginErrorReadLine();

            // Wait a bit to check if process started successfully
            await Task.Delay(2000);

            if (_botProcess.HasExited)
            {
                return new BotCommandResult
                {
                    Success = false,
                    Message = $"Bot process exited immediately with code {_botProcess.ExitCode}"
                };
            }

            _logger.LogInformation($"Bot started successfully with PID {_botProcess.Id}");

            return new BotCommandResult
            {
                Success = true,
                Message = $"Bot started successfully (PID: {_botProcess.Id})"
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error starting bot");
            return new BotCommandResult
            {
                Success = false,
                Message = $"Error starting bot: {ex.Message}"
            };
        }
    }

    public async Task<BotCommandResult> StopBotAsync()
    {
        try
        {
            if (!IsBotRunning())
            {
                return new BotCommandResult
                {
                    Success = false,
                    Message = "Bot is not running"
                };
            }

            if (_botProcess != null)
            {
                _botProcess.Kill(true); // Kill entire process tree
                await _botProcess.WaitForExitAsync();
                _botProcess.Dispose();
                _botProcess = null;

                _logger.LogInformation("Bot stopped successfully");

                return new BotCommandResult
                {
                    Success = true,
                    Message = "Bot stopped successfully"
                };
            }

            return new BotCommandResult
            {
                Success = false,
                Message = "Bot process reference not found"
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error stopping bot");
            return new BotCommandResult
            {
                Success = false,
                Message = $"Error stopping bot: {ex.Message}"
            };
        }
    }

    public async Task<BotCommandResult> RestartBotAsync()
    {
        try
        {
            var stopResult = await StopBotAsync();
            if (!stopResult.Success && IsBotRunning())
            {
                return stopResult;
            }

            // Wait a bit before restarting
            await Task.Delay(2000);

            var startResult = await StartBotAsync();
            return startResult;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error restarting bot");
            return new BotCommandResult
            {
                Success = false,
                Message = $"Error restarting bot: {ex.Message}"
            };
        }
    }

    public async Task<BotMetrics?> GetMetricsAsync()
    {
        try
        {
            // Try to fetch metrics from Prometheus endpoint
            using (var httpClient = new HttpClient())
            {
                httpClient.Timeout = TimeSpan.FromSeconds(3); // Reduced timeout for faster response

                // Try Prometheus port 9092
                try
                {
                    _logger.LogDebug("Attempting to fetch metrics from Prometheus on port 9092");
                    var response = await httpClient.GetAsync("http://localhost:9092/metrics");
                    if (!response.IsSuccessStatusCode)
                    {
                        _logger.LogWarning($"Prometheus metrics endpoint returned non-success status code: {response.StatusCode}");
                        return null;
                    }

                    var content = await response.Content.ReadAsStringAsync();

                    // Parse Prometheus metrics format
                    var metrics = ParsePrometheusMetrics(content);
                    return metrics;
                }
                catch (HttpRequestException ex) when (ex.InnerException is SocketException)
                {
                    _logger.LogWarning("Prometheus metrics endpoint connection refused");
                    return null;
                }
                catch (Exception ex)
                {
                    _logger.LogWarning($"Error fetching metrics from Prometheus: {ex.Message}");
                    return null;
                }
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Could not fetch bot metrics");
            return null;
        }
    }

    private bool IsBotRunning()
    {
        if (_botProcess == null)
            return false;

        try
        {
            return !_botProcess.HasExited;
        }
        catch
        {
            return false;
        }
    }

    private BotMetrics ParsePrometheusMetrics(string content)
    {
        var metrics = new BotMetrics();
        var lines = content.Split('\n');

        foreach (var line in lines)
        {
            if (line.StartsWith("#") || string.IsNullOrWhiteSpace(line))
                continue;

            var parts = line.Split(' ');
            if (parts.Length < 2)
                continue;

            var metricName = parts[0];
            if (!double.TryParse(parts[1], out var value))
                continue;

            // Map known metrics
            switch (metricName)
            {
                case "bot_total_trades":
                    metrics.TotalTrades = (int)value;
                    break;
                case "bot_winning_trades":
                    metrics.WinningTrades = (int)value;
                    break;
                case "bot_losing_trades":
                    metrics.LosingTrades = (int)value;
                    break;
                case "bot_win_rate":
                    metrics.WinRate = value;
                    break;
                case "bot_total_profit":
                    metrics.TotalProfit = (decimal)value;
                    break;
                case "bot_total_loss":
                    metrics.TotalLoss = (decimal)value;
                    break;
                case "bot_balance":
                    metrics.CurrentBalance = (decimal)value;
                    break;
                case "bot_active_trades":
                    metrics.ActiveTrades = (int)value;
                    break;
            }
        }

        return metrics;
    }
}

// DTOs
public class BotStatusResult
{
    public bool IsRunning { get; set; }
    public bool IsHealthy { get; set; }
    public DateTime? StartedAt { get; set; }
    public TimeSpan? Uptime { get; set; }
    public int? ProcessId { get; set; }
    public string? ErrorMessage { get; set; }
    public BotMetrics? CurrentMetrics { get; set; }
}

public class BotCommandResult
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
}

public class BotMetrics
{
    public int TotalTrades { get; set; }
    public int WinningTrades { get; set; }
    public int LosingTrades { get; set; }
    public double WinRate { get; set; }
    public decimal TotalProfit { get; set; }
    public decimal TotalLoss { get; set; }
    public decimal CurrentBalance { get; set; }
    public int ActiveTrades { get; set; }
}
