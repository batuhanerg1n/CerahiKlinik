using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SurgicalClinic.BusinessLogicLayer.DTOs
{
    public class IslemGuncelleDto
    {
        public string Ad { get; set; }= string.Empty;
        public string Aciklama  { get; set; } = string.Empty;
        public int FiyatTipi { get; set; }
        public int Fiyat { get; set; }
        public List<IslemSecenekGuncelleDto> Secenekler { get; set; } = new();

    }
    public class IslemSecenekGuncelleDto
    {
        public int? Id { get; set; }
        public string SecenekAd { get; set; } = string.Empty;
        public decimal Fiyat { get; set; }
    }
}
