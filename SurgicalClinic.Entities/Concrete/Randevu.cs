using SurgicalClinic.Entities.Enums;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SurgicalClinic.Entities.Concrete
{
    public class Randevu
    {
        public int Id { get; set; }
        public int HastaId { get; set; }
        public Hasta Hasta { get; set; } = null!;

        public int DoktorId { get; set; }
        public Doktor Doktor { get; set; } = null!;

        public int IslemId { get; set; }
        public Islem Islem { get; set; } = null!;

        public DateTime Tarih { get; set; }
        public TimeSpan Saat { get; set; }
        public RandevuDrum Drum { get; set; } = RandevuDrum.Beklemede;
        public RandevuKaynak Kaynak { get; set; } = RandevuKaynak.Online;

        public string? HastaNotu { get; set; }
        public DateTime OlusturmaTarihi { get; set; }=DateTime.Now;
        public DateTime? OnayTarihi { get; set; }

        public byte[] RowVersion { get; set; } = Array.Empty<byte>();


    }
}
