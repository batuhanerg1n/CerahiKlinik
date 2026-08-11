using SurgicalClinic.Entities.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SurgicalClinic.BusinessLogicLayer.DTOs
{
    public class RandevuKaynakDagilimiDto
    {
        public int Adet { get; set; }
        public RandevuKaynak  Kaynak { get; set; }
        public double Yuzde { get; set; }
    }
}
