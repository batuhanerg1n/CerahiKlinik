using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SurgicalClinic.BusinessLogicLayer.DTOs
{
    public class LoginResponseDto
    {
        public string  Token { get; set; } = string.Empty;
        public string Email { get; set; }= string.Empty;
        public string Rol { get; set; } = string.Empty;
        public DateTime Expiration { get; set; }
    }
}
