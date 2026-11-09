using System.ComponentModel.DataAnnotations;

namespace WorkSphere.Server.DTOs.Employees;

public class CreateEmployeeRequestDto
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

    [MaxLength(20)]
    public string? PhoneNumber { get; set; }

    [Required]
    [MaxLength(100)]
    public string JobTitle { get; set; } = string.Empty;

    [MaxLength(100)]
    public string? Department { get; set; }

    public int? ManagerId { get; set; }

    [Required]
    public DateTime HireDate { get; set; }

    [Range(0, 10_000_000)]
    public decimal? Salary { get; set; }
}

public class UpdateEmployeeRequestDto
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

    [MaxLength(20)]
    public string? PhoneNumber { get; set; }

    [Required]
    [MaxLength(100)]
    public string JobTitle { get; set; } = string.Empty;

    [MaxLength(100)]
    public string? Department { get; set; }

    public int? ManagerId { get; set; }

    [Required]
    public DateTime HireDate { get; set; }

    [Range(0, 10_000_000)]
    public decimal? Salary { get; set; }
}

public class ToggleEmployeeActiveDto
{
    [Required]
    public bool IsActive { get; set; }
}

