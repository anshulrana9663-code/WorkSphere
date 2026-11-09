using Microsoft.AspNetCore.Identity;

namespace WorkSphere.Server.Entities;

public class ApplicationUser : IdentityUser
{
    // Navigation property to the Employee profile
    public virtual Employee? Employee { get; set; }
}

