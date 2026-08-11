using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SurgicalClinic.BusinessLogicLayer.DTOs
{
    public class AylikPerformansDto
    {
        public List<DoktorPerformansDto> DoktorPerformanslari { get; set; } = new();
        public List<IslemGelirDto> IslemGelirleri { get; set; } = new();
    }
}
