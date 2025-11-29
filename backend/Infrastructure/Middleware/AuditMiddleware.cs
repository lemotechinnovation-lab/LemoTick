using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using Microsoft.EntityFrameworkCore.Diagnostics;
using Microsoft.AspNetCore.Http;
using InvestorManagementSystem.Core.Entities;
using InvestorManagementSystem.Infrastructure.Data;
using System.Text.Json;

namespace InvestorManagementSystem.Infrastructure.Middleware;

/// <summary>
/// Interceptor for automatically creating audit logs for entity changes
/// </summary>
public class AuditInterceptor : SaveChangesInterceptor
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public AuditInterceptor(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    public override InterceptionResult<int> SavingChanges(
        DbContextEventData eventData,
        InterceptionResult<int> result)
    {
        if (eventData.Context is not null)
        {
            CreateAuditLogs(eventData.Context);
        }
        return base.SavingChanges(eventData, result);
    }

    public override async ValueTask<InterceptionResult<int>> SavingChangesAsync(
        DbContextEventData eventData,
        InterceptionResult<int> result,
        CancellationToken cancellationToken = default)
    {
        if (eventData.Context is not null)
        {
            CreateAuditLogs(eventData.Context);
        }
        return await base.SavingChangesAsync(eventData, result, cancellationToken);
    }

    private void CreateAuditLogs(DbContext context)
    {
        var auditEntries = new List<AuditLog>();
        var userId = GetCurrentUserId();
        var ipAddress = GetCurrentIpAddress();
        var timestamp = DateTime.UtcNow;

        foreach (var entry in context.ChangeTracker.Entries())
        {
            // Skip audit logs themselves to avoid recursion
            if (entry.Entity is AuditLog || entry.State == EntityState.Unchanged || entry.State == EntityState.Detached)
                continue;

            var auditLog = new AuditLog
            {
                Id = Guid.NewGuid(),
                EntityType = entry.Entity.GetType().Name,
                Action = entry.State.ToString(),
                UserId = userId != null ? Guid.Parse(userId) : null,
                Timestamp = timestamp,
                IpAddress = ipAddress
            };

            // Capture entity ID
            var keyValue = GetPrimaryKeyValue(entry);
            if (keyValue != null && Guid.TryParse(keyValue.ToString(), out var entityGuid))
            {
                auditLog.EntityId = entityGuid;
            }

            // Capture changes
            if (entry.State == EntityState.Added)
            {
                auditLog.NewValues = SerializeEntity(entry);
            }
            else if (entry.State == EntityState.Modified)
            {
                auditLog.OldValues = SerializeOriginalValues(entry);
                auditLog.NewValues = SerializeCurrentValues(entry);
            }
            else if (entry.State == EntityState.Deleted)
            {
                auditLog.OldValues = SerializeEntity(entry);
            }

            auditEntries.Add(auditLog);
        }

        // Add audit logs to context
        foreach (var auditEntry in auditEntries)
        {
            context.Set<AuditLog>().Add(auditEntry);
        }
    }

    private string? GetCurrentUserId()
    {
        try
        {
            var httpContext = _httpContextAccessor.HttpContext;
            if (httpContext?.User?.Identity?.IsAuthenticated == true)
            {
                var userId = httpContext.User.FindFirst("investor_id")?.Value
                          ?? httpContext.User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
                return userId;
            }
        }
        catch
        {
            // Ignore errors - might be background process
        }
        return null;
    }

    private string? GetCurrentIpAddress()
    {
        try
        {
            var httpContext = _httpContextAccessor.HttpContext;
            if (httpContext != null)
            {
                var ipAddress = httpContext.Connection.RemoteIpAddress?.ToString();
                if (string.IsNullOrEmpty(ipAddress))
                {
                    ipAddress = httpContext.Request.Headers["X-Forwarded-For"].FirstOrDefault()
                              ?? httpContext.Request.Headers["X-Real-IP"].FirstOrDefault();
                }
                return ipAddress;
            }
        }
        catch
        {
            // Ignore errors
        }
        return null;
    }

    private object? GetPrimaryKeyValue(EntityEntry entry)
    {
        var keyName = entry.Metadata.FindPrimaryKey()?.Properties[0]?.Name;
        return keyName != null ? entry.Property(keyName).CurrentValue : null;
    }

    private string? SerializeEntity(EntityEntry entry)
    {
        try
        {
            var properties = entry.CurrentValues.Properties
                .Where(p => !p.IsShadowProperty() && p.Name != "PasswordHash" && p.Name != "PasswordSalt")
                .ToDictionary(
                    p => p.Name,
                    p => entry.CurrentValues[p]
                );
            return JsonSerializer.Serialize(properties);
        }
        catch
        {
            return null;
        }
    }

    private string? SerializeOriginalValues(EntityEntry entry)
    {
        try
        {
            var properties = entry.OriginalValues.Properties
                .Where(p => !p.IsShadowProperty() && p.Name != "PasswordHash" && p.Name != "PasswordSalt")
                .ToDictionary(
                    p => p.Name,
                    p => entry.OriginalValues[p]
                );
            return JsonSerializer.Serialize(properties);
        }
        catch
        {
            return null;
        }
    }

    private string? SerializeCurrentValues(EntityEntry entry)
    {
        try
        {
            var properties = entry.CurrentValues.Properties
                .Where(p => !p.IsShadowProperty() && p.Name != "PasswordHash" && p.Name != "PasswordSalt")
                .ToDictionary(
                    p => p.Name,
                    p => entry.CurrentValues[p]
                );
            return JsonSerializer.Serialize(properties);
        }
        catch
        {
            return null;
        }
    }

    private string? GetChangedProperties(EntityEntry entry)
    {
        try
        {
            var changes = new Dictionary<string, object?>();
            foreach (var property in entry.Properties)
            {
                if (property.IsModified &&
                    !property.Metadata.IsShadowProperty() &&
                    property.Metadata.Name != "PasswordHash" &&
                    property.Metadata.Name != "PasswordSalt")
                {
                    changes[property.Metadata.Name] = new
                    {
                        Old = property.OriginalValue,
                        New = property.CurrentValue
                    };
                }
            }

            return changes.Any() ? JsonSerializer.Serialize(changes) : null;
        }
        catch
        {
            return null;
        }
    }
}

