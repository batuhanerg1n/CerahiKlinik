using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SurgicalClinic.BusinessLogicLayer.DTOs
{
    public  class DoktorPerformansDto
    {
        public string DoktorAd { get; set; } =string.Empty;
        public string DoktorSoyad { get; set; } = string.Empty;
        public string DoktorUnvan { get; set; } = string.Empty;
        public int TamamlananMuayeneSayisi { get; set; }
    }


}
