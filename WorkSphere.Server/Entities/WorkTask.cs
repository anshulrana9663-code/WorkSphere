using WorkSphere.Server.Entities.Enums;

namespace WorkSphere.Server.Entities;

public class WorkTask
{
    public int Id { get; set; }

    public string Name { get; set; } = string.Empty;

    public string? Description { get; set; }

    // Foreign Key: Assignee By (The employee who assigned/created the task)
    public int? AssignedById { get; set; }

    public virtual Employee? AssignedBy { get; set; }

    // Foreign Key: Assignee To (The employee assigned to perform the task)
    public int? AssignedToId { get; set; }

    public virtual Employee? AssignedTo { get; set; }

    public DateTime? DueDate { get; set; }

    public DateTime CreatedDate { get; set; } = DateTime.UtcNow;

    public DateTime? UpdatedDate { get; set; }

    public WorkTaskStatus Status { get; set; } = WorkTaskStatus.Pending;

    public WorkTaskPriority Priority { get; set; } = WorkTaskPriority.Medium;

    // Navigation collections
    public virtual ICollection<TaskAttachment> Attachments { get; set; } = new List<TaskAttachment>();

    public virtual ICollection<TaskComment> Comments { get; set; } = new List<TaskComment>();
}

