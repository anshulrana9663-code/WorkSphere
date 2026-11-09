using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using WorkSphere.Server.Entities;

namespace WorkSphere.Server.Data.Configurations;

public class WorkTaskConfiguration : IEntityTypeConfiguration<WorkTask>
{
    public void Configure(EntityTypeBuilder<WorkTask> builder)
    {
        builder.ToTable("Tasks");

        builder.HasKey(t => t.Id);

        builder.Property(t => t.Name)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(t => t.Description)
            .HasMaxLength(2000);

        builder.Property(t => t.CreatedDate)
            .HasDefaultValueSql("GETUTCDATE()");

        builder.Property(t => t.Status)
            .HasConversion<string>()
            .HasMaxLength(50)
            .IsRequired();

        builder.Property(t => t.Priority)
            .HasConversion<string>()
            .HasMaxLength(50)
            .IsRequired();

        // Foreign Key: AssignedBy (Creator / Assigner)
        builder.HasOne(t => t.AssignedBy)
            .WithMany(e => e.CreatedTasks)
            .HasForeignKey(t => t.AssignedById)
            .OnDelete(DeleteBehavior.Restrict);

        // Foreign Key: AssignedTo (Assignee)
        builder.HasOne(t => t.AssignedTo)
            .WithMany(e => e.AssignedTasks)
            .HasForeignKey(t => t.AssignedToId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(t => t.AssignedToId);
        builder.HasIndex(t => t.AssignedById);
        builder.HasIndex(t => t.Status);
    }
}

