using FarmerBandh.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace FarmerBandh.Infrastructure.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<Farmer> Farmers => Set<Farmer>();
    public DbSet<Buyer> Buyers => Set<Buyer>();
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<Product> Products => Set<Product>();
    public DbSet<Address> Addresses => Set<Address>();
    public DbSet<Cart> Carts => Set<Cart>();
    public DbSet<CartItem> CartItems => Set<CartItem>();
    public DbSet<Coupon> Coupons => Set<Coupon>();
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<OrderItem> OrderItems => Set<OrderItem>();
    public DbSet<PlatformSetting> PlatformSettings => Set<PlatformSetting>();

    // Phase 4 DbSets
    public DbSet<OrderStatusHistory> OrderStatusHistories => Set<OrderStatusHistory>();
    public DbSet<ReturnRequest> ReturnRequests => Set<ReturnRequest>();
    public DbSet<ReturnItem> ReturnItems => Set<ReturnItem>();
    public DbSet<ReturnMessage> ReturnMessages => Set<ReturnMessage>();
    public DbSet<Dispute> Disputes => Set<Dispute>();
    public DbSet<DisputeMessage> DisputeMessages => Set<DisputeMessage>();
    public DbSet<Refund> Refunds => Set<Refund>();
    public DbSet<Review> Reviews => Set<Review>();

    // Phase 5 DbSets
    public DbSet<Negotiation> Negotiations => Set<Negotiation>();
    public DbSet<NegotiationMessage> NegotiationMessages => Set<NegotiationMessage>();
    public DbSet<SavedFarmer> SavedFarmers => Set<SavedFarmer>();

    // Phase 6 DbSets
    public DbSet<Payout> Payouts => Set<Payout>();
    public DbSet<BankAccount> BankAccounts => Set<BankAccount>();
    public DbSet<VerificationRequest> VerificationRequests => Set<VerificationRequest>();
    public DbSet<SellerSettings> SellerSettings => Set<SellerSettings>();

    // Phase 7 DbSets
    public DbSet<ActivityLog> ActivityLogs => Set<ActivityLog>();
    public DbSet<FeaturedListing> FeaturedListings => Set<FeaturedListing>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);
    }
}
