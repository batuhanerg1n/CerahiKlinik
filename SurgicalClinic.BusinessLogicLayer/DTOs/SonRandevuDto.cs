using SurgicalClinic.Entities.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SurgicalClinic.BusinessLogicLayer.DTOs
{
    public class SonRandevuDto
    {
        public int Id { get; set; }
        public string HastaAd { get; set; } = string.Empty;
        public string HastaSoyad { get; set; } =string.Empty;
        public string DoktorAd { get; set; } = string.Empty;
        public string DoktorSoyad { get; set; } = string.Empty;
        public string DoktorUnvan { get; set; } = string.Empty;
        public string IslemAd { get; set; } = string.Empty;
        public DateTime Tarih { get; set; }
        public TimeSpan Saat { get; set; }
        public RandevuDrum Durum { get; set; }
    }
}
