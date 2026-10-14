using FarmerBandh.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FarmerBandh.Infrastructure.Data.Configurations;

public class NotificationPreferenceConfiguration : IEntityTypeConfiguration<NotificationPreference>
{
    public void Configure(EntityTypeBuilder<NotificationPreference> builder)
    {
        builder.ToTable("NotificationPreferences");

        builder.HasKey(np => np.Id);

        builder.Property(np => np.OrderUpdates).HasDefaultValue(true);
        builder.Property(np => np.NegotiationUpdates).HasDefaultValue(true);
        builder.Property(np => np.ReturnDisputeUpdates).HasDefaultValue(true);
        builder.Property(np => np.PayoutUpdates).HasDefaultValue(true);
        builder.Property(np => np.VerificationUpdates).HasDefaultValue(true);
        builder.Property(np => np.ReviewUpdates).HasDefaultValue(true);
        builder.Property(np => np.SystemAnnouncements).HasDefaultValue(true);

        builder.HasOne(np => np.User)
            .WithOne(u => u.NotificationPreference)
            .HasForeignKey<NotificationPreference>(np => np.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(np => np.UserId)
            .IsUnique()
            .HasDatabaseName("IX_NotificationPreferences_UserId");
    }
}
