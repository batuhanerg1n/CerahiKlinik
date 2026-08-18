using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SurgicalClinic.BusinessLogicLayer.DTOs
{
    public class IslemSecenekDto
    {
        public int Id { get; set; }
        public string SecenekAd { get; set; }= string.Empty;
        public decimal Fiyat { get; set; }
    }
}
