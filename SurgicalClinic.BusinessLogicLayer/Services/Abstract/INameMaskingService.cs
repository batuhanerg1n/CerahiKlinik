using SurgicalClinic.Entities.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SurgicalClinic.BusinessLogicLayer.Services.Abstract
{
    public interface INameMaskingService
    {
        (string MaskedAd, string MaskedSoyad) MaskFirstAndLastName(string firstName, string LastName, Rol userRole);
        string MaskFullName(string fullName, Rol userRole);
    }
}
