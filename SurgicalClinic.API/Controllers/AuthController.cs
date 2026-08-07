using Microsoft.AspNetCore.Mvc;
using SurgicalClinic.BusinessLogicLayer.DTOs;
using SurgicalClinic.BusinessLogicLayer.Services.Abstract;

namespace SurgicalClinic.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;

        public AuthController(IAuthService auhService)
        {
            _authService = auhService;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequestDto request)
        {
            var result= await _authService.LoginAsync(request);
            if (result == null)
            {
                return Unauthorized(new { message = "E-Posta veya şifre hatalı!" });
            }
            return Ok(request);
        }

    }
}
