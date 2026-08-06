using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SurgicalClinic.Entities.Concrete
{
    public class DoktorBrans
    {
        public int DoktorId { get; set; }
        public Doktor Doktor { get; set; } = null!;

        public int BransId { get; set; }
        public Brans Brans { get; set; } = null!;
    }
}
