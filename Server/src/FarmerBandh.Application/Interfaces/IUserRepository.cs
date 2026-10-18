using FarmerBandh.Domain.Entities;

namespace FarmerBandh.Application.Interfaces;

public interface IUserRepository
{
    Task<User?> GetByEmailAsync(string email);
    Task<User?> GetByIdAsync(Guid id);
    Task AddAsync(User user);
    void Update(User user);
    Task AddFarmerAsync(Farmer farmer);
    Task AddBuyerAsync(Buyer buyer);
    Task<RefreshToken?> GetRefreshTokenAsync(string token);
    Task AddRefreshTokenAsync(RefreshToken token);
    void UpdateRefreshToken(RefreshToken token);
    Task<Buyer?> GetBuyerByUserIdAsync(Guid userId);
    Task<Farmer?> GetFarmerByUserIdAsync(Guid userId);
    Task AddVerificationRequestAsync(VerificationRequest request);
    Task<bool> SaveChangesAsync();
}
