using Microsoft.AspNetCore.Mvc;
using SurgicalClinic.BusinessLogicLayer.DTOs;
using SurgicalClinic.BusinessLogicLayer.Services.Abstract;

namespace SurgicalClinic.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PublicController : Controller
    {
        private readonly IPublicService _publicService;

        public PublicController(IPublicService publicService)
        {
            _publicService = publicService;
        }

        [HttpGet("doktorlar")]
        public async Task<IActionResult> GetDoktorlar([FromQuery] int? brandsId)
        {
            var result = await _publicService.GetDoktorlarAsync(brandsId);
            return Ok(result);
        }
        [HttpGet("islem")]
        public async Task<IActionResult> GetIslemler()
        {
            var result = await _publicService.GetIslemlerAsync();
            return Ok(result);
        }
        [HttpGet("online-randevu")]
        public async Task<IActionResult> OnlineRandevuOlustur([FromBody] OnlineRandevuOlusturDto dto)
        {
            var (success, message) = await _publicService.OnlineRandevuOlusturAsync(dto);
            if (!success) 
                return BadRequest(new { message });
            return Ok(new { message });
        }
    }
}
