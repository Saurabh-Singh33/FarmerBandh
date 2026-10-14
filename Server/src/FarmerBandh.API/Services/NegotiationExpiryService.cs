using FarmerBandh.Application.Interfaces;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace FarmerBandh.API.Services;

public class NegotiationExpiryService : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<NegotiationExpiryService> _logger;

    public NegotiationExpiryService(
        IServiceProvider serviceProvider,
        ILogger<NegotiationExpiryService> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("NegotiationExpiryService background worker initialized (15-minute interval).");

        using var timer = new PeriodicTimer(TimeSpan.FromMinutes(15));

        // Initial run on startup
        try
        {
            await RunExpiryCheckAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error executing initial negotiation expiry check.");
        }

        while (!stoppingToken.IsCancellationRequested && await timer.WaitForNextTickAsync(stoppingToken))
        {
            try
            {
                await RunExpiryCheckAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error executing periodic negotiation expiry check.");
            }
        }
    }

    private async Task RunExpiryCheckAsync()
    {
        using var scope = _serviceProvider.CreateScope();
        var negotiationService = scope.ServiceProvider.GetRequiredService<INegotiationService>();
        await negotiationService.ExpireStaleNegotiationsAsync();
    }
}
