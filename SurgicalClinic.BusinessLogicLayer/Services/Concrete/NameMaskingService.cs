using SurgicalClinic.BusinessLogicLayer.Services.Abstract;
using SurgicalClinic.Entities.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SurgicalClinic.BusinessLogicLayer.Services.Concrete
{
    public class NameMaskingService : INameMaskingService
    {
        public (string MaskedAd, string MaskedSoyad) MaskFirstAndLastName(string firstName, string LastName, Rol userRole)
        {
            if (userRole !=Rol.Ziyaretci)
                return (firstName, LastName);

            return (ApplyMask(firstName), ApplyMask(LastName));
        }

        

        public string MaskFullName(string fullName, Rol userRole)
        {
            if (userRole != Rol.Ziyaretci || string.IsNullOrWhiteSpace(fullName))
                return (fullName);
            var parts = fullName.Trim().Split(' ', StringSplitOptions.RemoveEmptyEntries);
            for (int i=0; i< parts.Length; i++)
            {
                parts[i]=ApplyMask(parts[i]);
            }
            return string.Join("", parts);

        }
        private string ApplyMask(string text)
        {
            if(string.IsNullOrWhiteSpace(text))
                return string.Empty;
            var trimmed=text.Trim();
            if(trimmed.Length <=2)
            {
                return trimmed[0] + "*";
            }

            return trimmed.Substring(0, 2) + new string('*', trimmed.Length - 2);   
        }
    }
}
