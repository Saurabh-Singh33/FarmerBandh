using System.Text;
using FarmerBandh.API.Middleware;
using FarmerBandh.API.Services;
using FarmerBandh.Application.Interfaces;
using FarmerBandh.Application.Services;
using FarmerBandh.Application.Validators;
using FarmerBandh.Infrastructure.Data;
using FarmerBandh.Infrastructure.Data.Seed;
using FarmerBandh.Infrastructure.Repositories;
using FluentValidation;
using FluentValidation.AspNetCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;

LoadDotEnvFiles();

var builder = WebApplication.CreateBuilder(args);

// 1. Database Connection (supports DB_CONNECTION_STRING from .env)
var connectionString = Environment.GetEnvironmentVariable("DB_CONNECTION_STRING")
    ?? builder.Configuration.GetConnectionString("DefaultConnection")
    ?? throw new InvalidOperationException("DefaultConnection string is not configured.");

var serverVersion = new MySqlServerVersion(new Version(8, 0, 36));

builder.Services.AddDbContext<AppDbContext>(options =>
{
    options.UseMySql(connectionString, serverVersion, mySqlOptions =>
    {
        mySqlOptions.EnableRetryOnFailure(
            maxRetryCount: 5,
            maxRetryDelay: TimeSpan.FromSeconds(30),
            errorNumbersToAdd: null);
    });
});

// 2. Dependency Injection
builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<ITokenService, TokenService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<ICategoryRepository, CategoryRepository>();
builder.Services.AddScoped<IProductRepository, ProductRepository>();
builder.Services.AddScoped<IProductService, ProductService>();

// Phase 3 Repositories & Services
builder.Services.AddScoped<IAddressRepository, AddressRepository>();
builder.Services.AddScoped<ICartRepository, CartRepository>();
builder.Services.AddScoped<ICouponRepository, CouponRepository>();
builder.Services.AddScoped<IPlatformSettingRepository, PlatformSettingRepository>();
builder.Services.AddScoped<IOrderRepository, OrderRepository>();

builder.Services.AddScoped<IAddressService, AddressService>();
builder.Services.AddScoped<ICartService, CartService>();
builder.Services.AddScoped<IOrderService, OrderService>();

// Phase 4 Repositories & Services
builder.Services.AddScoped<ITimelineRepository, TimelineRepository>();
builder.Services.AddScoped<IReturnRepository, ReturnRepository>();
builder.Services.AddScoped<IDisputeRepository, DisputeRepository>();
builder.Services.AddScoped<IRefundRepository, RefundRepository>();
builder.Services.AddScoped<IReviewRepository, ReviewRepository>();
builder.Services.AddScoped<INegotiationRepository, NegotiationRepository>();
builder.Services.AddScoped<ISavedFarmerRepository, SavedFarmerRepository>();
builder.Services.AddScoped<IFarmerRepository, FarmerRepository>();

builder.Services.AddScoped<ITimelineService, TimelineService>();
builder.Services.AddScoped<IReturnService, ReturnService>();
builder.Services.AddScoped<IDisputeService, DisputeService>();
builder.Services.AddScoped<IRefundService, RefundService>();
builder.Services.AddScoped<IReviewService, ReviewService>();
builder.Services.AddScoped<INegotiationService, NegotiationService>();
builder.Services.AddScoped<ISavedFarmerService, SavedFarmerService>();
builder.Services.AddScoped<IFarmerPublicService, FarmerPublicService>();

// Phase 6 Repositories & Services (Seller Operations Toolkit)
builder.Services.AddScoped<ISellerOperationsRepository, SellerOperationsRepository>();
builder.Services.AddScoped<ISellerDashboardService, SellerDashboardService>();
builder.Services.AddScoped<ISellerListingService, SellerListingService>();
builder.Services.AddScoped<IPayoutService, PayoutService>();
builder.Services.AddScoped<IBankAccountService, BankAccountService>();
builder.Services.AddScoped<IVerificationService, VerificationService>();
builder.Services.AddScoped<ISellerAnalyticsService, SellerAnalyticsService>();
builder.Services.AddScoped<ISellerProfileService, SellerProfileService>();

// Phase 7 Repositories & Services (Admin Control Center)
builder.Services.AddScoped<IActivityLogger, ActivityLogger>();
builder.Services.AddScoped<IAdminRepository, AdminRepository>();
builder.Services.AddScoped<IAdminDashboardService, AdminDashboardService>();
builder.Services.AddScoped<IAdminUserService, AdminUserService>();
builder.Services.AddScoped<IAdminVerificationService, AdminVerificationService>();
builder.Services.AddScoped<IAdminListingService, AdminListingService>();
builder.Services.AddScoped<IAdminOrderService, AdminOrderService>();
builder.Services.AddScoped<IAdminDisputeService, AdminDisputeService>();
builder.Services.AddScoped<IAdminPayoutService, AdminPayoutService>();
builder.Services.AddScoped<IAdminRefundService, AdminRefundService>();
builder.Services.AddScoped<IAdminReportService, AdminReportService>();
builder.Services.AddScoped<IAdminCouponService, AdminCouponService>();
builder.Services.AddScoped<IAdminCategoryService, AdminCategoryService>();
builder.Services.AddScoped<IAdminSettingsService, AdminSettingsService>();
builder.Services.AddScoped<IAdminActivityService, AdminActivityService>();
builder.Services.AddScoped<IAdminProfileService, AdminProfileService>();

