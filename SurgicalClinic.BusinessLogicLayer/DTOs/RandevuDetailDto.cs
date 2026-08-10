using SurgicalClinic.Entities.Enums;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SurgicalClinic.BusinessLogicLayer.DTOs
{
    public class RandevuDetailDto
    {
        public int Id { get; set; }
        public int HastaId { get; set; }
        public string HastaAd { get; set; } = string.Empty;
        public string HastaSoyad { get; set; } = string.Empty;
        public string HastaTelefon { get; set; } = string.Empty;

        public int DoktorId { get; set; }
        public string DoktorAd { get; set; } = string.Empty;
        public string DoktorSoyad { get; set; } = string.Empty;
        public string DoktorUnvan { get; set; } = string.Empty;

        public int IslemId { get; set; }
        public string IslemAd { get; set; } = string.Empty;
        public decimal IslemFiyat { get; set; }

        public DateTime Tarih { get; set; }
        public TimeSpan Saat { get; set; }
        public RandevuDrum  Durum { get; set; }
        public RandevuKaynak Kaynak { get; set; }
        public string? HastaNotu { get; set; }
        public DateTime OlusturmaTarihi { get; set; }
        public DateTime? OnayTarihi { get; set; }
    }
}
