using FarmerBandh.Domain.Entities;
using FarmerBandh.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FarmerBandh.Infrastructure.Data.Configurations;

public class OrderConfiguration : IEntityTypeConfiguration<Order>
{
    public void Configure(EntityTypeBuilder<Order> builder)
    {
        builder.HasKey(o => o.Id);

        builder.Property(o => o.OrderNumber)
            .IsRequired()
            .HasMaxLength(30);

        builder.HasIndex(o => o.OrderNumber)
            .IsUnique();

        builder.Property(o => o.DeliveryLine1)
            .IsRequired()
            .HasMaxLength(300);

        builder.Property(o => o.DeliveryLine2)
            .HasMaxLength(300);

        builder.Property(o => o.DeliveryCity)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(o => o.DeliveryState)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(o => o.DeliveryPincode)
            .IsRequired()
            .HasMaxLength(10);

        builder.Property(o => o.DeliveryPhone)
            .IsRequired()
            .HasMaxLength(20);

        builder.Property(o => o.DeliverySlotWindow)
            .IsRequired()
            .HasMaxLength(30);

        builder.Property(o => o.Subtotal).HasPrecision(14, 2);
        builder.Property(o => o.DeliveryFee).HasPrecision(12, 2);
        builder.Property(o => o.PlatformFee).HasPrecision(12, 2);
        builder.Property(o => o.TaxAmount).HasPrecision(12, 2);
        builder.Property(o => o.DiscountAmount).HasPrecision(14, 2);
        builder.Property(o => o.TotalAmount).HasPrecision(14, 2);

        builder.Property(o => o.CouponCode).HasMaxLength(50);
        builder.Property(o => o.CancellationReason).HasMaxLength(300);

        builder.Property(o => o.Status)
            .HasConversion<int>()
            .HasDefaultValue(OrderStatus.Pending);

        builder.Property(o => o.PaymentMethod)
            .HasConversion<int>()
            .HasDefaultValue(PaymentMethod.COD);

        builder.Property(o => o.PaymentStatus)
            .HasConversion<int>()
            .HasDefaultValue(PaymentStatus.Pending);

        builder.HasOne(o => o.Buyer)
            .WithMany(b => b.Orders)
            .HasForeignKey(o => o.BuyerId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(o => o.Seller)
            .WithMany(f => f.SellerOrders)
            .HasForeignKey(o => o.SellerId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(o => o.Address)
            .WithMany()
            .HasForeignKey(o => o.AddressId)
            .OnDelete(DeleteBehavior.Restrict);

        // Required Composite Indexes
        builder.HasIndex(o => new { o.BuyerId, o.PlacedAt });
        builder.HasIndex(o => new { o.SellerId, o.Status });
        builder.HasIndex(o => new { o.Status, o.PlacedAt });
    }
}
