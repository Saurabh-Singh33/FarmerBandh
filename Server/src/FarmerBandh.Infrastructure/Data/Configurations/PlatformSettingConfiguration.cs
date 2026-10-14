using FarmerBandh.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FarmerBandh.Infrastructure.Data.Configurations;

public class PlatformSettingConfiguration : IEntityTypeConfiguration<PlatformSetting>
{
    public void Configure(EntityTypeBuilder<PlatformSetting> builder)
    {
        builder.HasKey(ps => ps.Id);

        builder.Property(ps => ps.CommissionPercent)
            .HasPrecision(5, 2)
            .HasDefaultValue(2.00m);

        builder.Property(ps => ps.DefaultDeliveryFee)
            .HasPrecision(12, 2)
            .HasDefaultValue(50.00m);

        builder.Property(ps => ps.PlatformFee)
            .HasPrecision(12, 2)
            .HasDefaultValue(10.00m);

        builder.Property(ps => ps.TaxPercent)
            .HasPrecision(5, 2)
            .HasDefaultValue(5.00m);

        builder.Property(ps => ps.CODEnabled)
            .HasDefaultValue(true);

        builder.Property(ps => ps.MaintenanceModeEnabled)
            .HasDefaultValue(false);

        builder.Property(ps => ps.NewRegistrationsEnabled)
            .HasDefaultValue(true);

        builder.Property(ps => ps.NegotiationsEnabled)
            .HasDefaultValue(true);

        builder.Property(ps => ps.VerifiedOnlyMarketplace)
            .HasDefaultValue(false);

        builder.Property(ps => ps.MaxDeliverySlotsPerDay)
            .HasDefaultValue(5);

        builder.Property(ps => ps.SupportEmail)
            .HasMaxLength(150);

        builder.Property(ps => ps.SupportPhone)
            .HasMaxLength(20);

        builder.HasOne(ps => ps.UpdatedByUser)
            .WithMany()
            .HasForeignKey(ps => ps.UpdatedByUserId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
