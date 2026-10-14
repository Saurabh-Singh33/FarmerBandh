using System.Security.Claims;
using FarmerBandh.Application.Interfaces;
using FarmerBandh.Domain.Entities;
using FarmerBandh.Domain.Enums;
using FarmerBandh.Infrastructure.Data;
using Microsoft.AspNetCore.Http;

namespace FarmerBandh.Infrastructure.Repositories;

public class ActivityLogger : IActivityLogger
{
    private readonly AppDbContext _context;
    private readonly IHttpContextAccessor _httpContextAccessor;

    public ActivityLogger(AppDbContext context, IHttpContextAccessor httpContextAccessor)
    {
        _context = context;
        _httpContextAccessor = httpContextAccessor;
    }

    public async Task LogAsync(
        string action,
        string targetType,
        Guid? targetId,
        string summary,
        string? metadata = null,
        HttpContext? httpContext = null,
        Guid? actorUserId = null)
    {
        var ctx = httpContext ?? _httpContextAccessor.HttpContext;

        Guid effectiveActorId = actorUserId ?? Guid.Empty;
        if (effectiveActorId == Guid.Empty && ctx?.User?.Identity?.IsAuthenticated == true)
        {
            var idClaim = ctx.User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                          ?? ctx.User.FindFirst("sub")?.Value
                          ?? ctx.User.FindFirst("userId")?.Value;
            if (Guid.TryParse(idClaim, out var parsed))
            {
                effectiveActorId = parsed;
            }
        }

        // If still empty (e.g. background job), find the first admin user
        if (effectiveActorId == Guid.Empty)
        {
            var adminUser = _context.Users.FirstOrDefault(u => u.Role == UserRole.Admin);
            if (adminUser != null)
            {
                effectiveActorId = adminUser.Id;
            }
        }

        string? ip = null;
        string? ua = null;
        if (ctx != null)
        {
            ip = ctx.Connection.RemoteIpAddress?.ToString();
            if (ctx.Request.Headers.TryGetValue("User-Agent", out var uaHeader))
            {
                ua = uaHeader.ToString();
                if (ua.Length > 300) ua = ua[..300];
            }
        }

        var log = new ActivityLog
        {
            Id = Guid.NewGuid(),
            ActorUserId = effectiveActorId,
            ActorRole = UserRole.Admin,
            Action = action.Length > 80 ? action[..80] : action,
            TargetType = targetType.Length > 60 ? targetType[..60] : targetType,
            TargetId = targetId,
            Summary = summary.Length > 500 ? summary[..500] : summary,
            Metadata = metadata != null && metadata.Length > 2000 ? metadata[..2000] : metadata,
            IpAddress = ip != null && ip.Length > 45 ? ip[..45] : ip,
            UserAgent = ua,
            CreatedAt = DateTime.UtcNow
        };

        await _context.ActivityLogs.AddAsync(log);
        await _context.SaveChangesAsync();
    }
}
