using FarmerBandh.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FarmerBandh.Infrastructure.Data.Configurations;

public class FarmerConfiguration : IEntityTypeConfiguration<Farmer>
{
    public void Configure(EntityTypeBuilder<Farmer> builder)
    {
        builder.ToTable("Farmers");

        builder.HasKey(f => f.Id);

        builder.Property(f => f.FarmName)
            .IsRequired()
            .HasMaxLength(150);

        builder.Property(f => f.Location)
            .HasMaxLength(255);

        builder.Property(f => f.State)
            .HasMaxLength(100);

        builder.Property(f => f.District)
            .HasMaxLength(100);

        builder.Property(f => f.Rating)
            .HasPrecision(3, 2);

        builder.Property(f => f.Bio)
            .HasMaxLength(1000);

        builder.Property(f => f.Phone)
            .HasMaxLength(20);

        builder.HasOne(f => f.User)
            .WithOne(u => u.Farmer)
            .HasForeignKey<Farmer>(f => f.UserId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
