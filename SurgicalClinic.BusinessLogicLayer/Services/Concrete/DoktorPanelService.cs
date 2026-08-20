using Microsoft.EntityFrameworkCore;
using SurgicalClinic.BusinessLogicLayer.DTOs;
using SurgicalClinic.BusinessLogicLayer.Services.Abstract;
using SurgicalClinic.DataAccessLayer.Abstract;
using SurgicalClinic.Entities.Concrete;
using SurgicalClinic.Entities.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SurgicalClinic.BusinessLogicLayer.Services.Concrete
{
    public class DoktorPanelService : IDoktorPanelService
    {
        private readonly IUnitOfWork _unitOfWork;

        public DoktorPanelService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        private async Task<int?> GetDoktorIdByKullaniciIdAsync(int kullaniciId)
        {
            var doktorRepo = _unitOfWork.GetRepository<Doktor>();
            var doktor = await doktorRepo.GetWhere(d => d.KullaniciId == kullaniciId).FirstOrDefaultAsync();
            return doktor?.Id;
        }
        public async Task<IEnumerable<DoktorRandevuOzetDto>> GetHastaGecmisiAsync(int kullaniciId, int hastaId)
        {
            var doktorId = await GetDoktorIdByKullaniciIdAsync(kullaniciId);
            if (!doktorId.HasValue) return new List<DoktorRandevuOzetDto>();

            var randevuRepo = _unitOfWork.GetRepository<Randevu>();
            var gecmis = await randevuRepo.GetWhere( r=> r.HastaId == hastaId && r.Durum == RandevuDrum.Tamamlandi)
                .Include( r => r.Hasta)
                .Include( r=>r.Islem)
                .OrderByDescending(r => r.Tarih)
                .ToListAsync();

            return gecmis.Select(r => new DoktorRandevuOzetDto
            {
                RandevuId = r.Id,
                HastaId = hastaId,
                HastaAd = r.Hasta?.Ad ?? "",
                HastaSoyad = r.Hasta?.Soyad ?? "",
                HastaTelefon = r.Hasta?.Telefon ?? "",
                IslemAd = r.Islem?.Ad ?? "",
                Tarih = r.Tarih,
                Saat = r.Saat,
                Durum = r.Durum,
                HastaNotu = r.HastaNotu,
                DoktorNotu =r.DoktorNotu
            });
        }

        public async Task<IEnumerable<DoktorRandevuOzetDto>> GetMyRandevularAsync(int kullaniciId, DateTime? tarih, RandevuDrum? drum)
        {
            var doktorId = await GetDoktorIdByKullaniciIdAsync(kullaniciId);
            if (!doktorId.HasValue)
                return new List<DoktorRandevuOzetDto>();

            var randevuRepo = _unitOfWork.GetRepository<Randevu>();
            var query = randevuRepo.GetWhere(r => r.DoktorId == doktorId.Value)
                .Include(r => r.Hasta)
                .Include(r => r.Islem)
                .AsQueryable();

            if (tarih.HasValue)
                query = query.Where(r => r.Tarih.Date == tarih.Value.Date);

            if (drum.HasValue)
                query = query.Where(r => r.Durum == drum.Value);

            var list = await query.OrderBy(r => r.Saat).ToListAsync();

            return list.Select(r => new DoktorRandevuOzetDto
            {
                RandevuId = r.Id,
                HastaId = r.HastaId,
                HastaAd = r.Hasta?.Ad ?? "",
                HastaSoyad = r.Hasta?.Soyad ?? "",
                HastaTelefon = r.Hasta?.Telefon ?? "",
                IslemAd = r.Islem?.Ad ?? "",
                Tarih = r.Tarih,
                Saat = r.Saat,
                Durum = r.Durum,
                HastaNotu = r.HastaNotu
            });
        }

        public async Task<IEnumerable<DoktorTakvimGunDto>> GetMyTakvimAsync(int kullaniciId, int ay, int yil)
        {
            var doktorId = await GetDoktorIdByKullaniciIdAsync(kullaniciId);
            if (!doktorId.HasValue) return new List<DoktorTakvimGunDto>();

            var randevuRepo = _unitOfWork.GetRepository<Randevu>();
            var randevular = await randevuRepo.GetWhere(r =>
            r.DoktorId == doktorId.Value &&
            r.Tarih.Month == ay &&
            r.Tarih.Year == yil)
            .Include(r => r.Hasta)
            .Include(r => r.Islem)
            .ToListAsync();

            return randevular
                .GroupBy(r => r.Tarih.Date)
                .Select(g => new DoktorTakvimGunDto
                {
                    Tarih = g.Key,
                    ToplamRandevuSayisi = g.Count(),
                    Randevular = g.Select(r => new DoktorRandevuOzetDto
                    {
                        RandevuId = r.Id,
                        HastaId = r.Id,
                        HastaAd = r.Hasta?.Ad ?? "",
                        HastaSoyad = r.Hasta?.Soyad ?? "",
                        HastaTelefon = r.Hasta?.Telefon ?? "",
                        IslemAd = r.Islem?.Ad ?? "",
                        Tarih = r.Tarih,
                        Saat = r.Saat,
                        Durum = r.Durum,
                        HastaNotu = r.HastaNotu
                    }).OrderBy(r => r.Saat).ToList()
                })
                .OrderBy(g => g.Tarih);
        }

        public async Task<bool> RandevuTamamlaAsync(int kullaniciId, int randevuId, string? doktorNotu)
        {
            var doktorId = await GetDoktorIdByKullaniciIdAsync(kullaniciId);
            if (!doktorId.HasValue) return false;

            var randevuRepo = _unitOfWork.GetRepository<Randevu>();
            var randevu = await randevuRepo.GetByIdAsync(randevuId);

            if (randevu == null || randevu.DoktorId != doktorId.Value)
                return false;

            randevu.Durum = RandevuDrum.Tamamlandi;
            randevu.DoktorNotu = doktorNotu;       
            randevu.OnayTarihi = DateTime.Now;     
            randevuRepo.Update(randevu);
            await _unitOfWork.SaveChangeAsync();
            return true;
        }

        public async Task<bool> RandevuIptalAsync(int kullaniciId, int randevuId)
        {
            var doktorId = await GetDoktorIdByKullaniciIdAsync(kullaniciId);
            if (!doktorId.HasValue) return false;

            var randevuRepo = _unitOfWork.GetRepository<Randevu>();
            var randevu = await randevuRepo.GetByIdAsync(randevuId);

            if (randevu == null || randevu.DoktorId != doktorId.Value)
                return false;

            if( randevu.Durum == RandevuDrum.Tamamlandi || randevu.Durum == RandevuDrum.Iptal)
                return false;

            randevu.Durum = RandevuDrum.Iptal;
            randevuRepo.Update(randevu);
            await _unitOfWork.SaveChangeAsync();
            return true;
        }
    }
}
