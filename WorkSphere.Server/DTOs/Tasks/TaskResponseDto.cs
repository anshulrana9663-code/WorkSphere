namespace WorkSphere.Server.DTOs.Tasks;

public class TaskResponseDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int? AssignedById { get; set; }
    public string? AssignedByName { get; set; }
    public int? AssignedToId { get; set; }
    public string? AssignedToName { get; set; }
    public DateTime? DueDate { get; set; }
    public DateTime CreatedDate { get; set; }
    public DateTime? UpdatedDate { get; set; }
    public string Status { get; set; } = string.Empty;
    public string Priority { get; set; } = string.Empty;
    public int CommentsCount { get; set; }
    public int AttachmentsCount { get; set; }
    public List<TaskCommentDto> Comments { get; set; } = [];
    public List<TaskAttachmentDto> Attachments { get; set; } = [];
}

public class TaskCommentDto
{
    public int Id { get; set; }
    public string Content { get; set; } = string.Empty;
    public int EmployeeId { get; set; }
    public string EmployeeName { get; set; } = string.Empty;
    public DateTime CreatedDate { get; set; }
    public DateTime? UpdatedDate { get; set; }
}

public class TaskAttachmentDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string FileName { get; set; } = string.Empty;
    public long Size { get; set; }
    public string ContentType { get; set; } = string.Empty;
    public int? EmployeeId { get; set; }
    public string? UploadedByName { get; set; }
    public DateTime UploadedDate { get; set; }
}
