namespace WorkSphere.Server.DTOs.Auth;

public class UserResponseDto
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public string Department { get; set; } = string.Empty;
    public string Position { get; set; } = string.Empty;
    public string AvatarColor { get; set; } = "bg-indigo-600";
    public string Initials { get; set; } = string.Empty;
    public bool IsDirector { get; set; }
    public string? ManagerId { get; set; }
    public string? DirectorId { get; set; }
}

