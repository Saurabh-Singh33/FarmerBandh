using FarmerBandh.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FarmerBandh.Infrastructure.Data.Configurations;

public class SavedFarmerConfiguration : IEntityTypeConfiguration<SavedFarmer>
{
    public void Configure(EntityTypeBuilder<SavedFarmer> builder)
    {
        builder.ToTable("SavedFarmers");

        builder.HasKey(s => s.Id);

        builder.Property(s => s.Note)
            .HasMaxLength(300);

        builder.Property(s => s.SavedAt)
            .IsRequired();

        builder.HasOne(s => s.Buyer)
            .WithMany()
            .HasForeignKey(s => s.BuyerId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(s => s.Farmer)
            .WithMany()
            .HasForeignKey(s => s.FarmerId)
            .OnDelete(DeleteBehavior.Cascade);

        // Unique composite index: a buyer can only save a farmer once
        builder.HasIndex(s => new { s.BuyerId, s.FarmerId })
            .IsUnique();

        builder.HasIndex(s => new { s.BuyerId, s.SavedAt });
    }
}
