using System.ComponentModel.DataAnnotations;

namespace WorkSphere.Server.DTOs.Reviews;

public class CreateReviewRequestDto
{
    [Required]
    public int RevieweeId { get; set; }

    [Required]
    [Range(1, 5)]
    public int StarRating { get; set; }

    [Required]
    [MaxLength(4000)]
    public string Comment { get; set; } = string.Empty;

    [Required]
    [MaxLength(50)]
    public string ReviewPeriod { get; set; } = string.Empty;
}

public class UpdateReviewRequestDto
{
    [Required]
    [Range(1, 5)]
    public int StarRating { get; set; }

    [Required]
    [MaxLength(4000)]
    public string Comment { get; set; } = string.Empty;

    [Required]
    [MaxLength(50)]
    public string ReviewPeriod { get; set; } = string.Empty;
}

public class ReviewResponseDto
{
    public int Id { get; set; }
    public int RevieweeId { get; set; }
    public string RevieweeName { get; set; } = string.Empty;
    public string RevieweeInitials { get; set; } = string.Empty;
    public int ReviewerId { get; set; }
    public string ReviewerName { get; set; } = string.Empty;
    public int StarRating { get; set; }
    public string Comment { get; set; } = string.Empty;
    public string ReviewPeriod { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}

public class EmployeePerformanceSummaryDto
{
    public int EmployeeId { get; set; }
    public string EmployeeName { get; set; } = string.Empty;
    public double AverageRating { get; set; }
    public int TotalReviews { get; set; }
    public int TotalTasksAssigned { get; set; }
    public int TotalTasksCompleted { get; set; }
    public double CompletionRate { get; set; }
    public List<ReviewResponseDto> Reviews { get; set; } = [];
}

