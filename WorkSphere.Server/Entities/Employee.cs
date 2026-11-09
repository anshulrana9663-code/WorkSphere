namespace WorkSphere.Server.Entities;

public class Employee
{
    public int Id { get; set; }

    public string FirstName { get; set; } = string.Empty;

    public string LastName { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public string? PhoneNumber { get; set; }

    public string JobTitle { get; set; } = string.Empty;

    public string? Department { get; set; }

    public DateTime HireDate { get; set; }

    public decimal? Salary { get; set; }

    public bool IsActive { get; set; } = true;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? UpdatedAt { get; set; }

    // Self-referencing relationship: Manager
    public int? ManagerId { get; set; }

    public virtual Employee? Manager { get; set; }

    // Direct reports managed by this employee
    public virtual ICollection<Employee> DirectReports { get; set; } = new List<Employee>();

    // ASP.NET Core Identity User relationship
    public string? UserId { get; set; }

    public virtual ApplicationUser? User { get; set; }

    // Task relationships
    public virtual ICollection<WorkTask> AssignedTasks { get; set; } = new List<WorkTask>();

    public virtual ICollection<WorkTask> CreatedTasks { get; set; } = new List<WorkTask>();

    public virtual ICollection<TaskAttachment> TaskAttachments { get; set; } = new List<TaskAttachment>();

    public virtual ICollection<TaskComment> TaskComments { get; set; } = new List<TaskComment>();
}

