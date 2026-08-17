using SurgicalClinic.BusinessLogicLayer.DTOs;
using SurgicalClinic.Entities.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SurgicalClinic.BusinessLogicLayer.Services.Abstract
{
    public interface IDoktorPanelService
    {
        Task<IEnumerable<DoktorRandevuOzetDto>> GetMyRandevularAsync(int kullaniciId, DateTime? tarih, RandevuDrum? drum);
        Task<IEnumerable<DoktorTakvimGunDto>> GetMyTakvimAsync(int kullaniciId, int ay, int yil);
        Task<bool> RandevuTamamlaAsync(int kullaniciId, int randevuId, string? doktorNotu);
        Task<IEnumerable<DoktorRandevuOzetDto>> GetHastaGecmisiAsync(int kullaniciId, int hastaId);
        Task<bool> RandevuIptalAsync(int kullaniciId, int randevuId);
    }
}
