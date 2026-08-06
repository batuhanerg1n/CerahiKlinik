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
        public Decimal Fiyat { get; set; }
        public ICollection<Randevu> Randevular { get; set; } = new List<Randevu>();
    }
}
