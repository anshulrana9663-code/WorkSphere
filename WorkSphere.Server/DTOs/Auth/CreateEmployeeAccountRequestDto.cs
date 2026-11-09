using System.ComponentModel.DataAnnotations;

namespace WorkSphere.Server.DTOs.Auth;

public class CreateEmployeeAccountRequestDto
{
    [Required]
    [MaxLength(50)]
    public string FirstName { get; set; } = string.Empty;

    [Required]
    [MaxLength(50)]
    public string LastName { get; set; } = string.Empty;

    [Required]
    [EmailAddress]
    [MaxLength(150)]
    public string Email { get; set; } = string.Empty;

    [Required]
    public string Password { get; set; } = string.Empty;

    [MaxLength(20)]
    public string? PhoneNumber { get; set; }

    [Required]
    [MaxLength(100)]
    public string JobTitle { get; set; } = string.Empty;

    [MaxLength(100)]
    public string? Department { get; set; }

    [Required]
    public DateTime HireDate { get; set; }

    [Range(0, 10_000_000)]
    public decimal? Salary { get; set; }

    [Range(1, int.MaxValue)]
    public int ManagerId { get; set; }
}
