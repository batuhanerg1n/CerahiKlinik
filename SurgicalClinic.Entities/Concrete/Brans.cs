using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SurgicalClinic.Entities.Concrete
{
    public class Brans
    {
        public int Id { get; set; }
        public string Ad { get; set; }=string.Empty;
        public ICollection<DoktorBrans> DoktorBranslar { get; set; } = new List<DoktorBrans>();
    }
}
