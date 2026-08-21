using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SurgicalClinic.BusinessLogicLayer.DTOs
{
    public class IslemOlusturDto
    {
        public string Ad { get; set; }= string.Empty;
        public string Aciklama { get; set; }= string.Empty;
        public int FiyatTipi { get; set; }
        public decimal Fiyat { get; set; }
        public int? BransId { get; set; }
        public List<IslemSecenekOlusturDto> Secenekler { get; set; } = new();

    }

    public class IslemSecenekOlusturDto
    {
        public string SecenekAd { get; set; } = string.Empty;
        public decimal Fiyat { get; set; }
    }
}
