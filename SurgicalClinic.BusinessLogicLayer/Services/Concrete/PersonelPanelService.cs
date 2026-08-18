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

        public async Task<(bool Success, string Message)> DoktorOlusturAsync(DoktorOlusturDto dto)
        {
            var kullaniciRepo = _unitOfWork.GetRepository<Kullanici>();
            var doktorRepo = _unitOfWork.GetRepository<Doktor>();

            // Email zaten kayıtlı mı?
            var emailVar = await kullaniciRepo.GetWhere(k => k.Email == dto.Email).AnyAsync();
            if (emailVar)
                return (false, "Bu email adresi zaten kayıtlı.");

            // 1. Kullanıcı hesabı (Doktor rolü)
            var kullanici = new Kullanici
            {
                Ad = dto.Ad,
                Soyad = dto.Soyad,
                Email = dto.Email,
                passwordHash = dto.Sifre,   // mevcut sistem plain text tutuyor
                Rol = Rol.Doktor
            };
            await kullaniciRepo.AddAsync(kullanici);
            await _unitOfWork.SaveChangeAsync();

            // 2. Doktor profili
            var doktor = new Doktor
            {
                KullaniciId = kullanici.Id,
                Ad = dto.Ad,
                Soyad = dto.Soyad,
                Unvan = dto.Unvan,
                Aciklama = dto.Aciklama
            };
            foreach (var bransId in dto.BransIds)
            {
                doktor.DoktorBranslar.Add(new DoktorBrans { BransId = bransId });
            }
            await doktorRepo.AddAsync(doktor);
            await _unitOfWork.SaveChangeAsync();

            return (true, "Doktor başarıyla oluşturuldu.");
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

        public async Task<bool> DoktorSilAsync(int doktorId)
        {
            var doktorRepo = _unitOfWork.GetRepository<Doktor>();
            var doktor = await doktorRepo.GetByIdAsync(doktorId);
            if (doktor == null) return false;

            doktorRepo.Remove(doktor);
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
        }

        public async Task<IEnumerable<DoktorListeDto>> GetTumDoktorlarAsync()
        {
            var doktorRepo = _unitOfWork.GetRepository<Doktor>();
            var doktorlar = await doktorRepo.GetWhere(d => true)
                .Include(d => d.Kullanici)
                .Include(d => d.DoktorBranslar)
                    .ThenInclude(db => db.Brans)
                .ToListAsync();

            return doktorlar.Select(d => new DoktorListeDto
            {
                Id = d.Id,
                Ad = d.Ad,
                Soyad = d.Soyad,
                Unvan = d.Unvan,
                Email = d.Kullanici?.Email ?? "",
                Branslar = d.DoktorBranslar.Select(db => db.Brans.Ad).ToList()
            });
        }

        public async Task<IEnumerable<IslemDto>> GetTumIslemlerAsync()
        {
            var islemRepo = _unitOfWork.GetRepository<IslemDto>();
            var islemler = await islemRepo.GetWhere(i => true)
                .Include( i =>i.Secenekler)
                .ToListAsync();
            return islemler.Select(i => new IslemDto
            {
                Id = i.Id,
                Ad = i.Ad,
                Aciklama = i.Aciklama,
                FiyatTipi = (int)i.FiyatTipi,
                Fiyat = i.Fiyat,
                Secenekler = i.Secenekler.Select(s => new IslemSecenekDto
                {
                    Id = s.Id,
                    SecenekAd = s.SecenekAd,
                    Fiyat = s.Fiyat
                }).ToList()

            });
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

        public async Task<IslemDto> IslemEkleAsync(IslemOlusturDto dto)
        {
            var islemRepo = _unitOfWork.GetRepository<Islem>();

            var yeniIslem = new Islem
            {
                Ad = dto.Ad,
                Aciklama = dto.Aciklama,
                FiyatTipi = (FiyatTipi)dto.FiyatTipi,
                Fiyat = dto.FiyatTipi == 1 ? dto.Fiyat : 0,
                Secenekler = dto.FiyatTipi == 2
                    ? dto.Secenekler.Select(s => new IslemSecenek
                    {
                        SecenekAd = s.SecenekAd,
                        Fiyat = s.Fiyat
                    }).ToList()
                    : new List<IslemSecenek>()
            };

            await islemRepo.AddAsync(yeniIslem);
            await _unitOfWork.SaveChangeAsync();

            return new IslemDto
            {
                Id = yeniIslem.Id,
                Ad = yeniIslem.Ad,
                Aciklama = yeniIslem.Aciklama,
                FiyatTipi = (int)yeniIslem.FiyatTipi,
                Fiyat = yeniIslem.Fiyat,
                Secenekler = yeniIslem.Secenekler.Select(s => new IslemSecenekDto
                {
                    Id = s.Id,
                    SecenekAd = s.SecenekAd,
                    Fiyat = s.Fiyat
                }).ToList()
            };
        }

        public async Task<bool> IslemSilAsync(int islemId)
        {
            var islemRepo = _unitOfWork.GetRepository<Islem>();
            var islem = await islemRepo.GetByIdAsync(islemId);
            if (islem == null) return false;

            islemRepo.Remove(islem);   
            await _unitOfWork.SaveChangeAsync();
            return true;
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
