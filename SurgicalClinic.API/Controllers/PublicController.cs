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
        [HttpPost("online-randevu")]
        public async Task<IActionResult> OnlineRandevuOlustur([FromBody] OnlineRandevuOlusturDto dto)
        {
            var (success, message) = await _publicService.OnlineRandevuOlusturAsync(dto);
            if (!success) 
                return BadRequest(new { message });
            return Ok(new { message });
        }

        [HttpGet("dolu-saatler")]
        public async Task<IActionResult> GetDoluSaatler([FromQuery] int doktorId, [FromQuery] DateTime tarih)
        {
            var saatler = await _publicService.GetDoluSaatlerAsync(doktorId, tarih);
            return Ok(saatler);
        }
        [HttpGet("branslar")]
        public async Task<IActionResult> GetBranslar()
        {
            var result = await _publicService.GetBranslarAsync();
            return Ok(result);
        }
    }
}
