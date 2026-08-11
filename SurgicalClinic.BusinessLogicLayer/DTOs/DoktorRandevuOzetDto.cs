using SurgicalClinic.Entities.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SurgicalClinic.BusinessLogicLayer.DTOs
{
    public class DoktorRandevuOzetDto
    {
        public int RandevuId { get; set; }
        public string HastaAd { get; set; } = string.Empty;
        public string HastaSoyad { get; set; } = string.Empty;
        public string HastaTelefon { get; set; } = string.Empty;
        public string IslemAd { get; set; } = string.Empty;
        public DateTime Tarih { get; set; }
        public TimeSpan Saat { get; set; }
        public RandevuDrum  Durum  { get; set; }
        public string? HastaNotu { get; set; }
        public string? DoktorNotu { get; set; }
    }

    public class DoktorTakvimGunDto
    {
        public DateTime Tarih { get; set; }
        public int ToplamRandevuSayisi { get; set; }
        public List<DoktorRandevuOzetDto> Randevular { get; set; } = new();
    }
}
