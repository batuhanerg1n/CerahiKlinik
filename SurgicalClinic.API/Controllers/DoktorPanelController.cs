using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SurgicalClinic.BusinessLogicLayer.DTOs;
using SurgicalClinic.BusinessLogicLayer.Services.Abstract;
using SurgicalClinic.Entities.Enums;
using System.Security.Claims;

namespace SurgicalClinic.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles ="Doktor, 4")]
    public class DoktorPanelController : Controller
    {
        private readonly IDoktorPanelService _doktorPanelService;

        public DoktorPanelController(IDoktorPanelService doktorPanelService)
        {
            _doktorPanelService = doktorPanelService;
        }

        private int GetCurrentUserId()
        {
            var kullaniciIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            int.TryParse(kullaniciIdClaim, out int kullaniciId);
            return kullaniciId;
        }
        
        [HttpGet("randevularim")]
        public async Task<IActionResult> GetMyRandevular([FromQuery] DateTime? tarih, [FromQuery] RandevuDrum? durum)
        {
            var userId = GetCurrentUserId();
            var result =await _doktorPanelService.GetMyRandevularAsync(userId, tarih, durum);
            return Ok(result);
        }

        [HttpGet("takvim")]

        public async Task<IActionResult> GetMyTakvim([FromQuery] int ay, [FromQuery] int yil)
        {
            var userId = GetCurrentUserId();
            var result = await _doktorPanelService.GetMyTakvimAsync(userId, ay, yil);
            return Ok(result);
        }

        [HttpPut("randevu/{id}/tamamla")]
        public async Task<IActionResult> RandevuTamamla(int id, [FromBody] RandevuTamamlaDto dto)
        {
            var userId = GetCurrentUserId();
            var success = await _doktorPanelService.RandevuTamamlaAsync(userId, id, dto.DoktorNotu);
            if (!success)
                return BadRequest(new { message = "Randevu tamamlanamadı veya yetkiniz yok" });
            return Ok(new { message = "Muayene/Randevu başarıyla tamamlandı." });
        }

        [HttpPut("randevu/{hastaId}/iptal")]

        public async Task<IActionResult> RandevuIptal(int id)
        {
            var userId = GetCurrentUserId();
            var success = await _doktorPanelService.RandevuIptalAsync(userId, id);
            if (!success)
                return BadRequest(new { message = "Randevu iptal edilemedi veya yetkiniz yok" });
            return Ok(new { message = "Randevu iptal edildi." });
        }


        [HttpGet("hasta-gecmisi/{hastaId}")]

        public async Task<IActionResult> GetHastaGecmisi(int hastaId)
        {
            var userId = GetCurrentUserId();
            var result = await _doktorPanelService.GetHastaGecmisiAsync(userId, hastaId);
            return Ok(result);
        }
    }

}
