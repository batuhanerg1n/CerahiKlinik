using SurgicalClinic.Entities.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SurgicalClinic.Entities.Concrete
{
    public class Kullanici
    {
        public int Id { get; set; }
        public string Ad { get; set; } = string.Empty;
        public string Soyad { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string passwordHash { get; set; }=string.Empty;
        public Rol  Rol { get; set; }
        public DateTime CreatedAt { get; set; }= DateTime.UtcNow;

        //Navigate  
        public Doktor? Doktor { get; set; }
    }
}
