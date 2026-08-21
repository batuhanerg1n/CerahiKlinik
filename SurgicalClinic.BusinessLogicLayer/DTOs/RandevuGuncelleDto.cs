using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SurgicalClinic.BusinessLogicLayer.DTOs
{
    public class RandevuGuncelleDto
    {
        public int DoktorId { get; set; }
        public int IslemId { get; set; }
        public int? IslemSecenekId { get; set; }
        public DateTime Tarih { get; set; }
        public TimeSpan Saat { get; set; }
        public string? HastaNotu { get; set; }
    }
}
