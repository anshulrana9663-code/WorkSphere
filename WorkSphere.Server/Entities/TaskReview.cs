namespace WorkSphere.Server.Entities;

/// <summary>
/// Represents a performance review/rating submitted by a manager for one of their direct or indirect reports.
/// </summary>
public class TaskReview
{
    public int Id { get; set; }

    // The employee being reviewed
    public int RevieweeId { get; set; }
    public virtual Employee Reviewee { get; set; } = null!;

    // The manager who submitted the review
    public int ReviewerId { get; set; }
    public virtual Employee Reviewer { get; set; } = null!;

    /// <summary>Star rating from 1 (Critical Concern) to 5 (Exceptional).</summary>
    public int StarRating { get; set; }

    public string Comment { get; set; } = string.Empty;

    /// <summary>Free-text period label, e.g. "Nov 2026" or "Q4 2026".</summary>
    public string ReviewPeriod { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? UpdatedAt { get; set; }
}

