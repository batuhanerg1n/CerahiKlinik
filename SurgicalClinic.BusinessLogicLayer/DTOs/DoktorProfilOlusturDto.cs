using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SurgicalClinic.BusinessLogicLayer.DTOs
{
    public class DoktorProfilOlusturDto
    {
        public string Unvan { get; set; } = string.Empty;
        public string Aciklama { get; set; } = string.Empty;
        public List<int> BransId { get; set; } = new();
    }
}
