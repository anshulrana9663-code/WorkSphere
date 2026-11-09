using System.ComponentModel.DataAnnotations;
using WorkSphere.Server.Entities.Enums;

namespace WorkSphere.Server.DTOs.Tasks;

public class CreateTaskRequestDto
{
    [Required]
    [MaxLength(200)]
    public string Name { get; set; } = string.Empty;

    [MaxLength(2000)]
    public string? Description { get; set; }

    [Required]
    public int AssignedToId { get; set; }

    public DateTime? DueDate { get; set; }

    public WorkTaskPriority Priority { get; set; } = WorkTaskPriority.Medium;
}

public class UpdateTaskRequestDto
{
    [Required]
    [MaxLength(200)]
    public string Name { get; set; } = string.Empty;

    [MaxLength(2000)]
    public string? Description { get; set; }

    [Required]
    public int AssignedToId { get; set; }

    public DateTime? DueDate { get; set; }

    public WorkTaskPriority Priority { get; set; } = WorkTaskPriority.Medium;
}

public class UpdateTaskStatusRequestDto
{
    [Required]
    public WorkTaskStatus Status { get; set; }
}

public class CreateCommentRequestDto
{
    [Required]
    [MaxLength(4000)]
    public string Content { get; set; } = string.Empty;
}

public class UpdateCommentRequestDto
{
    [Required]
    [MaxLength(4000)]
    public string Content { get; set; } = string.Empty;
}
