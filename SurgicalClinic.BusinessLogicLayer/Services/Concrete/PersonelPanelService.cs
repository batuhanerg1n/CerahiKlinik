using Microsoft.EntityFrameworkCore;
using SurgicalClinic.BusinessLogicLayer.DTOs;
using SurgicalClinic.BusinessLogicLayer.Services.Abstract;
using SurgicalClinic.DataAccessLayer.Abstract;
using SurgicalClinic.DataAccessLayer.Concrete;
using SurgicalClinic.Entities.Concrete;
using SurgicalClinic.Entities.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SurgicalClinic.BusinessLogicLayer.Services.Concrete
{
    public class PersonelPanelService : IPersonelPanelService
    {
        private readonly IUnitOfWork _unitOfWork;

        public PersonelPanelService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<bool> DoktorProfilOlusturAsync(int kullaniciId, DoktorProfilOlusturDto dto)
        {
            var kullaniciRepo = _unitOfWork.GetRepository<Kullanici>();
            var doktorRepo = _unitOfWork.GetRepository<Doktor>();

            var kullanici=await kullaniciRepo.GetByIdAsync(kullaniciId);
            if(kullanici == null) 
                return false;
            var mevcutDoktor = await doktorRepo.GetWhere(d => d.KullaniciId == kullaniciId).FirstOrDefaultAsync();
            if(mevcutDoktor == null)
                return false;
            var yeniDoktor = new Doktor
            {
                KullaniciId = kullaniciId,
                Ad = kullanici.Ad,
                Soyad = kullanici.Soyad,
                Unvan = dto.Unvan,
                Aciklama = dto.Aciklama
            };
            foreach(var brandsId in dto.BransId)
            {
                yeniDoktor.DoktorBranslar.Add(new DoktorBrans
                {
                    BransId = brandsId
                });
            }
            await doktorRepo.AddAsync(yeniDoktor);
            await _unitOfWork.SaveChangeAsync();
            return true;

        }

        public async Task<HastaDto?> GetHastaByIdAsync(int id)
        {
            var hastaRepo = _unitOfWork.GetRepository<Hasta>();
            var hasta= await hastaRepo.GetByIdAsync(id);

            return new HastaDto
            {
                Id = hasta.Id,
                Ad = hasta.Ad,
                Soyad = hasta.Soyad,
                DogumTarihi = hasta.DogumTarihi,
                Notlar = hasta.Notlar
            };
        }

        public async Task<IEnumerable<HastaDto>> GetHastalarAsync()
        {
            var hastaRepo= _unitOfWork.GetRepository<Hasta>();
            var hastalar = await hastaRepo.GetAllAsync();

            return hastalar.Select(h => new HastaDto
            {
                Id = h.Id,
                Ad = h.Ad,
                Soyad = h.Soyad,
                DogumTarihi = h.DogumTarihi,
                Notlar = h.Notlar
            });
        }

        public async Task<PageResultDto<RandevuDetailDto>> GetRandevularAsync(string? query, RandevuDrum? drum, int pageIndex = 1, int PageSize = 10)
        {
            var randevuRepo = _unitOfWork.GetRepository<Randevu>();
            var baseQuery = randevuRepo.GetWhere(r => true)
                .Include(r => r.Hasta)
                .Include(r => r.Doktor)
                .Include(r => r.Islem)
                .AsQueryable();
            if (drum.HasValue)
            {
                baseQuery =baseQuery.Where(r=>r.Durum == drum.Value);
            }
            if(!string.IsNullOrWhiteSpace(query))
            {
                var q = query.Trim().ToLower();
                baseQuery = baseQuery.Where(r =>
                r.Hasta.Ad.ToLower().Contains(q) || 
                r.Hasta.Soyad.ToLower().Contains(q) || 
                r.Doktor.Ad.ToLower().Contains(q) || 
                r.Doktor.Soyad.ToLower().Contains(q) || 
                r.Islem.Ad.ToLower().Contains(q));
            }
            var totalCount= await baseQuery.CountAsync();
            var items =await baseQuery
                .OrderByDescending( r=>r.Tarih)
                .ThenByDescending(r=>r.Saat)
                .Skip((pageIndex-1)*PageSize)
                .Take(PageSize)
                .ToListAsync();

            var mappedItems = items.Select(r => new RandevuDetailDto
            {
                Id = r.Id,
                HastaId = r.HastaId,
                HastaAd = r.Hasta?.Ad ?? "",
                HastaSoyad = r.Hasta?.Soyad ?? "",
                HastaTelefon = r.Hasta?.Telefon ?? "",

                DoktorId = r.DoktorId,
                DoktorAd = r.Doktor?.Ad ?? "",
                DoktorSoyad = r.Doktor?.Soyad ?? "",
                DoktorUnvan = r.Doktor?.Unvan ?? "",

                IslemId = r.IslemId,
                IslemAd = r.Islem?.Ad ?? "",
                IslemFiyat = r.Islem?.Fiyat ?? 0,

                Tarih = r.Tarih,
                Saat = r.Saat,
                Durum = r.Durum,
                Kaynak = r.Kaynak,
                HastaNotu = r.HastaNotu,
                OlusturmaTarihi = r.OlusturmaTarihi,
                OnayTarihi = r.OnayTarihi
            });
            return new PageResultDto<RandevuDetailDto>
            {
                Items = mappedItems,
                TotalCount = totalCount,
                PageIndex = pageIndex,
                PageSize = PageSize
            };
        }

        public async Task<IEnumerable<TakvimEventDto>> GetTakvimEventAsync(int ay, int yil)
        {
            var randevuRepo = _unitOfWork.GetRepository<Randevu>();

            var randevular = await randevuRepo.GetWhere(r =>
            r.Tarih.Year == yil &&
            r.Tarih.Month == ay)
                .Include(r => r.Hasta)
                .Include(r => r.Doktor)
                .Include(r => r.Islem)
                .ToListAsync();

            return randevular.Select(r => new TakvimEventDto
            {
                RandevuId = r.Id,
                HastaAd = r.Hasta?.Ad ?? "",
                HastaSoyad = r.Hasta?.Soyad ?? "",
                DoktorAd = r.Doktor?.Ad ?? "",
                DoktorSoyad = r.Doktor?.Soyad ?? "",
                IslemAd = r.Islem?.Ad ?? "",
                Tarih = r.Tarih,
                Saat = r.Saat,
                Durum = r.Durum,
                RenkKodu = r.Durum switch
                {
                    RandevuDrum.Beklemede => "#ffc107",
                    RandevuDrum.Onaylandi => "#0d6efd",
                    RandevuDrum.Tamamlandi => "#198754",
                    RandevuDrum.Iptal => "#dc3545",
                    _ => "#6c757d"
                }
            });
            throw new NotImplementedException();
        }

        public async Task<HastaDto> HastaEkleVeGuncelleAsync(HastaDto dto)
        {
            var hastaRepo = _unitOfWork.GetRepository<Hasta>();

            if (dto.Id == 0)
            {
                var yeniHasta = new Hasta
                {
                    Ad = dto.Ad,
                    Soyad = dto.Soyad,
                    Telefon = dto.telefon,
                    DogumTarihi = dto.DogumTarihi,
                    Notlar = dto.Notlar
                };
                await hastaRepo.AddAsync(yeniHasta);
                await _unitOfWork.SaveChangeAsync();
                dto.Id = yeniHasta.Id;
            }
            else
            {
                var hasta = await hastaRepo.GetByIdAsync(dto.Id);
                if (hasta != null)
                {
                    hasta.Ad = dto.Ad;
                    hasta.Soyad = dto.Soyad;
                    hasta.Telefon = dto.telefon;
                    hasta.DogumTarihi = dto.DogumTarihi;
                    hasta.Notlar = dto.Notlar;
                    hastaRepo.Update(hasta);
                    await _unitOfWork.SaveChangeAsync();
                }
            }

            return dto;
        }
        

        public async Task<bool> RandevuDurumGuncelleAsync(int randevuId, RandevuDrum yeniDurum)
        {
            var randevuRepo = _unitOfWork.GetRepository<Randevu>();
            var randevu = await randevuRepo.GetByIdAsync(randevuId);

            if (randevu == null) 
                return false;
            randevu.Durum=yeniDurum;
            if(yeniDurum == RandevuDrum.Onaylandi && !randevu.OnayTarihi.HasValue)
            {
                randevu.OnayTarihi= DateTime.UtcNow;
            }
            randevuRepo.Update(randevu);
            await _unitOfWork.SaveChangeAsync();
            return true;
        }
    }
}
