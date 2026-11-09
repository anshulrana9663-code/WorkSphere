using System.ComponentModel.DataAnnotations;

namespace WorkSphere.Server.DTOs.Auth;

public class ForgotPasswordRequestDto
{
    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;
}

