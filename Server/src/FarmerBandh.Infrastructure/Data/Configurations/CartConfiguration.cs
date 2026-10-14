using FarmerBandh.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FarmerBandh.Infrastructure.Data.Configurations;

public class CartConfiguration : IEntityTypeConfiguration<Cart>
{
    public void Configure(EntityTypeBuilder<Cart> builder)
    {
        builder.HasKey(c => c.Id);

        builder.Property(c => c.CouponCode)
            .HasMaxLength(50);

        builder.HasOne(c => c.Buyer)
            .WithOne(b => b.Cart)
            .HasForeignKey<Cart>(c => c.BuyerId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
