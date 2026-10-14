using FarmerBandh.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FarmerBandh.Infrastructure.Data.Configurations;

public class ReturnItemConfiguration : IEntityTypeConfiguration<ReturnItem>
{
    public void Configure(EntityTypeBuilder<ReturnItem> builder)
    {
        builder.HasKey(i => i.Id);

        builder.Property(i => i.QuantityQuintal)
            .HasPrecision(12, 2);

        builder.Property(i => i.Reason)
            .HasMaxLength(300);

        builder.HasOne(i => i.ReturnRequest)
            .WithMany(r => r.Items)
            .HasForeignKey(i => i.ReturnRequestId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(i => i.OrderItem)
            .WithMany()
            .HasForeignKey(i => i.OrderItemId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(i => i.ReturnRequestId);
    }
}
