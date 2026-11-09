namespace WorkSphere.Server.Entities;

public class TaskComment
{
    public int Id { get; set; }

    public string Content { get; set; } = string.Empty;

    // Foreign Key: Employee who authored the comment
    public int EmployeeId { get; set; }

    public virtual Employee Employee { get; set; } = null!;

    // Foreign Key: Task this comment belongs to
    public int TaskId { get; set; }

    public virtual WorkTask Task { get; set; } = null!;

    public DateTime CreatedDate { get; set; } = DateTime.UtcNow;

    public DateTime? UpdatedDate { get; set; }
}

