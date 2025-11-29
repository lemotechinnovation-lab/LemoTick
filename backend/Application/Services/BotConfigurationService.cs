using YamlDotNet.Serialization;
using YamlDotNet.Serialization.NamingConventions;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace InvestorManagementSystem.Application.Services;

/// <summary>
/// Service for managing bot configuration (settings.yaml)
/// </summary>
public interface IBotConfigurationService
{
    Task<Dictionary<string, object>?> GetConfigurationAsync();
    Task<BotCommandResult> UpdateConfigurationAsync(Dictionary<string, object> config);
    Task<BotCommandResult> UpdateConfigurationRawAsync(string yaml);
    Task<BotCommandResult> ResetConfigurationAsync();
    Task<string?> GetConfigurationRawAsync();
}

public class BotConfigurationService : IBotConfigurationService
{
    private readonly ILogger<BotConfigurationService> _logger;
    private readonly string _configFilePath;
    private readonly string _configBackupPath;

    public BotConfigurationService(ILogger<BotConfigurationService> logger, IConfiguration configuration)
    {
        _logger = logger;

        var botDirectory = configuration["Bot:Directory"] ?? Path.Combine(Directory.GetCurrentDirectory(), "..", "..", "bot");
        _configFilePath = Path.Combine(botDirectory, "config", "settings.yaml");
        _configBackupPath = Path.Combine(botDirectory, "config", "settings.backup.yaml");

        _logger.LogInformation($"Bot config file: {_configFilePath}");
    }

    public async Task<Dictionary<string, object>?> GetConfigurationAsync()
    {
        try
        {
            if (!File.Exists(_configFilePath))
            {
                _logger.LogWarning($"Config file not found: {_configFilePath}");
                return null;
            }

            var yaml = await File.ReadAllTextAsync(_configFilePath);

            var deserializer = new DeserializerBuilder()
                .WithNamingConvention(UnderscoredNamingConvention.Instance)
                .Build();

            var config = deserializer.Deserialize<Dictionary<string, object>>(yaml);

            return config;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error reading bot configuration");
            return null;
        }
    }

    public async Task<string?> GetConfigurationRawAsync()
    {
        try
        {
            if (!File.Exists(_configFilePath))
            {
                _logger.LogWarning($"Config file not found: {_configFilePath}");
                return null;
            }

            return await File.ReadAllTextAsync(_configFilePath);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error reading bot configuration");
            return null;
        }
    }

    public async Task<BotCommandResult> UpdateConfigurationAsync(Dictionary<string, object> config)
    {
        try
        {
            // Create backup first
            if (File.Exists(_configFilePath))
            {
                File.Copy(_configFilePath, _configBackupPath, overwrite: true);
                _logger.LogInformation("Configuration backup created");
            }

            // Serialize to YAML
            var serializer = new SerializerBuilder()
                .WithNamingConvention(UnderscoredNamingConvention.Instance)
                .Build();

            var yaml = serializer.Serialize(config);

            // Write to file
            await File.WriteAllTextAsync(_configFilePath, yaml);

            _logger.LogInformation("Bot configuration updated successfully");

            return new BotCommandResult
            {
                Success = true,
                Message = "Configuration updated successfully. Restart bot for changes to take effect."
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating bot configuration");

            // Try to restore backup
            if (File.Exists(_configBackupPath))
            {
                try
                {
                    File.Copy(_configBackupPath, _configFilePath, overwrite: true);
                    _logger.LogInformation("Configuration restored from backup");
                }
                catch
                {
                    // Backup restoration failed
                }
            }

            return new BotCommandResult
            {
                Success = false,
                Message = $"Error updating configuration: {ex.Message}"
            };
        }
    }

    public async Task<BotCommandResult> UpdateConfigurationRawAsync(string yaml)
    {
        try
        {
            // Create backup first
            if (File.Exists(_configFilePath))
            {
                File.Copy(_configFilePath, _configBackupPath, overwrite: true);
                _logger.LogInformation("Configuration backup created");
            }

            // Write raw YAML directly (preserves comments and formatting)
            await File.WriteAllTextAsync(_configFilePath, yaml);

            _logger.LogInformation("Bot configuration updated successfully (raw)");

            return new BotCommandResult
            {
                Success = true,
                Message = "Configuration updated successfully. Restart bot for changes to take effect."
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating bot configuration (raw)");

            // Try to restore backup
            if (File.Exists(_configBackupPath))
            {
                try
                {
                    File.Copy(_configBackupPath, _configFilePath, overwrite: true);
                    _logger.LogInformation("Configuration restored from backup");
                }
                catch
                {
                    // Backup restoration failed
                }
            }

            return new BotCommandResult
            {
                Success = false,
                Message = $"Error updating configuration: {ex.Message}"
            };
        }
    }

    public Task<BotCommandResult> ResetConfigurationAsync()
    {
        try
        {
            if (!File.Exists(_configBackupPath))
            {
                return Task.FromResult(new BotCommandResult
                {
                    Success = false,
                    Message = "No backup configuration found"
                });
            }

            File.Copy(_configBackupPath, _configFilePath, overwrite: true);

            _logger.LogInformation("Configuration reset to backup");

            return Task.FromResult(new BotCommandResult
            {
                Success = true,
                Message = "Configuration reset successfully"
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error resetting configuration");
            return Task.FromResult(new BotCommandResult
            {
                Success = false,
                Message = $"Error resetting configuration: {ex.Message}"
            });
        }
    }
}

