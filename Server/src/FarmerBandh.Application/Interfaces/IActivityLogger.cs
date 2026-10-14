using Microsoft.AspNetCore.Http;

namespace FarmerBandh.Application.Interfaces;

public interface IActivityLogger
{
    Task LogAsync(
        string action,
        string targetType,
        Guid? targetId,
        string summary,
        string? metadata = null,
        HttpContext? httpContext = null,
        Guid? actorUserId = null);
}
