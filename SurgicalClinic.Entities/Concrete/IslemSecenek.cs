using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SurgicalClinic.Entities.Concrete
{
    public  class IslemSecenek
    {
        public int Id { get; set; }

        public int IslemId { get; set; }
        public Islem Islem { get; set; } = null!;

        public string SecenekAd { get; set; }= string.Empty;
        public decimal Fiyat { get; set; }
    }
}
