using Microsoft.VisualBasic;
using SurgicalClinic.BusinessLogicLayer.DTOs;
using SurgicalClinic.Entities.Concrete;
using SurgicalClinic.Entities.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SurgicalClinic.BusinessLogicLayer.Services.Abstract
{
    public interface IPersonelPanelService
    {
        Task<PageResultDto<RandevuDetailDto>> GetRandevularAsync(String? query, RandevuDrum? drum, int pageIndex = 1, int PageSize= 10);
        Task<bool> RandevuDurumGuncelleAsync(int randevuId, RandevuDrum yeniDurum);

        Task<IEnumerable<HastaDto>> GetHastalarAsync();
        Task<HastaDto?> GetHastaByIdAsync(int id);
        Task<HastaDto> HastaEkleVeGuncelleAsync(HastaDto dto);

        Task<bool> DoktorProfilOlusturAsync(int kullaniciId,DoktorProfilOlusturDto dto);

        Task<IEnumerable<TakvimEventDto>> GetTakvimEventAsync(int ay, int yil);
    }
}
