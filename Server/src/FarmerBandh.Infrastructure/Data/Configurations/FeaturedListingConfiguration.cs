using FarmerBandh.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FarmerBandh.Infrastructure.Data.Configurations;

public class FeaturedListingConfiguration : IEntityTypeConfiguration<FeaturedListing>
{
    public void Configure(EntityTypeBuilder<FeaturedListing> builder)
    {
        builder.HasKey(f => f.Id);

        builder.Property(f => f.DisplayOrder)
            .HasDefaultValue(0);

        builder.Property(f => f.IsActive)
            .HasDefaultValue(true);

        builder.HasOne(f => f.Product)
            .WithMany()
            .HasForeignKey(f => f.ProductId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(f => f.FeaturedByUser)
            .WithMany()
            .HasForeignKey(f => f.FeaturedByUserId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(f => f.ProductId)
            .IsUnique();

        builder.HasIndex(f => new { f.IsActive, f.DisplayOrder });
        builder.HasIndex(f => new { f.StartsAt, f.EndsAt });
    }
}
