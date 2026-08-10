using SurgicalClinic.Entities.Concrete;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SurgicalClinic.BusinessLogicLayer.DTOs
{
    public class DoktorDto
    {
        public int Id { get; set; }
        public string Ad { get; set; } = string.Empty;
        public string Soyad  { get; set; } = string.Empty ;
        public string Unvan { get; set; } = string .Empty ;
        public string Acıklama { get; set; } = string.Empty;
        public List<string> Branslar { get; set; } = new();
    }
}
