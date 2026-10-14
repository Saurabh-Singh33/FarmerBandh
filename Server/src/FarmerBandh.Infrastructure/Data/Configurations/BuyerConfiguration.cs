using FarmerBandh.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FarmerBandh.Infrastructure.Data.Configurations;

public class BuyerConfiguration : IEntityTypeConfiguration<Buyer>
{
    public void Configure(EntityTypeBuilder<Buyer> builder)
    {
        builder.ToTable("Buyers");

        builder.HasKey(b => b.Id);

        builder.Property(b => b.Phone)
            .HasMaxLength(20);

        builder.Property(b => b.DefaultAddressLine)
            .HasMaxLength(255);

        builder.Property(b => b.City)
            .HasMaxLength(100);

        builder.Property(b => b.State)
            .HasMaxLength(100);

        builder.Property(b => b.Pincode)
            .HasMaxLength(20);

        builder.Property(b => b.PreferredState)
            .HasMaxLength(100);

        builder.Property(b => b.PreferredDistrict)
            .HasMaxLength(100);

        builder.HasOne(b => b.User)
            .WithOne(u => u.Buyer)
            .HasForeignKey<Buyer>(b => b.UserId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