// Phase 8 Repositories & Services (Notifications)
builder.Services.AddScoped<INotificationRepository, NotificationRepository>();
builder.Services.AddScoped<INotificationService, NotificationService>();

// Chatbot AI Companion (OpenRouter)
builder.Services.AddHttpClient();
builder.Services.AddScoped<IChatbotService, ChatbotService>();

// Hosted background service for expiring stale negotiations every 15 min
builder.Services.AddHostedService<NegotiationExpiryService>();

// 3. FluentValidation
builder.Services.AddFluentValidationAutoValidation();
builder.Services.AddValidatorsFromAssemblyContaining<RegisterRequestValidator>();

// 4. Authentication & Authorization (supports JWT_KEY from .env)
var jwtKey = Environment.GetEnvironmentVariable("JWT_KEY") ?? builder.Configuration["Jwt:Key"] ?? "dev-signing-key-change-me-32-characters-minimum-length";
var jwtIssuer = Environment.GetEnvironmentVariable("JWT_ISSUER") ?? builder.Configuration["Jwt:Issuer"] ?? "FarmerBandh";
var jwtAudience = Environment.GetEnvironmentVariable("JWT_AUDIENCE") ?? builder.Configuration["Jwt:Audience"] ?? "FarmerBandhClient";

builder.Configuration["Jwt:Key"] = jwtKey;
builder.Configuration["Jwt:Issuer"] = jwtIssuer;
builder.Configuration["Jwt:Audience"] = jwtAudience;
if (!string.IsNullOrEmpty(Environment.GetEnvironmentVariable("JWT_ACCESS_TOKEN_MINUTES")))
    builder.Configuration["Jwt:AccessTokenMinutes"] = Environment.GetEnvironmentVariable("JWT_ACCESS_TOKEN_MINUTES");
if (!string.IsNullOrEmpty(Environment.GetEnvironmentVariable("JWT_REFRESH_TOKEN_DAYS")))
    builder.Configuration["Jwt:RefreshTokenDays"] = Environment.GetEnvironmentVariable("JWT_REFRESH_TOKEN_DAYS");

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = false;
    options.SaveToken = true;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidIssuer = jwtIssuer,
        ValidateAudience = true,
        ValidAudience = jwtAudience,
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
        ValidateLifetime = true,
        ClockSkew = TimeSpan.FromMinutes(1)
    };
});

builder.Services.AddAuthorization();

// 5. CORS Policy
builder.Services.AddCors(options =>
{
    options.AddPolicy("FarmerBandhClientPolicy", policy =>
    {
        policy.SetIsOriginAllowed(origin => true)
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new UtcDateTimeJsonConverter());
        options.JsonSerializerOptions.Converters.Add(new NullableUtcDateTimeJsonConverter());
    });
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "FarmerBandh API", Version = "v1" });
    c.ResolveConflictingActions(apiDescriptions => apiDescriptions.First());
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Example: 'Bearer {token}'",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

var app = builder.Build();

// 7. Seed Database in Development
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "FarmerBandh API v1");
    });

    using var scope = app.Services.CreateScope();
    var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    try
    {
        await DbSeeder.SeedAsync(dbContext);
    }
    catch (Exception ex)
    {
        var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "An error occurred seeding the database.");
    }
}

app.UseMiddleware<ExceptionMiddleware>();

var wwwrootDir = Path.Combine(app.Environment.ContentRootPath, "wwwroot");
if (!Directory.Exists(wwwrootDir))
{
    Directory.CreateDirectory(wwwrootDir);
}
var uploadsDir = Path.Combine(wwwrootDir, "uploads", "products");
if (!Directory.Exists(uploadsDir))
{
    Directory.CreateDirectory(uploadsDir);
}

app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new Microsoft.Extensions.FileProviders.PhysicalFileProvider(wwwrootDir),
    RequestPath = ""
});

app.UseCors("FarmerBandhClientPolicy");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();

static void LoadDotEnvFiles()
{
    var searchDirs = new[]
    {
        Directory.GetCurrentDirectory(),
        Path.Combine(Directory.GetCurrentDirectory(), ".."),
        Path.Combine(Directory.GetCurrentDirectory(), "..", ".."),
        Path.Combine(Directory.GetCurrentDirectory(), "..", "..", ".."),
        AppDomain.CurrentDomain.BaseDirectory
    };

    foreach (var dir in searchDirs)
    {
        try
        {
            var envPath = Path.Combine(dir, ".env");
            if (File.Exists(envPath))
            {
                foreach (var line in File.ReadAllLines(envPath))
                {
                    var trimmed = line.Trim();
                    if (string.IsNullOrWhiteSpace(trimmed) || trimmed.StartsWith('#'))
                        continue;

                    var eqIdx = trimmed.IndexOf('=');
                    if (eqIdx > 0)
                    {
                        var key = trimmed.Substring(0, eqIdx).Trim();
                        var val = trimmed.Substring(eqIdx + 1).Trim().Trim('"', '\'');
                        if (string.IsNullOrEmpty(Environment.GetEnvironmentVariable(key)))
                        {
                            Environment.SetEnvironmentVariable(key, val);
                        }
                    }
                }
            }
        }
        catch
        {
            // Ignore directory search issues
        }
    }
}
