using Azure.Core.Serialization;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using SurgicalClinic.BusinessLogicLayer.DTOs;
using SurgicalClinic.BusinessLogicLayer.Services.Abstract;
using SurgicalClinic.DataAccessLayer.Abstract;
using SurgicalClinic.DataAccessLayer.Concrete;
using SurgicalClinic.Entities.Concrete;
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using BCrypt.Net;

namespace SurgicalClinic.BusinessLogicLayer.Services.Concrete
{
    public class AuthService : IAuthService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IConfiguration _configuration;

        public AuthService(IUnitOfWork unitOfWork, IConfiguration configuration)
        {
            _unitOfWork = unitOfWork;
            _configuration = configuration;
        }

        public async Task<LoginResponseDto?> LoginAsync(LoginRequestDto request)
        {
            var userRepo = _unitOfWork.GetRepository<Kullanici>();
            var user = userRepo.GetWhere(u => u.Email == request.Email).FirstOrDefault();

            if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.passwordHash))
                return null;

            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes(_configuration["JwtSettings:Secret"] ?? "SuperSecretKeyForSurgicalClinicApi2026!");

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[]
                {
                    new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                    new Claim(ClaimTypes.Email, user.Email),
                    new Claim(ClaimTypes.Role, user.Rol.ToString())
                }),
                Expires = DateTime.UtcNow.AddHours(8),
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);

            return new LoginResponseDto
            {
                Token = tokenHandler.WriteToken(token),
                Email = user.Email,
                Rol = user.Rol.ToString(),
                Expiration = tokenDescriptor.Expires.Value
            };

        }
        
    }
}
