using FarmerBandh.Domain.Entities;
using FarmerBandh.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FarmerBandh.Infrastructure.Data.Configurations;

public class CouponConfiguration : IEntityTypeConfiguration<Coupon>
{
    public void Configure(EntityTypeBuilder<Coupon> builder)
    {
        builder.HasKey(c => c.Id);

        builder.Property(c => c.Code)
            .IsRequired()
            .HasMaxLength(50);

        builder.HasIndex(c => c.Code)
            .IsUnique();

        builder.Property(c => c.Description)
            .HasMaxLength(200);

        builder.Property(c => c.Type)
            .HasConversion<int>()
            .HasDefaultValue(CouponType.Percent);

        builder.Property(c => c.Value)
            .HasPrecision(12, 2)
            .IsRequired();

        builder.Property(c => c.MinOrderValue)
            .HasPrecision(12, 2)
            .HasDefaultValue(0.00m);

        builder.Property(c => c.MaxDiscount)
            .HasPrecision(12, 2);

        builder.Property(c => c.IsActive)
            .HasDefaultValue(true);

        builder.Property(c => c.UsedCount)
            .HasDefaultValue(0);
    }
}
