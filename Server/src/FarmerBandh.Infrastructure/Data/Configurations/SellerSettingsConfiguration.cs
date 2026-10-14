using FarmerBandh.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FarmerBandh.Infrastructure.Data.Configurations;

public class SellerSettingsConfiguration : IEntityTypeConfiguration<SellerSettings>
{
    public void Configure(EntityTypeBuilder<SellerSettings> builder)
    {
        builder.ToTable("SellerSettings");

        builder.HasKey(s => s.Id);

        builder.Property(s => s.MinimumPayoutAmount)
            .HasPrecision(12, 2)
            .HasDefaultValue(500m);

        builder.Property(s => s.NotifyOnNewOrder)
            .HasDefaultValue(true);

        builder.Property(s => s.NotifyOnNewNegotiation)
            .HasDefaultValue(true);

        builder.Property(s => s.NotifyOnNewReturn)
            .HasDefaultValue(true);

        builder.Property(s => s.NotifyOnNewReview)
            .HasDefaultValue(true);

        builder.HasOne(s => s.Farmer)
            .WithOne(f => f.SellerSettings)
            .HasForeignKey<SellerSettings>(s => s.FarmerId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(s => s.FarmerId)
            .IsUnique();
    }
}
