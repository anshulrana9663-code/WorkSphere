namespace WorkSphere.Server.Entities;

public class TaskAttachment
{
    public int Id { get; set; }

    public string Name { get; set; } = string.Empty;

    // Foreign Key: Employee who uploaded the file
    public int? EmployeeId { get; set; }

    public virtual Employee? Employee { get; set; }

    // Foreign Key: Task this attachment belongs to
    public int TaskId { get; set; }

    public virtual WorkTask Task { get; set; } = null!;

    public string FileName { get; set; } = string.Empty;

    public string StoredFileName { get; set; } = string.Empty;

    public long Size { get; set; }

    public string Location { get; set; } = string.Empty;

    public DateTime UploadedDate { get; set; } = DateTime.UtcNow;

    public string ContentType { get; set; } = string.Empty;
}

