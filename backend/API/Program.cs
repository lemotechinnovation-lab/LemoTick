using InvestorManagementSystem.Infrastructure;
using InvestorManagementSystem.Application;
using InvestorManagementSystem.Services;
using InvestorManagementSystem.BotIntegration;
using Microsoft.EntityFrameworkCore;
using Serilog;
using InvestorManagementSystem.Infrastructure.Data;
using InvestorManagementSystem.Application.Services;
using InvestorManagementSystem.Application.Interfaces;
using InvestorManagementSystem.API.Middleware;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using AspNetCoreRateLimit;

var builder = WebApplication.CreateBuilder(args);

// Configure Serilog
Log.Logger = new LoggerConfiguration()
    .ReadFrom.Configuration(builder.Configuration)
    .Enrich.FromLogContext()
    .WriteTo.Console()
    .WriteTo.File("logs/investor-management-.txt", rollingInterval: RollingInterval.Day)
    .CreateLogger();

builder.Host.UseSerilog();

// Add services to the container
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Add HttpContextAccessor for audit tracking
builder.Services.AddHttpContextAccessor();

// Add SignalR for real-time notifications
builder.Services.AddSignalR();

// Add Rate Limiting
builder.Services.AddMemoryCache();
builder.Services.Configure<IpRateLimitOptions>(builder.Configuration.GetSection("IpRateLimiting"));
builder.Services.Configure<IpRateLimitPolicies>(builder.Configuration.GetSection("IpRateLimitPolicies"));
builder.Services.AddInMemoryRateLimiting();
builder.Services.AddSingleton<IRateLimitConfiguration, RateLimitConfiguration>();

// Add CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins(
                "http://localhost:3000",
                "http://localhost:5173",  // Vite default port
                "https://localhost:3000",
                "https://localhost:5173")
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials();  // Important for auth cookies/tokens
    });
});

// Add Application Services
builder.Services.AddApplicationServices();

// Add Infrastructure Services
builder.Services.AddInfrastructureServices(builder.Configuration);

// Add Authentication Services
builder.Services.AddScoped<JwtService>();
builder.Services.AddScoped<IAuthService, AuthService>();

// Add Real-Time Notification Service
builder.Services.AddScoped<IRealTimeNotificationService, InvestorManagementSystem.API.Services.SignalRNotificationService>();

// Add Real-Time Trading Broadcast Service
builder.Services.AddSingleton<InvestorManagementSystem.API.Services.ITradingBroadcastService, InvestorManagementSystem.API.Services.TradingBroadcastService>();

// Add JWT Authentication
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"] ?? ""))
        };
    });

// Add Authorization
builder.Services.AddAuthorization();

// Add Background Services
builder.Services.AddHostedService<PerformanceCalculationService>();
builder.Services.AddHostedService<NotificationService>();

// Add Bot Integration
builder.Services.AddBotIntegrationServices();

var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors("AllowFrontend");

// Add Rate Limiting Middleware
app.UseIpRateLimiting();

// Add custom middleware
app.UseMiddleware<GlobalExceptionMiddleware>();
// JWT middleware removed - using built-in ASP.NET Core JWT authentication

app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

// Map SignalR Hub
app.MapHub<InvestorManagementSystem.API.Hubs.NotificationHub>("/notificationHub");
app.MapHub<InvestorManagementSystem.API.Hubs.TradingHub>("/tradingHub");

// Ensure database is created
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    context.Database.EnsureCreated();
}

app.Run();
