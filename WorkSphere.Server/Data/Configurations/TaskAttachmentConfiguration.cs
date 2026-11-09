using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using WorkSphere.Server.Entities;

namespace WorkSphere.Server.Data.Configurations;

public class TaskAttachmentConfiguration : IEntityTypeConfiguration<TaskAttachment>
{
    public void Configure(EntityTypeBuilder<TaskAttachment> builder)
    {
        builder.ToTable("TaskAttachments");

        builder.HasKey(a => a.Id);

        builder.Property(a => a.Name)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(a => a.FileName)
            .IsRequired()
            .HasMaxLength(255);

        builder.Property(a => a.StoredFileName)
            .IsRequired()
            .HasMaxLength(255);

        builder.Property(a => a.Location)
            .IsRequired()
            .HasMaxLength(1000);

        builder.Property(a => a.ContentType)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(a => a.UploadedDate)
            .HasDefaultValueSql("GETUTCDATE()");

        // Foreign Key: Task (Cascade delete when parent task is deleted)
        builder.HasOne(a => a.Task)
            .WithMany(t => t.Attachments)
            .HasForeignKey(a => a.TaskId)
            .OnDelete(DeleteBehavior.Cascade);

        // Foreign Key: Employee (Restrict to prevent multiple cascade paths in SQL Server)
        builder.HasOne(a => a.Employee)
            .WithMany(e => e.TaskAttachments)
            .HasForeignKey(a => a.EmployeeId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(a => a.TaskId);
        builder.HasIndex(a => a.EmployeeId);
    }
}

