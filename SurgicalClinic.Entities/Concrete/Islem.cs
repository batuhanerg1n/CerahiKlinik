using SurgicalClinic.Entities.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SurgicalClinic.Entities.Concrete
{
    public class Islem
    {
        public int Id { get; set; }
        public string Ad { get; set; } = string.Empty;
        public string Aciklama { get; set; }= string.Empty;

        public FiyatTipi FiyatTipi { get; set; } = FiyatTipi.Sabit;
        public decimal Fiyat { get; set; }
        public int? BransId { get; set; }
        public Brans? Brans { get; set; }

        public ICollection<IslemSecenek> Secenekler { get; set; } = new List<IslemSecenek>();
        public ICollection<Randevu> Randevular { get; set; } = new List<Randevu>();
    }
}
