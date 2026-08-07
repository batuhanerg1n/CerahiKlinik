using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using SurgicalClinic.BusinessLogicLayer.Services.Abstract;
using SurgicalClinic.BusinessLogicLayer.Services.Concrete;
using SurgicalClinic.DataAccessLayer.Abstract;
using SurgicalClinic.DataAccessLayer.Concrete;
using SurgicalClinic.DataAccessLayer.Context;

using System.Text;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));
builder.Services.AddScoped<IUnitOfWork, UnitOfWork>();
builder.Services.AddScoped<INameMaskingService, NameMaskingService>();
builder.Services.AddScoped<IAuthService, AuthService>();

var screteKey = builder.Configuration["JwtSettings:Secret"]?? "SuperSecretKeyForSurgicalClinicApi2026!";
var key= Encoding.ASCII.GetBytes(screteKey);

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme =JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options=>
{
    options.RequireHttpsMetadata = false;
    options.SaveToken = true;
    options.TokenValidationParameters= new Microsoft.IdentityModel.Tokens.TokenValidationParameters
    {
        ValidateIssuerSigningKey= true,
        IssuerSigningKey= new SymmetricSecurityKey(key),
        ValidateIssuer= false,
        ValidateAudience= false
    };

});
var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();
