using FarmerBandh.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FarmerBandh.Infrastructure.Data.Configurations;

public class AddressConfiguration : IEntityTypeConfiguration<Address>
{
    public void Configure(EntityTypeBuilder<Address> builder)
    {
        builder.HasKey(a => a.Id);

        builder.Property(a => a.Line1)
            .IsRequired()
            .HasMaxLength(300);

        builder.Property(a => a.Line2)
            .HasMaxLength(300);

        builder.Property(a => a.City)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(a => a.State)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(a => a.Pincode)
            .IsRequired()
            .HasMaxLength(10);

        builder.Property(a => a.Phone)
            .IsRequired()
            .HasMaxLength(20);

        builder.Property(a => a.Label)
            .HasMaxLength(50);

        builder.Property(a => a.IsDefault)
            .HasDefaultValue(false);

        builder.HasOne(a => a.Buyer)
            .WithMany(b => b.Addresses)
            .HasForeignKey(a => a.BuyerId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
