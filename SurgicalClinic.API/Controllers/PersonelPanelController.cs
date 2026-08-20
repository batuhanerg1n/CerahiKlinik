using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SurgicalClinic.BusinessLogicLayer.DTOs;
using SurgicalClinic.BusinessLogicLayer.Services.Abstract;
using SurgicalClinic.BusinessLogicLayer.Services.Concrete;
using SurgicalClinic.Entities.Concrete;
using SurgicalClinic.Entities.Enums;
using System.Security.Claims;

namespace SurgicalClinic.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin,Personel")]
    public class PersonelPanelController : ControllerBase
    {

        private readonly IPersonelPanelService _personelService;

        public PersonelPanelController(IPersonelPanelService personelService)
        {
            _personelService = personelService;
        }

        [HttpGet("randevular/search")]
        public async Task<IActionResult> GetRandevular([FromQuery] string? query, [FromQuery] RandevuDrum? durum, [FromQuery] int pageIndex = 1, [FromQuery] int pageSize = 10)
        {
            var result = await _personelService.GetRandevularAsync(query, durum, pageIndex, pageSize);
            return Ok(result);
        }
        [HttpPut("randevular/{id}/durum")]
        public async Task<IActionResult> RandevuDurumGuncelle(int id, [FromQuery] RandevuDrum drum)
        {
            var result = await _personelService.RandevuDurumGuncelleAsync(id, drum);
            if (!result)
                return NotFound(new { message = "Randevu bulunamadı" });
            return Ok(new { message = " Randevu durumu güncellendi" });
        }
        [HttpGet("hastalar")]
        public async Task<IActionResult> GetHastalar()
        {
            var result = await _personelService.GetHastalarAsync();
            return Ok(result);
        }
        [HttpGet("hastalar/{id}")]
        public async Task<IActionResult> GetHastaById(int id)
        {
            var result = await _personelService.GetHastaByIdAsync(id);
            if (result == null)
                return NotFound(new { message = "Hasta bulunamadı" });
            return Ok(result);
        }
        [HttpPost("hastalar")]
        public async Task<IActionResult> HastaKaydet([FromBody] HastaDto dto)
        {
            var result = await _personelService.HastaEkleVeGuncelleAsync(dto);
            return Ok(result);
        }
        

        [HttpGet("takvim")]
        public async Task<IActionResult> GetTakvim([FromQuery] int ay, [FromQuery] int yil)
        {
            var result = await _personelService.GetTakvimEventAsync(ay, yil);
            return Ok(result);
        }

        [HttpGet("islemler")]
        public async Task<IActionResult> GetTumIslemler()
        {
            var result = await _personelService.GetTumIslemlerAsync();
            return Ok(result);
        }

        [HttpPost("islemler")]
        public async Task<IActionResult> IslemEkle([FromBody] IslemOlusturDto dto)
        {
            var result = await _personelService.IslemEkleAsync(dto);
            return Ok(result);
        }

        [HttpDelete("islemler/{id}")]
        public async Task<IActionResult> IslemSil(int id)
        {
            var success = await _personelService.IslemSilAsync(id);
            if (!success)
                return BadRequest(new { message = "İşlem silinemedi." });
            return Ok(new { message = "İşlem silindi." });
        }

        [HttpGet("doktorlar")]
        public async Task<IActionResult> GetTumDoktorlar()
        {
            var result = await _personelService.GetTumDoktorlarAsync();
            return Ok(result);
        }

        [HttpPost("doktorlar")]
        public async Task<IActionResult> DoktorOlustur([FromBody] DoktorOlusturDto dto)
        {
            var (success, message) = await _personelService.DoktorOlusturAsync(dto);
            if (!success)
                return BadRequest(new { message });
            return Ok(new { message });
        }

        [HttpDelete("doktorlar/{id}")]
        public async Task<IActionResult> DoktorSil(int id)
        {
            var success = await _personelService.DoktorSilAsync(id);
            if (!success)
                return BadRequest(new { message = "Doktor silinemedi." });
            return Ok(new { message = "Doktor silindi." });
        }

        [HttpPost("branslar")]
        public async Task<IActionResult> BransEkle([FromBody] BransEkleDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Ad))
                return BadRequest(new { message = "Branş adı boş olamaz." });

            var result = await _personelService.BransEkleAsync(dto.Ad.Trim());
            return Ok(result);
        }

        [HttpDelete("branslar/{id}")]
        public async Task<IActionResult> BransSil(int id)
        {
            var success = await _personelService.BransSilAsync(id);
            if (!success)
                return BadRequest(new { message = "Branş silinemedi." });
            return Ok(new { message = "Branş silindi." });
        }

        [HttpPut("islemler/{id}")]
        public async Task<IActionResult> IslemGuncelle(int id, [FromBody] IslemGuncelleDto dto)
        {
            var (success, message) = await _personelService.IslemGuncelleAsync(id, dto);
            if (!success)
                return BadRequest(new { message });
            return Ok(new { message });
        }

        [HttpPut("doktorlar/{id}")]
        public async Task<IActionResult> DoktorGuncelle(int id, [FromBody] DoktorGuncelleDto dto)
        {
            var (success, message) = await _personelService.DoktorGuncelleAsync(id, dto);
            if (!success)
                return BadRequest(new { message });
            return Ok(new { message });
        }
    }
}
