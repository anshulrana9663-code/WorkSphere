using Microsoft.AspNetCore.Mvc;

namespace WorkSphere.Server.Controllers;

[ApiController]
[Route("api/[controller]")]
public class HealthController : ControllerBase
{
    [HttpGet]
    public IActionResult Check()
    {
        return Ok(new
        {
            status = "Healthy",
            service = "WorkSphere API",
            timestamp = DateTime.UtcNow
        });
    }
}

