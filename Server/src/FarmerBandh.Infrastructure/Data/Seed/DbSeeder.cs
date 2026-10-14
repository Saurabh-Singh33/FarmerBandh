using FarmerBandh.Domain.Entities;
using FarmerBandh.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace FarmerBandh.Infrastructure.Data.Seed;

public static class DbSeeder
{
    public static async Task SeedAsync(AppDbContext context)
    {
        await context.Database.EnsureCreatedAsync();

        // 1. Seed Users & Farmers & Buyers if missing
        var defaultAdminEmail = Environment.GetEnvironmentVariable("ADMIN_EMAIL")?.Trim().ToLower() ?? "admin@farmerbandh.com";
        var defaultAdminPassword = Environment.GetEnvironmentVariable("ADMIN_PASSWORD") ?? "Admin@123";

        if (!await context.Users.AnyAsync())
        {
            var adminUser = new User
            {
                Id = Guid.NewGuid(),
                FullName = "System Admin",
                Email = defaultAdminEmail,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(defaultAdminPassword),
                Role = UserRole.Admin,
                Status = UserStatus.Active,
                State = "Gujarat",
                District = "Ahmedabad",
                City = "Ahmedabad",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            await context.Users.AddAsync(adminUser);

            var rameshUser = new User
            {
                Id = Guid.NewGuid(),
                FullName = "Ramesh Patel",
                Email = "ramesh@farm.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Farmer@123"),
                Role = UserRole.Farmer,
                Status = UserStatus.Active,
                State = "Gujarat",
                District = "Ahmedabad",
                City = "Ahmedabad",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            var rameshFarmer = new Farmer
            {
                Id = Guid.NewGuid(),
                UserId = rameshUser.Id,
                FarmName = "Ramesh Farms",
                Location = "Ahmedabad Outer",
                State = "Gujarat",
                District = "Ahmedabad",
                Verified = 1,
                Rating = 4.8m,
                MemberSince = DateTime.UtcNow,
                CreatedAt = DateTime.UtcNow
            };
            await context.Users.AddAsync(rameshUser);
            await context.Farmers.AddAsync(rameshFarmer);

            var sunitaUser = new User
            {
                Id = Guid.NewGuid(),
                FullName = "Sunita Sharma",
                Email = "sunita@farm.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Farmer@123"),
                Role = UserRole.Farmer,
                Status = UserStatus.Active,
                State = "Gujarat",
                District = "Ahmedabad",
                City = "Ahmedabad",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            var sunitaFarmer = new Farmer
            {
                Id = Guid.NewGuid(),
                UserId = sunitaUser.Id,
                FarmName = "Sunita Organics",
                Location = "Sanand, Ahmedabad",
                State = "Gujarat",
                District = "Ahmedabad",
                Verified = 1,
                Rating = 4.9m,
                MemberSince = DateTime.UtcNow,
                CreatedAt = DateTime.UtcNow
            };
            await context.Users.AddAsync(sunitaUser);
            await context.Farmers.AddAsync(sunitaFarmer);

            var anitaUser = new User
            {
                Id = Guid.NewGuid(),
                FullName = "Anita Desai",
                Email = "anita@farm.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Buyer@123"),
                Role = UserRole.Buyer,
                Status = UserStatus.Active,
                State = "Gujarat",
                District = "Ahmedabad",
                City = "Ahmedabad",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            var anitaBuyer = new Buyer
            {
                Id = Guid.NewGuid(),
                UserId = anitaUser.Id,
                Phone = "+919876543210",
                DefaultAddressLine = "101 Green Avenue",
                City = "Ahmedabad",
                State = "Gujarat",
                Pincode = "380001",
                PreferredState = "Gujarat",
                PreferredDistrict = "Ahmedabad",
                CreatedAt = DateTime.UtcNow
            };
            await context.Users.AddAsync(anitaUser);
            await context.Buyers.AddAsync(anitaBuyer);

            var vivekUser = new User
            {
                Id = Guid.NewGuid(),
                FullName = "Vivek Shah",
                Email = "vivek@farm.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Buyer@123"),
                Role = UserRole.Buyer,
                Status = UserStatus.Active,
                State = "Gujarat",
                District = "Ahmedabad",
                City = "Ahmedabad",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            var vivekBuyer = new Buyer
            {
                Id = Guid.NewGuid(),
                UserId = vivekUser.Id,
                Phone = "+919876543211",
                DefaultAddressLine = "202 Riverfront Enclave",
                City = "Ahmedabad",
                State = "Gujarat",
                Pincode = "380009",
                PreferredState = "Gujarat",
                PreferredDistrict = "Ahmedabad",
                CreatedAt = DateTime.UtcNow
            };
            await context.Users.AddAsync(vivekUser);
            await context.Buyers.AddAsync(vivekBuyer);

            await context.SaveChangesAsync();
        }
        else
        {
            // Sync Admin password and email from .env even if database already has users
            var existingAdmin = await context.Users.FirstOrDefaultAsync(u => u.Role == UserRole.Admin || u.Email == defaultAdminEmail);
            if (existingAdmin != null)
            {
                existingAdmin.Email = defaultAdminEmail;
                existingAdmin.Role = UserRole.Admin;
                existingAdmin.Status = UserStatus.Active;
                if (!string.IsNullOrEmpty(defaultAdminPassword))
                {
                    existingAdmin.PasswordHash = BCrypt.Net.BCrypt.HashPassword(defaultAdminPassword);
                }
                await context.SaveChangesAsync();
            }
            else
            {
                var newAdmin = new User
                {
                    Id = Guid.NewGuid(),
                    FullName = "System Admin",
                    Email = defaultAdminEmail,
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword(defaultAdminPassword),
                    Role = UserRole.Admin,
                    Status = UserStatus.Active,
                    State = "Gujarat",
                    District = "Ahmedabad",
                    City = "Ahmedabad",
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };
                await context.Users.AddAsync(newAdmin);
                await context.SaveChangesAsync();
            }
        }

        // 2. Seed Categories if missing
        if (!await context.Categories.AnyAsync())
        {
            var categories = new[]
            {
                new Category { Id = Guid.NewGuid(), Name = "Grains", Slug = "grains", DisplayOrder = 1, IsActive = true, CreatedAt = DateTime.UtcNow },
                new Category { Id = Guid.NewGuid(), Name = "Pulses", Slug = "pulses", DisplayOrder = 2, IsActive = true, CreatedAt = DateTime.UtcNow },
                new Category { Id = Guid.NewGuid(), Name = "Vegetables", Slug = "vegetables", DisplayOrder = 3, IsActive = true, CreatedAt = DateTime.UtcNow },
                new Category { Id = Guid.NewGuid(), Name = "Fruits", Slug = "fruits", DisplayOrder = 4, IsActive = true, CreatedAt = DateTime.UtcNow },
                new Category { Id = Guid.NewGuid(), Name = "Spices", Slug = "spices", DisplayOrder = 5, IsActive = true, CreatedAt = DateTime.UtcNow },
                new Category { Id = Guid.NewGuid(), Name = "Other", Slug = "other", DisplayOrder = 6, IsActive = true, CreatedAt = DateTime.UtcNow }
            };
            await context.Categories.AddRangeAsync(categories);
            await context.SaveChangesAsync();
        }

        // 3. Seed Products if missing
        if (!await context.Products.AnyAsync())
        {
            var rameshFarmer = await context.Farmers.FirstOrDefaultAsync(f => f.FarmName.Contains("Ramesh"));
            var sunitaFarmer = await context.Farmers.FirstOrDefaultAsync(f => f.FarmName.Contains("Sunita"));

            if (rameshFarmer != null && sunitaFarmer != null)
            {
                var grains = await context.Categories.FirstAsync(c => c.Slug == "grains");
                var pulses = await context.Categories.FirstAsync(c => c.Slug == "pulses");
                var vegetables = await context.Categories.FirstAsync(c => c.Slug == "vegetables");
                var fruits = await context.Categories.FirstAsync(c => c.Slug == "fruits");
                var spices = await context.Categories.FirstAsync(c => c.Slug == "spices");
                var other = await context.Categories.FirstAsync(c => c.Slug == "other");

                var products = new[]
                {
                    new Product
                    {
                        Id = Guid.NewGuid(),
                        FarmerId = rameshFarmer.Id,
                        CategoryId = grains.Id,
                        Name = "Wheat — Grade A",
                        Slug = "wheat-grade-a",
                        Grade = ProductGrade.A,
                        PricePerQuintal = 2450.00m,
                        AvailableQuantityQuintal = 150.00m,
                        MinOrderQuantityQuintal = 5.00m,
                        BulkDiscountPercent = 5.00m,
                        BulkDiscountThresholdQuintal = 20.00m,
                        HarvestDate = DateTime.UtcNow.AddDays(-15),
                        Description = "Premium quality Sharbati wheat grown organically in Gujarat fertile soil. High protein content.",
                        ImageUrl = "/images/products/wheat-grade-a.jpg",
                        Verified = ProductVerificationStatus.Verified,
                        Status = ProductStatus.Active,
                        Rating = 4.9m,
                        RatingCount = 18,
                        State = "Gujarat",
                        District = "Ahmedabad",
                        City = "Ahmedabad Outer",
                        CreatedAt = DateTime.UtcNow.AddDays(-14)
                    },
                    new Product
                    {
                        Id = Guid.NewGuid(),
                        FarmerId = rameshFarmer.Id,
                        CategoryId = grains.Id,
                        Name = "Basmati Rice",
                        Slug = "basmati-rice",
                        Grade = ProductGrade.A,
                        PricePerQuintal = 5200.00m,
                        AvailableQuantityQuintal = 80.00m,
                        MinOrderQuantityQuintal = 2.00m,
                        BulkDiscountPercent = 8.00m,
                        BulkDiscountThresholdQuintal = 15.00m,
                        HarvestDate = DateTime.UtcNow.AddDays(-20),
                        Description = "Long grain aromatic 1121 Basmati rice, naturally aged for 12 months.",
                        ImageUrl = "/images/products/basmati-rice.jpg",
                        Verified = ProductVerificationStatus.Verified,
                        Status = ProductStatus.Active,
                        Rating = 4.8m,
                        RatingCount = 24,
                        State = "Gujarat",
                        District = "Ahmedabad",
                        City = "Ahmedabad Outer",
                        CreatedAt = DateTime.UtcNow.AddDays(-18)
                    },
                    new Product
                    {
                        Id = Guid.NewGuid(),
                        FarmerId = sunitaFarmer.Id,
                        CategoryId = grains.Id,
                        Name = "Yellow Maize",
                        Slug = "yellow-maize",
                        Grade = ProductGrade.B,
                        PricePerQuintal = 1950.00m,
                        AvailableQuantityQuintal = 200.00m,
                        MinOrderQuantityQuintal = 10.00m,
                        BulkDiscountPercent = 4.00m,
                        BulkDiscountThresholdQuintal = 50.00m,
                        HarvestDate = DateTime.UtcNow.AddDays(-10),
                        Description = "Clean, sun-dried corn suitable for feed and starch processing.",
                        ImageUrl = "/images/products/yellow-maize.jpg",
                        Verified = ProductVerificationStatus.Verified,
                        Status = ProductStatus.Active,
                        Rating = 4.5m,
                        RatingCount = 12,
                        State = "Gujarat",
                        District = "Ahmedabad",
                        City = "Sanand, Ahmedabad",
                        CreatedAt = DateTime.UtcNow.AddDays(-9)
                    },
                    new Product
                    {
                        Id = Guid.NewGuid(),
                        FarmerId = sunitaFarmer.Id,
                        CategoryId = pulses.Id,
                        Name = "Chana (Gram)",
                        Slug = "chana-gram",
                        Grade = ProductGrade.A,
                        PricePerQuintal = 4800.00m,
                        AvailableQuantityQuintal = 90.00m,
                        MinOrderQuantityQuintal = 2.00m,
                        BulkDiscountPercent = 6.00m,
                        BulkDiscountThresholdQuintal = 20.00m,
                        HarvestDate = DateTime.UtcNow.AddDays(-25),
                        Description = "Desi Bengal Gram, rich in nutrients, machine cleaned and sorted.",
                        ImageUrl = "/images/products/chana-gram.jpg",
                        Verified = ProductVerificationStatus.Verified,
                        Status = ProductStatus.Active,
                        Rating = 4.9m,
                        RatingCount = 31,
                        State = "Gujarat",
                        District = "Ahmedabad",
                        City = "Sanand, Ahmedabad",
                        CreatedAt = DateTime.UtcNow.AddDays(-22)
                    },
                    new Product
                    {
                        Id = Guid.NewGuid(),
                        FarmerId = rameshFarmer.Id,
                        CategoryId = pulses.Id,
                        Name = "Toor Dal",
                        Slug = "toor-dal",
                        Grade = ProductGrade.A,
                        PricePerQuintal = 5800.00m,
                        AvailableQuantityQuintal = 60.00m,
                        MinOrderQuantityQuintal = 2.00m,
                        BulkDiscountPercent = 5.00m,
                        BulkDiscountThresholdQuintal = 10.00m,
                        HarvestDate = DateTime.UtcNow.AddDays(-30),
                        Description = "Unpolished Pigeon Pea (Toor Dal), naturally farm processed.",
                        ImageUrl = "/images/products/toor-dal.jpg",
                        Verified = ProductVerificationStatus.Verified,
                        Status = ProductStatus.Active,
                        Rating = 4.7m,
                        RatingCount = 15,
                        State = "Gujarat",
                        District = "Ahmedabad",
                        City = "Ahmedabad Outer",
                        CreatedAt = DateTime.UtcNow.AddDays(-28)
                    },
                    new Product
                    {
                        Id = Guid.NewGuid(),
                        FarmerId = sunitaFarmer.Id,
                        CategoryId = pulses.Id,
                        Name = "Moong Dal",
                        Slug = "moong-dal",
                        Grade = ProductGrade.B,
                        PricePerQuintal = 5100.00m,
                        AvailableQuantityQuintal = 45.00m,
                        MinOrderQuantityQuintal = 1.00m,
                        BulkDiscountPercent = 0.00m,
                        HarvestDate = DateTime.UtcNow.AddDays(-12),
                        Description = "Green Gram (Moong), high digestibility and excellent taste.",
                        ImageUrl = "/images/products/moong-dal.jpg",
                        Verified = ProductVerificationStatus.Pending,
                        Status = ProductStatus.Active,
                        Rating = 4.3m,
                        RatingCount = 8,
                        State = "Gujarat",
                        District = "Ahmedabad",
                        City = "Sanand, Ahmedabad",
                        CreatedAt = DateTime.UtcNow.AddDays(-11)
                    },
                    new Product
                    {
                        Id = Guid.NewGuid(),
                        FarmerId = rameshFarmer.Id,
                        CategoryId = vegetables.Id,
                        Name = "Tomato",
                        Slug = "tomato-fresh",
                        Grade = ProductGrade.A,
                        PricePerQuintal = 2200.00m,
                        AvailableQuantityQuintal = 50.00m,
                        MinOrderQuantityQuintal = 1.00m,
                        BulkDiscountPercent = 10.00m,
                        BulkDiscountThresholdQuintal = 10.00m,
                        HarvestDate = DateTime.UtcNow.AddDays(-3),
                        Description = "Fresh red Hybrid Tomatoes, firm texture, ideal for transport.",
                        ImageUrl = "/images/products/tomato-fresh.jpg",
                        Verified = ProductVerificationStatus.Verified,
                        Status = ProductStatus.Active,
                        Rating = 4.6m,
                        RatingCount = 22,
                        State = "Gujarat",
                        District = "Ahmedabad",
                        City = "Ahmedabad Outer",
                        CreatedAt = DateTime.UtcNow.AddDays(-2)
                    },
                    new Product
                    {
                        Id = Guid.NewGuid(),
                        FarmerId = sunitaFarmer.Id,
                        CategoryId = vegetables.Id,
                        Name = "Onion",
                        Slug = "onion-red",
                        Grade = ProductGrade.A,
                        PricePerQuintal = 1800.00m,
                        AvailableQuantityQuintal = 120.00m,
                        MinOrderQuantityQuintal = 5.00m,
                        BulkDiscountPercent = 7.00m,
                        BulkDiscountThresholdQuintal = 25.00m,
                        HarvestDate = DateTime.UtcNow.AddDays(-8),
                        Description = "Nashik red onions, well dried bulbs with long storage life.",
                        ImageUrl = "/images/products/onion-red.jpg",
                        Verified = ProductVerificationStatus.Verified,
                        Status = ProductStatus.Active,
                        Rating = 4.8m,
                        RatingCount = 29,
                        State = "Gujarat",
                        District = "Ahmedabad",
                        City = "Sanand, Ahmedabad",
                        CreatedAt = DateTime.UtcNow.AddDays(-7)
                    },
                    new Product
                    {
                        Id = Guid.NewGuid(),
                        FarmerId = rameshFarmer.Id,
                        CategoryId = vegetables.Id,
                        Name = "Potato",
                        Slug = "potato-jyoti",
                        Grade = ProductGrade.B,
                        PricePerQuintal = 1400.00m,
                        AvailableQuantityQuintal = 180.00m,
                        MinOrderQuantityQuintal = 5.00m,
                        BulkDiscountPercent = 5.00m,
                        BulkDiscountThresholdQuintal = 30.00m,
                        HarvestDate = DateTime.UtcNow.AddDays(-14),
                        Description = "Jyoti variety table potatoes, medium size, farm fresh.",
                        ImageUrl = "/images/products/potato-jyoti.jpg",
                        Verified = ProductVerificationStatus.Verified,
                        Status = ProductStatus.Active,
                        Rating = 4.4m,
                        RatingCount = 14,
                        State = "Gujarat",
                        District = "Ahmedabad",
                        City = "Ahmedabad Outer",
                        CreatedAt = DateTime.UtcNow.AddDays(-13)
                    },
                    new Product
                    {
                        Id = Guid.NewGuid(),
                        FarmerId = sunitaFarmer.Id,
                        CategoryId = fruits.Id,
                        Name = "Banana",
                        Slug = "banana-g9",
                        Grade = ProductGrade.A,
                        PricePerQuintal = 1600.00m,
                        AvailableQuantityQuintal = 75.00m,
                        MinOrderQuantityQuintal = 3.00m,
                        BulkDiscountPercent = 6.00m,
                        BulkDiscountThresholdQuintal = 15.00m,
                        HarvestDate = DateTime.UtcNow.AddDays(-4),
                        Description = "Grand Naine (G9) fresh green bananas ready for ripening.",
                        ImageUrl = "/images/products/banana-g9.jpg",
                        Verified = ProductVerificationStatus.Verified,
                        Status = ProductStatus.Active,
                        Rating = 4.9m,
                        RatingCount = 19,
                        State = "Gujarat",
                        District = "Ahmedabad",
                        City = "Sanand, Ahmedabad",
                        CreatedAt = DateTime.UtcNow.AddDays(-3)
                    },
                    new Product
                    {
                        Id = Guid.NewGuid(),
                        FarmerId = rameshFarmer.Id,
                        CategoryId = fruits.Id,
                        Name = "Mango",
                        Slug = "mango-kesar",
                        Grade = ProductGrade.A,
                        PricePerQuintal = 5900.00m,
                        AvailableQuantityQuintal = 40.00m,
                        MinOrderQuantityQuintal = 1.00m,
                        BulkDiscountPercent = 10.00m,
                        BulkDiscountThresholdQuintal = 5.00m,
                        HarvestDate = DateTime.UtcNow.AddDays(-6),
                        Description = "Gir Kesar sweet aromatic organic mangoes, naturally tree-ripened.",
                        ImageUrl = "/images/products/mango-kesar.jpg",
                        Verified = ProductVerificationStatus.Verified,
                        Status = ProductStatus.Active,
                        Rating = 5.0m,
                        RatingCount = 42,
                        State = "Gujarat",
                        District = "Ahmedabad",
                        City = "Ahmedabad Outer",
                        CreatedAt = DateTime.UtcNow.AddDays(-5)
                    },
                    new Product
                    {
                        Id = Guid.NewGuid(),
                        FarmerId = sunitaFarmer.Id,
                        CategoryId = spices.Id,
                        Name = "Turmeric",
                        Slug = "turmeric-finger",
                        Grade = ProductGrade.A,
                        PricePerQuintal = 5400.00m,
                        AvailableQuantityQuintal = 35.00m,
                        MinOrderQuantityQuintal = 1.00m,
                        BulkDiscountPercent = 5.00m,
                        BulkDiscountThresholdQuintal = 5.00m,
                        HarvestDate = DateTime.UtcNow.AddDays(-40),
                        Description = "High curcumin dry finger turmeric, vibrant yellow and aromatic.",
                        ImageUrl = "/images/products/turmeric-finger.jpg",
                        Verified = ProductVerificationStatus.Verified,
                        Status = ProductStatus.Active,
                        Rating = 4.8m,
                        RatingCount = 11,
                        State = "Gujarat",
                        District = "Ahmedabad",
                        City = "Sanand, Ahmedabad",
                        CreatedAt = DateTime.UtcNow.AddDays(-35)
                    },
                    new Product
                    {
                        Id = Guid.NewGuid(),
                        FarmerId = rameshFarmer.Id,
                        CategoryId = spices.Id,
                        Name = "Red Chilli",
                        Slug = "red-chilli-reshampatti",
                        Grade = ProductGrade.B,
                        PricePerQuintal = 5700.00m,
                        AvailableQuantityQuintal = 30.00m,
                        MinOrderQuantityQuintal = 1.00m,
                        BulkDiscountPercent = 0.00m,
                        HarvestDate = DateTime.UtcNow.AddDays(-30),
                        Description = "Reshampatti dry red chilli with rich color and moderate pungency.",
                        ImageUrl = "/images/products/red-chilli-reshampatti.jpg",
                        Verified = ProductVerificationStatus.Pending,
                        Status = ProductStatus.Active,
                        Rating = 4.2m,
                        RatingCount = 7,
                        State = "Gujarat",
                        District = "Ahmedabad",
                        City = "Ahmedabad Outer",
                        CreatedAt = DateTime.UtcNow.AddDays(-25)
                    },
                    new Product
                    {
                        Id = Guid.NewGuid(),
                        FarmerId = sunitaFarmer.Id,
                        CategoryId = other.Id,
                        Name = "Organic Jaggery",
                        Slug = "organic-jaggery",
                        Grade = ProductGrade.A,
                        PricePerQuintal = 4200.00m,
                        AvailableQuantityQuintal = 50.00m,
                        MinOrderQuantityQuintal = 1.00m,
                        BulkDiscountPercent = 8.00m,
                        BulkDiscountThresholdQuintal = 10.00m,
                        HarvestDate = DateTime.UtcNow.AddDays(-18),
                        Description = "Chemical-free pure sugarcane jaggery blocks.",
                        ImageUrl = "/images/products/organic-jaggery.jpg",
                        Verified = ProductVerificationStatus.Verified,
                        Status = ProductStatus.Active,
                        Rating = 4.7m,
                        RatingCount = 16,
                        State = "Gujarat",
                        District = "Ahmedabad",
                        City = "Sanand, Ahmedabad",
                        CreatedAt = DateTime.UtcNow.AddDays(-15)
                    }
                };

                await context.Products.AddRangeAsync(products);
                await context.SaveChangesAsync();
            }
        }
        else
        {
            // Backfill ImageUrl for any existing products that lack it
            var productsWithoutImage = await context.Products.Where(p => string.IsNullOrEmpty(p.ImageUrl)).ToListAsync();
            if (productsWithoutImage.Any())
            {
                foreach (var p in productsWithoutImage)
                {
                    p.ImageUrl = $"/images/products/{p.Slug}.jpg";
                }
                await context.SaveChangesAsync();
            }
        }

        // 4. Seed Coupons if missing
        if (!await context.Coupons.AnyAsync())
        {
            var coupons = new[]
            {
                new Coupon
                {
                    Id = Guid.NewGuid(),
                    Code = "FIRST10",
                    Description = "10% Off on your first order up to ₹200",
                    Type = CouponType.Percent,
                    Value = 10.00m,
                    MinOrderValue = 500.00m,
                    MaxDiscount = 200.00m,
                    ValidFrom = DateTime.UtcNow.AddDays(-1),
                    ValidTo = DateTime.UtcNow.AddDays(90),
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                },
                new Coupon
                {
                    Id = Guid.NewGuid(),
                    Code = "BULK500",
                    Description = "Flat ₹500 Off on bulk orders above ₹5000",
                    Type = CouponType.Flat,
                    Value = 500.00m,
                    MinOrderValue = 5000.00m,
                    ValidFrom = DateTime.UtcNow.AddDays(-1),
                    ValidTo = DateTime.UtcNow.AddDays(90),
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                },
                new Coupon
                {
                    Id = Guid.NewGuid(),
                    Code = "FREESHIP",
                    Description = "Free delivery on orders above ₹1000",
                    Type = CouponType.FreeShipping,
                    Value = 0.00m,
                    MinOrderValue = 1000.00m,
                    ValidFrom = DateTime.UtcNow.AddDays(-1),
                    ValidTo = DateTime.UtcNow.AddDays(90),
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                },
                new Coupon
                {
                    Id = Guid.NewGuid(),
                    Code = "SAVE15",
                    Description = "15% Off on orders above ₹3000 up to ₹800",
                    Type = CouponType.Percent,
                    Value = 15.00m,
                    MinOrderValue = 3000.00m,
                    MaxDiscount = 800.00m,
                    ValidFrom = DateTime.UtcNow.AddDays(-1),
                    ValidTo = DateTime.UtcNow.AddDays(90),
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                }
            };
            await context.Coupons.AddRangeAsync(coupons);
            await context.SaveChangesAsync();
        }

        // 5. Seed PlatformSettings if missing
        if (!await context.PlatformSettings.AnyAsync())
        {
            var settings = new PlatformSetting
            {
                Id = Guid.NewGuid(),
                CommissionPercent = 2.00m,
                DefaultDeliveryFee = 50.00m,
                PlatformFee = 10.00m,
                TaxPercent = 5.00m,
                CODEnabled = true,
                UpdatedAt = DateTime.UtcNow
            };
            await context.PlatformSettings.AddAsync(settings);
            await context.SaveChangesAsync();
        }

        // 6. Seed Orders, OrderStatusHistory, ReturnRequests, Disputes, Reviews for Phase 4 demo if missing
        if (!await context.Orders.AnyAsync())
        {
            var anitaUser = await context.Users.FirstOrDefaultAsync(u => u.Email == "anita@farm.com");
            var vivekUser = await context.Users.FirstOrDefaultAsync(u => u.Email == "vivek@farm.com");
            var anitaBuyer = await context.Buyers.FirstOrDefaultAsync(b => b.UserId == anitaUser!.Id);
            var vivekBuyer = await context.Buyers.FirstOrDefaultAsync(b => b.UserId == vivekUser!.Id);
            var rameshFarmer = await context.Farmers.FirstOrDefaultAsync(f => f.FarmName.Contains("Ramesh"));
            var wheatProduct = await context.Products.FirstOrDefaultAsync(p => p.Slug == "wheat-grade-a");
            var basmatiProduct = await context.Products.FirstOrDefaultAsync(p => p.Slug == "basmati-rice");

            if (anitaUser != null && vivekUser != null && anitaBuyer != null && vivekBuyer != null && rameshFarmer != null && wheatProduct != null && basmatiProduct != null)
            {
                var now = DateTime.UtcNow;

                // Delivered Order #1
                var order1 = new Order
                {
                    Id = Guid.NewGuid(),
                    OrderNumber = "ORD-" + now.ToString("yyyyMMdd") + "-1001",
                    BuyerId = anitaBuyer.Id,
                    SellerId = rameshFarmer.Id,
                    AddressId = Guid.NewGuid(),
                    Subtotal = 12250.00m,
                    DiscountAmount = 612.50m,
                    DeliveryFee = 50.00m,
                    PlatformFee = 10.00m,
                    TaxAmount = 582.38m,
                    TotalAmount = 12269.88m,
                    PaymentMethod = PaymentMethod.COD,
                    PaymentStatus = PaymentStatus.Paid,
                    Status = OrderStatus.Delivered,
                    DeliveryLine1 = "101 Green Avenue",
                    DeliveryCity = "Ahmedabad",
                    DeliveryState = "Gujarat",
                    DeliveryPincode = "380001",
                    DeliveryPhone = "+919876543210",
                    PlacedAt = now.AddDays(-5),
                    ConfirmedAt = now.AddDays(-4),
                    PackedAt = now.AddDays(-3),
                    ShippedAt = now.AddDays(-2),
                    DeliveredAt = now.AddDays(-1)
                };

                var order1Item = new OrderItem
                {
                    Id = Guid.NewGuid(),
                    OrderId = order1.Id,
                    ProductId = wheatProduct.Id,
                    QuantityQuintal = 5.00m,
                    UnitPricePerQuintal = 2450.00m,
                    LineTotal = 12250.00m
                };

                order1.Items.Add(order1Item);
                await context.Orders.AddAsync(order1);

                // OrderStatusHistory for Order #1
                var history1 = new List<OrderStatusHistory>
                {
                    new OrderStatusHistory { Id = Guid.NewGuid(), OrderId = order1.Id, Status = OrderStatus.Pending, Note = "Order placed by buyer Anita Desai.", ChangedByUserId = anitaUser.Id, ChangedByRole = UserRole.Buyer, CreatedAt = now.AddDays(-5) },
                    new OrderStatusHistory { Id = Guid.NewGuid(), OrderId = order1.Id, Status = OrderStatus.Confirmed, Note = "Order accepted by seller Ramesh Patel.", ChangedByUserId = rameshFarmer.UserId, ChangedByRole = UserRole.Farmer, CreatedAt = now.AddDays(-4) },
                    new OrderStatusHistory { Id = Guid.NewGuid(), OrderId = order1.Id, Status = OrderStatus.Packed, Note = "Goods packed and ready for dispatch.", ChangedByUserId = rameshFarmer.UserId, ChangedByRole = UserRole.Farmer, CreatedAt = now.AddDays(-3) },
                    new OrderStatusHistory { Id = Guid.NewGuid(), OrderId = order1.Id, Status = OrderStatus.InTransit, Note = "Dispatched via local transport.", ChangedByUserId = rameshFarmer.UserId, ChangedByRole = UserRole.Farmer, CreatedAt = now.AddDays(-2) },
                    new OrderStatusHistory { Id = Guid.NewGuid(), OrderId = order1.Id, Status = OrderStatus.Delivered, Note = "Successfully delivered to buyer.", ChangedByUserId = rameshFarmer.UserId, ChangedByRole = UserRole.Farmer, CreatedAt = now.AddDays(-1) }
                };
                await context.OrderStatusHistories.AddRangeAsync(history1);

                // Shipped/InTransit Order #2 (Active order)
                var order2 = new Order
                {
                    Id = Guid.NewGuid(),
                    OrderNumber = "ORD-" + now.ToString("yyyyMMdd") + "-1002",
                    BuyerId = vivekBuyer.Id,
                    SellerId = rameshFarmer.Id,
                    AddressId = Guid.NewGuid(),
                    Subtotal = 10400.00m,
                    DiscountAmount = 0.00m,
                    DeliveryFee = 50.00m,
                    PlatformFee = 10.00m,
                    TaxAmount = 523.00m,
                    TotalAmount = 10983.00m,
                    PaymentMethod = PaymentMethod.UPI,
                    PaymentStatus = PaymentStatus.Paid,
                    Status = OrderStatus.InTransit,
                    DeliveryLine1 = "202 Riverfront Enclave",
                    DeliveryCity = "Ahmedabad",
                    DeliveryState = "Gujarat",
                    DeliveryPincode = "380009",
                    DeliveryPhone = "+919876543211",
                    PlacedAt = now.AddDays(-2),
                    ConfirmedAt = now.AddDays(-2).AddHours(2),
                    PackedAt = now.AddDays(-1),
                    ShippedAt = now.AddDays(-1).AddHours(4)
                };

                var order2Item = new OrderItem
                {
                    Id = Guid.NewGuid(),
                    OrderId = order2.Id,
                    ProductId = basmatiProduct.Id,
                    QuantityQuintal = 2.00m,
                    UnitPricePerQuintal = 5200.00m,
                    LineTotal = 10400.00m
                };
                order2.Items.Add(order2Item);
                await context.Orders.AddAsync(order2);

                var history2 = new List<OrderStatusHistory>
                {
                    new OrderStatusHistory { Id = Guid.NewGuid(), OrderId = order2.Id, Status = OrderStatus.Pending, Note = "Order placed by buyer Vivek Shah.", ChangedByUserId = vivekUser.Id, ChangedByRole = UserRole.Buyer, CreatedAt = now.AddDays(-2) },
                    new OrderStatusHistory { Id = Guid.NewGuid(), OrderId = order2.Id, Status = OrderStatus.Confirmed, Note = "Order accepted by seller Ramesh Patel.", ChangedByUserId = rameshFarmer.UserId, ChangedByRole = UserRole.Farmer, CreatedAt = now.AddDays(-2).AddHours(2) },
                    new OrderStatusHistory { Id = Guid.NewGuid(), OrderId = order2.Id, Status = OrderStatus.Packed, Note = "Batch bagged and tagged.", ChangedByUserId = rameshFarmer.UserId, ChangedByRole = UserRole.Farmer, CreatedAt = now.AddDays(-1) },
                    new OrderStatusHistory { Id = Guid.NewGuid(), OrderId = order2.Id, Status = OrderStatus.InTransit, Note = "Out for delivery with driver Ramesh.", ChangedByUserId = rameshFarmer.UserId, ChangedByRole = UserRole.Farmer, CreatedAt = now.AddDays(-1).AddHours(4) }
                };
                await context.OrderStatusHistories.AddRangeAsync(history2);

                await context.SaveChangesAsync();

                // Seed a sample Return Request for Order 1
                if (!await context.ReturnRequests.AnyAsync())
                {
                    var returnReq = new ReturnRequest
                    {
                        Id = Guid.NewGuid(),
                        OrderId = order1.Id,
                        BuyerId = anitaBuyer.Id,
                        SellerId = rameshFarmer.Id,
                        ReasonCategory = ReturnReasonCategory.Damaged,
                        Reason = "Grain moisture level was slightly higher than specified grade A requirements.",
                        Status = ReturnStatus.Requested,
                        RequestedAt = now.AddHours(-12)
                    };
                    returnReq.Items.Add(new ReturnItem
                    {
                        Id = Guid.NewGuid(),
                        ReturnRequestId = returnReq.Id,
                        OrderItemId = order1Item.Id,
                        QuantityQuintal = 1.00m,
                        Reason = "1 quintal bag damaged during transport"
                    });
                    await context.ReturnRequests.AddAsync(returnReq);
                }

                // Seed a sample Dispute for Order 1
                if (!await context.Disputes.AnyAsync())
                {
                    var dispute = new Dispute
                    {
                        Id = Guid.NewGuid(),
                        OrderId = order1.Id,
                        RaisedByUserId = anitaUser.Id,
                        RaisedByRole = UserRole.Buyer,
                        AgainstUserId = rameshFarmer.UserId,
                        Category = DisputeCategory.QualityIssue,
                        Subject = "Moisture level discrepancy in Wheat Grade A shipment",
                        Status = DisputeStatus.Open,
                        OpenedAt = now.AddHours(-10)
                    };
                    dispute.Messages.Add(new DisputeMessage
                    {
                        Id = Guid.NewGuid(),
                        DisputeId = dispute.Id,
                        SenderUserId = anitaUser.Id,
                        SenderRole = UserRole.Buyer,
                        Body = "Hello Ramesh, bag #3 had dampness at the bottom layer. Could you inspect or offer partial refund?",
                        CreatedAt = now.AddHours(-10)
                    });
                    dispute.Messages.Add(new DisputeMessage
                    {
                        Id = Guid.NewGuid(),
                        DisputeId = dispute.Id,
                        SenderUserId = rameshFarmer.UserId,
                        SenderRole = UserRole.Farmer,
                        Body = "Hi Anita, sorry about that! Let me check with the transport team. We can process a partial refund for 1 quintal.",
                        CreatedAt = now.AddHours(-2)
                    });
                    await context.Disputes.AddAsync(dispute);
                }

                // Seed Reviews for Wheat
                if (!await context.Reviews.AnyAsync())
                {
                    var reviews = new[]
                    {
                        new Review
                        {
                            Id = Guid.NewGuid(),
                            OrderId = order1.Id,
                            ProductId = wheatProduct.Id,
                            BuyerId = anitaBuyer.Id,
                            FarmerId = rameshFarmer.Id,
                            Rating = 5,
                            Title = "Excellent Sharbati Wheat!",
                            Body = "High quality grains and fast delivery. Very satisfied with Ramesh Farms.",
                            CreatedAt = now.AddDays(-1)
                        }
                    };
                    await context.Reviews.AddRangeAsync(reviews);

                    // Recalculate rating
                    wheatProduct.RatingCount = 1;
                    wheatProduct.Rating = 5.0m;
                }

            }
        }

        // 6. Seed Negotiations and Saved Farmers (independent & idempotent)
        await SeedNegotiationsAndSavedFarmersAsync(context);
    }

    private static async Task SeedNegotiationsAndSavedFarmersAsync(AppDbContext context)
    {
        var anitaUser = await context.Users.FirstOrDefaultAsync(u => u.Email == "anita@farm.com");
        var vivekUser = await context.Users.FirstOrDefaultAsync(u => u.Email == "vivek@farm.com");
        var rameshUser = await context.Users.FirstOrDefaultAsync(u => u.Email == "ramesh@farm.com");
        var sunitaUser = await context.Users.FirstOrDefaultAsync(u => u.Email == "sunita@farm.com");

        if (anitaUser == null || rameshUser == null || sunitaUser == null)
            return;

        var anitaBuyer = await context.Buyers.FirstOrDefaultAsync(b => b.UserId == anitaUser.Id);
        var vivekBuyer = vivekUser != null ? await context.Buyers.FirstOrDefaultAsync(b => b.UserId == vivekUser.Id) : null;
        var rameshFarmer = await context.Farmers.FirstOrDefaultAsync(f => f.UserId == rameshUser.Id);
        var sunitaFarmer = await context.Farmers.FirstOrDefaultAsync(f => f.UserId == sunitaUser.Id);

        if (anitaBuyer == null || rameshFarmer == null || sunitaFarmer == null)
            return;

        var wheatProduct = await context.Products.FirstOrDefaultAsync(p => p.FarmerId == rameshFarmer.Id && p.Name.Contains("Wheat"));
        var riceProduct = await context.Products.FirstOrDefaultAsync(p => p.Name.Contains("Rice") || p.Name.Contains("Basmati"));
        var tomatoProduct = await context.Products.FirstOrDefaultAsync(p => p.Name.Contains("Tomato"));

        var now = DateTime.UtcNow;

        // Seed SavedFarmers (idempotent)
        if (!await context.SavedFarmers.AnyAsync(s => s.BuyerId == anitaBuyer.Id && s.FarmerId == rameshFarmer.Id))
        {
            await context.SavedFarmers.AddAsync(new SavedFarmer
            {
                Id = Guid.NewGuid(),
                BuyerId = anitaBuyer.Id,
                FarmerId = rameshFarmer.Id,
                SavedAt = now.AddDays(-12),
                Note = "best wheat"
            });
        }

        if (!await context.SavedFarmers.AnyAsync(s => s.BuyerId == anitaBuyer.Id && s.FarmerId == sunitaFarmer.Id))
        {
            await context.SavedFarmers.AddAsync(new SavedFarmer
            {
                Id = Guid.NewGuid(),
                BuyerId = anitaBuyer.Id,
                FarmerId = sunitaFarmer.Id,
                SavedAt = now.AddDays(-8),
                Note = "reliable"
            });
        }

        if (vivekBuyer != null && !await context.SavedFarmers.AnyAsync(s => s.BuyerId == vivekBuyer.Id && s.FarmerId == rameshFarmer.Id))
        {
            await context.SavedFarmers.AddAsync(new SavedFarmer
            {
                Id = Guid.NewGuid(),
                BuyerId = vivekBuyer.Id,
                FarmerId = rameshFarmer.Id,
                SavedAt = now.AddDays(-5),
                Note = null
            });
        }

        // 1. Negotiation 1 — Open (anita @ ramesh, Wheat)
        if (wheatProduct != null && !await context.Negotiations.AnyAsync(n => n.BuyerId == anitaBuyer.Id && n.FarmerId == rameshFarmer.Id && n.ProductId == wheatProduct.Id))
        {
            var neg1 = new Negotiation
            {
                Id = Guid.NewGuid(),
                BuyerId = anitaBuyer.Id,
                FarmerId = rameshFarmer.Id,
                ProductId = wheatProduct.Id,
                InitialPricePerQuintal = wheatProduct.PricePerQuintal,
                CurrentOfferPrice = 2000.00m,
                CurrentOfferByUserId = anitaUser.Id,
                CurrentOfferByRole = UserRole.Buyer,
                LastCounterPrice = null,
                Status = NegotiationStatus.Open,
                OpenedAt = now.AddHours(-3),
                LastMessageAt = now.AddHours(-3),
                ExpiresAt = now.AddHours(45)
            };

            neg1.Messages.Add(new NegotiationMessage
            {
                Id = Guid.NewGuid(),
                NegotiationId = neg1.Id,
                SenderUserId = anitaUser.Id,
                SenderRole = UserRole.Buyer,
                MessageType = NegotiationMessageType.Offer,
                OfferPrice = 2000.00m,
                QuantityQuintal = 10.00m,
                Body = "Bulk order, will pick up locally.",
                IsRead = false,
                CreatedAt = now.AddHours(-3)
            });

            await context.Negotiations.AddAsync(neg1);
        }

        // 2. Negotiation 2 — Countered (vivek @ sunita, Rice)
        if (vivekUser != null && vivekBuyer != null && riceProduct != null &&
            !await context.Negotiations.AnyAsync(n => n.BuyerId == vivekBuyer.Id && n.FarmerId == sunitaFarmer.Id && n.ProductId == riceProduct.Id))
        {
            var neg2 = new Negotiation
            {
                Id = Guid.NewGuid(),
                BuyerId = vivekBuyer.Id,
                FarmerId = sunitaFarmer.Id,
                ProductId = riceProduct.Id,
                InitialPricePerQuintal = riceProduct.PricePerQuintal,
                CurrentOfferPrice = 4100.00m,
                CurrentOfferByUserId = sunitaUser.Id,
                CurrentOfferByRole = UserRole.Farmer,
                LastCounterPrice = 4000.00m,
                Status = NegotiationStatus.Countered,
                OpenedAt = now.AddHours(-6),
                LastMessageAt = now.AddHours(-1),
                ExpiresAt = now.AddHours(42)
            };

            neg2.Messages.Add(new NegotiationMessage
            {
                Id = Guid.NewGuid(),
                NegotiationId = neg2.Id,
                SenderUserId = vivekUser.Id,
                SenderRole = UserRole.Buyer,
                MessageType = NegotiationMessageType.Offer,
                OfferPrice = 4000.00m,
                QuantityQuintal = 5.00m,
                Body = "Looking for 5 quintals bulk discount.",
                IsRead = true,
                ReadAt = now.AddHours(-5),
                CreatedAt = now.AddHours(-6)
            });

            neg2.Messages.Add(new NegotiationMessage
            {
                Id = Guid.NewGuid(),
                NegotiationId = neg2.Id,
                SenderUserId = sunitaUser.Id,
                SenderRole = UserRole.Farmer,
                MessageType = NegotiationMessageType.CounterOffer,
                OfferPrice = 4100.00m,
                QuantityQuintal = 5.00m,
                Body = "Can do ₹4,100 for 5 quintals.",
                IsRead = false,
                CreatedAt = now.AddHours(-1)
            });

            await context.Negotiations.AddAsync(neg2);
        }

        // 3. Negotiation 3 — Accepted (anita @ sunita, Tomato)
        if (tomatoProduct != null && !await context.Negotiations.AnyAsync(n => n.BuyerId == anitaBuyer.Id && n.FarmerId == sunitaFarmer.Id && n.ProductId == tomatoProduct.Id))
        {
            var neg3 = new Negotiation
            {
                Id = Guid.NewGuid(),
                BuyerId = anitaBuyer.Id,
                FarmerId = sunitaFarmer.Id,
                ProductId = tomatoProduct.Id,
                InitialPricePerQuintal = tomatoProduct.PricePerQuintal,
                CurrentOfferPrice = 26.00m,
                CurrentOfferByUserId = anitaUser.Id,
                CurrentOfferByRole = UserRole.Buyer,
                LastCounterPrice = 26.00m,
                Status = NegotiationStatus.Accepted,
                AgreedPricePerQuintal = 26.00m,
                QuantityQuintal = 20.00m,
                OpenedAt = now.AddDays(-2).AddHours(-4),
                LastMessageAt = now.AddDays(-2),
                AcceptedAt = now.AddDays(-2),
                ExpiresAt = now.AddDays(-2).AddHours(44)
            };

            neg3.Messages.Add(new NegotiationMessage
            {
                Id = Guid.NewGuid(),
                NegotiationId = neg3.Id,
                SenderUserId = anitaUser.Id,
                SenderRole = UserRole.Buyer,
                MessageType = NegotiationMessageType.Offer,
                OfferPrice = 25.00m,
                QuantityQuintal = 20.00m,
                Body = "Can you give bulk rate for 20 qtls?",
                IsRead = true,
                ReadAt = now.AddDays(-2).AddHours(-3),
                CreatedAt = now.AddDays(-2).AddHours(-4)
            });

            neg3.Messages.Add(new NegotiationMessage
            {
                Id = Guid.NewGuid(),
                NegotiationId = neg3.Id,
                SenderUserId = sunitaUser.Id,
                SenderRole = UserRole.Farmer,
                MessageType = NegotiationMessageType.CounterOffer,
                OfferPrice = 26.00m,
                QuantityQuintal = 20.00m,
                Body = "Best I can do is ₹26/qtl for premium grade.",
                IsRead = true,
                ReadAt = now.AddDays(-2).AddHours(-1),
                CreatedAt = now.AddDays(-2).AddHours(-2)
            });

            neg3.Messages.Add(new NegotiationMessage
            {
                Id = Guid.NewGuid(),
                NegotiationId = neg3.Id,
                SenderUserId = anitaUser.Id,
                SenderRole = UserRole.Buyer,
                MessageType = NegotiationMessageType.Accept,
                OfferPrice = 26.00m,
                QuantityQuintal = 20.00m,
                Body = "Buyer accepted the agreed price of ₹26/quintal.",
                IsRead = true,
                ReadAt = now.AddDays(-2),
                CreatedAt = now.AddDays(-2)
            });

            await context.Negotiations.AddAsync(neg3);
        }

        // Phase 6 — Seed Seller Operations (Bank Accounts, Settings, Payouts, Verification)
        await SeedSellerOperationsAsync(context);

        await context.SaveChangesAsync();
    }

    private static async Task SeedSellerOperationsAsync(AppDbContext context)
    {
        var now = DateTime.UtcNow;

        var rameshFarmer = await context.Farmers.Include(f => f.User).FirstOrDefaultAsync(f => f.User.Email == "ramesh@farm.com");
        var sunitaFarmer = await context.Farmers.Include(f => f.User).FirstOrDefaultAsync(f => f.User.Email == "sunita@farm.com");
        var adminUser = await context.Users.FirstOrDefaultAsync(u => u.Role == UserRole.Admin);

        if (rameshFarmer != null)
        {
            // 1. Bank Account for Ramesh
            if (!await context.BankAccounts.AnyAsync(b => b.FarmerId == rameshFarmer.Id))
            {
                var rameshBank = new BankAccount
                {
                    Id = Guid.NewGuid(),
                    FarmerId = rameshFarmer.Id,
                    AccountHolderName = "Ramesh Patel",
                    AccountNumber = "1234567890123",
                    IfscCode = "HDFC0001234",
                    BankName = "HDFC Bank",
                    BranchName = "Ahmedabad Main Branch",
                    UpiId = "ramesh@hdfcbank",
                    IsVerified = true,
                    CreatedAt = now.AddMonths(-6)
                };
                await context.BankAccounts.AddAsync(rameshBank);
            }

            // 2. Seller Settings for Ramesh
            if (!await context.SellerSettings.AnyAsync(s => s.FarmerId == rameshFarmer.Id))
            {
                var rameshSettings = new SellerSettings
                {
                    Id = Guid.NewGuid(),
                    FarmerId = rameshFarmer.Id,
                    PayoutCadence = PayoutCadence.OnRequest,
                    MinimumPayoutAmount = 500m,
                    NotifyOnNewOrder = true,
                    NotifyOnNewNegotiation = true,
                    NotifyOnNewReturn = true,
                    NotifyOnNewReview = true,
                    UpdatedAt = now
                };
                await context.SellerSettings.AddAsync(rameshSettings);
            }

            // 3. Payouts for Ramesh
            if (!await context.Payouts.AnyAsync(p => p.FarmerId == rameshFarmer.Id && p.Reference == "TXN-MOCK-202609-001"))
            {
                var rameshPaidPayout = new Payout
                {
                    Id = Guid.NewGuid(),
                    PayoutNumber = "FB-PO-20260914-0001",
                    FarmerId = rameshFarmer.Id,
                    Amount = 22000m,
                    Status = PayoutStatus.Paid,
                    Method = PayoutMethod.BankTransfer,
                    BankAccountNameSnapshot = "Ramesh Patel",
                    BankAccountNumberSnapshot = "1234567890123",
                    IfscCodeSnapshot = "HDFC0001234",
                    UpiIdSnapshot = "ramesh@hdfcbank",
                    RequestedAt = now.AddDays(-30),
                    ProcessedAt = now.AddDays(-25),
                    PaidAt = now.AddDays(-25),
                    Reference = "TXN-MOCK-202609-001",
                    Notes = "September earnings payout"
                };
                await context.Payouts.AddAsync(rameshPaidPayout);
            }

            if (!await context.Payouts.AnyAsync(p => p.FarmerId == rameshFarmer.Id && p.Status == PayoutStatus.Pending))
            {
                var rameshPendingPayout = new Payout
                {
                    Id = Guid.NewGuid(),
                    PayoutNumber = "FB-PO-20261012-0002",
                    FarmerId = rameshFarmer.Id,
                    Amount = 12500m,
                    Status = PayoutStatus.Pending,
                    Method = PayoutMethod.BankTransfer,
                    BankAccountNameSnapshot = "Ramesh Patel",
                    BankAccountNumberSnapshot = "1234567890123",
                    IfscCodeSnapshot = "HDFC0001234",
                    UpiIdSnapshot = "ramesh@hdfcbank",
                    RequestedAt = now.AddDays(-2),
                    Notes = "Mid-October payout request"
                };
                await context.Payouts.AddAsync(rameshPendingPayout);
            }

            // 4. Verification Request for Ramesh (Approved, Farmers.Verified = 2)
            if (!await context.VerificationRequests.AnyAsync(v => v.FarmerId == rameshFarmer.Id))
            {
                var rameshVerification = new VerificationRequest
                {
                    Id = Guid.NewGuid(),
                    FarmerId = rameshFarmer.Id,
                    RequestNumber = "FB-VR-20260417-0001",
                    AadhaarNumber = "123456789012",
                    LandRecordUrl = "ramesh_land_record_7_12.pdf",
                    SelfieUrl = "ramesh_selfie_verification.jpg",
                    Notes = "Ahmedabad farm ownership proof",
                    Status = VerificationRequestStatus.Approved,
                    SubmittedAt = now.AddMonths(-6),
                    ReviewedAt = now.AddMonths(-6).AddDays(2),
                    ReviewedByUserId = adminUser?.Id
                };
                await context.VerificationRequests.AddAsync(rameshVerification);
                rameshFarmer.Verified = 2; // Verified
            }
        }

        if (sunitaFarmer != null)
        {
            // 1. Bank Account for Sunita
            if (!await context.BankAccounts.AnyAsync(b => b.FarmerId == sunitaFarmer.Id))
            {
                var sunitaBank = new BankAccount
                {
                    Id = Guid.NewGuid(),
                    FarmerId = sunitaFarmer.Id,
                    AccountHolderName = "Sunita Sharma",
                    AccountNumber = "9876543210987",
                    IfscCode = "ICIC0005678",
                    BankName = "ICICI Bank",
                    BranchName = "Ahmedabad Branch",
                    UpiId = null,
                    IsVerified = true,
                    CreatedAt = now.AddMonths(-3)
                };
                await context.BankAccounts.AddAsync(sunitaBank);
            }

            // 2. Seller Settings for Sunita
            if (!await context.SellerSettings.AnyAsync(s => s.FarmerId == sunitaFarmer.Id))
            {
                var sunitaSettings = new SellerSettings
                {
                    Id = Guid.NewGuid(),
                    FarmerId = sunitaFarmer.Id,
                    PayoutCadence = PayoutCadence.OnRequest,
                    MinimumPayoutAmount = 500m,
                    NotifyOnNewOrder = true,
                    NotifyOnNewNegotiation = true,
                    NotifyOnNewReturn = true,
                    NotifyOnNewReview = true,
                    UpdatedAt = now
                };
                await context.SellerSettings.AddAsync(sunitaSettings);
            }

            // 3. Payouts for Sunita (One Paid payout: ₹18,000)
            if (!await context.Payouts.AnyAsync(p => p.FarmerId == sunitaFarmer.Id))
            {
                var sunitaPaidPayout = new Payout
                {
                    Id = Guid.NewGuid(),
                    PayoutNumber = "FB-PO-20260924-0003",
                    FarmerId = sunitaFarmer.Id,
                    Amount = 18000m,
                    Status = PayoutStatus.Paid,
                    Method = PayoutMethod.BankTransfer,
                    BankAccountNameSnapshot = "Sunita Sharma",
                    BankAccountNumberSnapshot = "9876543210987",
                    IfscCodeSnapshot = "ICIC0005678",
                    UpiIdSnapshot = null,
                    RequestedAt = now.AddDays(-20),
                    ProcessedAt = now.AddDays(-15),
                    PaidAt = now.AddDays(-15),
                    Reference = "TXN-MOCK-202609-002",
                    Notes = "Harvest festival payout"
                };
                await context.Payouts.AddAsync(sunitaPaidPayout);
            }

            // 4. Verification Request for Sunita (Pending, Farmers.Verified = 1)
            if (!await context.VerificationRequests.AnyAsync(v => v.FarmerId == sunitaFarmer.Id))
            {
                var sunitaVerification = new VerificationRequest
                {
                    Id = Guid.NewGuid(),
                    FarmerId = sunitaFarmer.Id,
                    RequestNumber = "FB-VR-20261011-0002",
                    AadhaarNumber = "987654321098",
                    LandRecordUrl = "sunita_organic_cert.pdf",
                    SelfieUrl = "sunita_photo.jpg",
                    Notes = "Organic certified farm in Sanand",
                    Status = VerificationRequestStatus.Pending,
                    SubmittedAt = now.AddDays(-3)
                };
                await context.VerificationRequests.AddAsync(sunitaVerification);
                sunitaFarmer.Verified = 1; // Pending
            }

            // ==========================================
            // Phase 7 Seeding: PlatformSettings, ActivityLogs, FeaturedListings
            // ==========================================
            var envAdminEmail = Environment.GetEnvironmentVariable("ADMIN_EMAIL")?.Trim().ToLower();
            var envAdminPassword = Environment.GetEnvironmentVariable("ADMIN_PASSWORD");

            var adminUser7 = await context.Users.FirstOrDefaultAsync(u => u.Role == UserRole.Admin);
            if (adminUser7 != null)
            {
                bool adminUpdated = false;
                if (!string.IsNullOrWhiteSpace(envAdminEmail) && adminUser7.Email != envAdminEmail)
                {
                    adminUser7.Email = envAdminEmail;
                    adminUpdated = true;
                }
                if (!string.IsNullOrWhiteSpace(envAdminPassword) && !BCrypt.Net.BCrypt.Verify(envAdminPassword, adminUser7.PasswordHash))
                {
                    adminUser7.PasswordHash = BCrypt.Net.BCrypt.HashPassword(envAdminPassword);
                    adminUpdated = true;
                }
                if (adminUpdated)
                {
                    adminUser7.UpdatedAt = now;
                    await context.SaveChangesAsync();
                }
            }

            var rameshFarmer7 = await context.Farmers.FirstOrDefaultAsync(f => f.FarmName.Contains("Ramesh"));

            // 1. Extended PlatformSettings
            var platformSettings = await context.PlatformSettings.FirstOrDefaultAsync();
            if (platformSettings != null)
            {
                platformSettings.MaintenanceModeEnabled = false;
                platformSettings.NewRegistrationsEnabled = true;
                platformSettings.NegotiationsEnabled = true;
                platformSettings.VerifiedOnlyMarketplace = false;
                platformSettings.MaxDeliverySlotsPerDay = 5;
                platformSettings.SupportEmail = "support@farmerbandh.com";
                platformSettings.SupportPhone = "1800123456";
                platformSettings.UpdatedByUserId = adminUser7?.Id;
                platformSettings.UpdatedAt = now;
            }

            // 2. ActivityLogs (5 historical logs)
            if (!await context.ActivityLogs.AnyAsync() && adminUser7 != null)
            {
                var logs = new List<ActivityLog>
                {
                    new ActivityLog
                    {
                        Id = Guid.NewGuid(),
                        ActorUserId = adminUser7.Id,
                        ActorRole = UserRole.Admin,
                        Action = "FARMER_VERIFIED",
                        TargetType = "Farmer",
                        TargetId = rameshFarmer7?.Id,
                        Summary = "Verification approved for Ramesh Patel",
                        Metadata = "{\"verifiedStatus\":\"Approved\",\"aadhaarVerified\":true}",
                        IpAddress = "127.0.0.1",
                        UserAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/129.0.0.0",
                        CreatedAt = now.AddDays(-24)
                    },
                    new ActivityLog
                    {
                        Id = Guid.NewGuid(),
                        ActorUserId = adminUser7.Id,
                        ActorRole = UserRole.Admin,
                        Action = "LISTING_REMOVED",
                        TargetType = "Listing",
                        TargetId = Guid.NewGuid(),
                        Summary = "Listing removed for policy violation",
                        Metadata = "{\"reason\":\"Prohibited fertilizer item in agricultural category\"}",
                        IpAddress = "127.0.0.1",
                        UserAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/129.0.0.0",
                        CreatedAt = now.AddDays(-18)
                    },
                    new ActivityLog
                    {
                        Id = Guid.NewGuid(),
                        ActorUserId = adminUser7.Id,
                        ActorRole = UserRole.Admin,
                        Action = "PAYOUT_PROCESSED",
                        TargetType = "Payout",
                        TargetId = Guid.NewGuid(),
                        Summary = "Payout FB-PO-20260924-0003 processed (₹18,000) for Sunita Sharma",
                        Metadata = "{\"amount\":18000,\"reference\":\"TXN-MOCK-202609-002\",\"method\":\"BankTransfer\"}",
                        IpAddress = "127.0.0.1",
                        UserAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/129.0.0.0",
                        CreatedAt = now.AddDays(-15)
                    },
                    new ActivityLog
                    {
                        Id = Guid.NewGuid(),
                        ActorUserId = adminUser7.Id,
                        ActorRole = UserRole.Admin,
                        Action = "SETTINGS_UPDATED",
                        TargetType = "Settings",
                        TargetId = platformSettings?.Id,
                        Summary = "Platform commission fee updated to 2.0%",
                        Metadata = "{\"commissionPercent\":2.0,\"taxPercent\":5.0,\"defaultDeliveryFee\":50.0}",
                        IpAddress = "127.0.0.1",
                        UserAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/129.0.0.0",
                        CreatedAt = now.AddDays(-10)
                    },
                    new ActivityLog
                    {
                        Id = Guid.NewGuid(),
                        ActorUserId = adminUser7.Id,
                        ActorRole = UserRole.Admin,
                        Action = "DISPUTE_RESOLVED",
                        TargetType = "Dispute",
                        TargetId = Guid.NewGuid(),
                        Summary = "Dispute resolved in favor of buyer with refund",
                        Metadata = "{\"favor\":\"buyer\",\"resolutionNote\":\"Packaging damaged in transit, verified with photos\",\"refundCreated\":true}",
                        IpAddress = "127.0.0.1",
                        UserAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/129.0.0.0",
                        CreatedAt = now.AddDays(-5)
                    }
                };

                await context.ActivityLogs.AddRangeAsync(logs);
            }

            // 3. FeaturedListings (Wheat, Basmati Rice, Tomato)
            if (!await context.FeaturedListings.AnyAsync() && adminUser7 != null)
            {
                var wheat = await context.Products.FirstOrDefaultAsync(p => p.Slug == "wheat-grade-a");
                var basmati = await context.Products.FirstOrDefaultAsync(p => p.Slug == "basmati-rice");
                var tomato = await context.Products.FirstOrDefaultAsync(p => p.Slug == "tomato-fresh");

                var featured = new List<FeaturedListing>();

                if (wheat != null)
                {
                    featured.Add(new FeaturedListing
                    {
                        Id = Guid.NewGuid(),
                        ProductId = wheat.Id,
                        FeaturedByUserId = adminUser7.Id,
                        DisplayOrder = 1,
                        StartsAt = now.AddDays(-30),
                        EndsAt = null,
                        IsActive = true,
                        CreatedAt = now.AddDays(-30)
                    });
                }

                if (basmati != null)
                {
                    featured.Add(new FeaturedListing
                    {
                        Id = Guid.NewGuid(),
                        ProductId = basmati.Id,
                        FeaturedByUserId = adminUser7.Id,
                        DisplayOrder = 2,
                        StartsAt = now.AddDays(-30),
                        EndsAt = null,
                        IsActive = true,
                        CreatedAt = now.AddDays(-30)
                    });
                }

                if (tomato != null)
                {
                    featured.Add(new FeaturedListing
                    {
                        Id = Guid.NewGuid(),
                        ProductId = tomato.Id,
                        FeaturedByUserId = adminUser7.Id,
                        DisplayOrder = 3,
                        StartsAt = now.AddDays(-30),
                        EndsAt = null,
                        IsActive = true,
                        CreatedAt = now.AddDays(-30)
                    });
                }

                if (featured.Count > 0)
                {
                    await context.FeaturedListings.AddRangeAsync(featured);
                }
            }

            // -------------------------------------------------------------
            // PHASE 8: NOTIFICATIONS & NOTIFICATION PREFERENCES
            // -------------------------------------------------------------
            // 1. Notification Preferences for all existing users
            var allUsers = await context.Users.ToListAsync();
            foreach (var u in allUsers)
            {
                var hasPref = await context.NotificationPreferences.AnyAsync(p => p.UserId == u.Id);
                if (!hasPref)
                {
                    await context.NotificationPreferences.AddAsync(new NotificationPreference
                    {
                        Id = Guid.NewGuid(),
                        UserId = u.Id,
                        OrderUpdates = true,
                        NegotiationUpdates = true,
                        ReturnDisputeUpdates = true,
                        PayoutUpdates = true,
                        VerificationUpdates = true,
                        ReviewUpdates = true,
                        SystemAnnouncements = true,
                        UpdatedAt = now
                    });
                }
            }
            await context.SaveChangesAsync();

            // 2. Seed realistic notifications for anita, ramesh, sunita
            var anita = await context.Users.FirstOrDefaultAsync(u => u.Email == "anita@farm.com");
            var ramesh = await context.Users.FirstOrDefaultAsync(u => u.Email == "ramesh@farm.com");
            var sunita = await context.Users.FirstOrDefaultAsync(u => u.Email == "sunita@farm.com");

            var seedNotifs = new List<Notification>();

            if (anita != null)
            {
                AddNotificationIfMissing(seedNotifs, context, anita.Id, NotificationType.ORDER_PACKED, NotificationCategory.Order,
                    "Order Packed", "Your order #FB-20261012-0018 is packed and ready to ship.", "/orders", isRead: false);

                AddNotificationIfMissing(seedNotifs, context, anita.Id, NotificationType.NEGOTIATION_REPLIED, NotificationCategory.Negotiation,
                    "Negotiation Countered", "Ramesh Farms countered your offer at ₹2,100 / quintal.", "/negotiations", isRead: false);

                AddNotificationIfMissing(seedNotifs, context, anita.Id, NotificationType.ORDER_DELIVERED, NotificationCategory.Order,
                    "Order Delivered", "Your order #FB-20261010-0015 was delivered. Leave a review?", "/orders", isRead: true, readAt: now.AddDays(-2));

                AddNotificationIfMissing(seedNotifs, context, anita.Id, NotificationType.SYSTEM_ANNOUNCEMENT, NotificationCategory.System,
                    "Welcome to FarmerBandh!", "Welcome to FarmerBandh! Explore direct local produce near you.", "/marketplace", isRead: true, readAt: now.AddDays(-5));
            }

            if (ramesh != null)
            {
                AddNotificationIfMissing(seedNotifs, context, ramesh.Id, NotificationType.ORDER_PLACED, NotificationCategory.Order,
                    "New order received", "Saurabh Singh placed an order for 2 quintals of Wheat — Grade A.", "/seller/orders", isRead: false);

                AddNotificationIfMissing(seedNotifs, context, ramesh.Id, NotificationType.NEGOTIATION_STARTED, NotificationCategory.Negotiation,
                    "New negotiation started", "Anita Desai wants to negotiate on Wheat — Grade A. Initial offer ₹2,000 / quintal.", "/seller/negotiations", isRead: false);

                AddNotificationIfMissing(seedNotifs, context, ramesh.Id, NotificationType.VERIFICATION_APPROVED, NotificationCategory.Verification,
                    "Verification Approved", "Your farm verification was approved. Verified badge is now live.", "/seller/verification", isRead: true, readAt: now.AddDays(-10));

                AddNotificationIfMissing(seedNotifs, context, ramesh.Id, NotificationType.PAYOUT_PROCESSED, NotificationCategory.Payout,
                    "Payout Processed", "Your payout of ₹22,000 has been processed. Reference TXN-MOCK-202609-001.", "/seller/payouts", isRead: true, readAt: now.AddDays(-7));
            }

            if (sunita != null)
            {
                AddNotificationIfMissing(seedNotifs, context, sunita.Id, NotificationType.RETURN_REQUESTED, NotificationCategory.ReturnDispute,
                    "Return Requested", "Vivek Shah requested a return on order #FB-20261008-0012.", "/seller/returns", isRead: false);

                AddNotificationIfMissing(seedNotifs, context, sunita.Id, NotificationType.REVIEW_RECEIVED, NotificationCategory.Review,
                    "5-Star Review Received", "Anita Desai left a 5-star review on Tomato.", "/seller/dashboard", isRead: true, readAt: now.AddDays(-4));
            }

            if (seedNotifs.Count > 0)
            {
                await context.Notifications.AddRangeAsync(seedNotifs);
                await context.SaveChangesAsync();
            }

            await context.SaveChangesAsync();
        }
    }

    private static void AddNotificationIfMissing(
        List<Notification> list,
        AppDbContext context,
        Guid userId,
        NotificationType type,
        NotificationCategory cat,
        string title,
        string body,
        string link,
        bool isRead,
        DateTime? readAt = null)
    {
        var exists = context.Notifications.Any(n => n.UserId == userId && n.Title == title);
        if (!exists)
        {
            list.Add(new Notification
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                Type = type,
                Category = cat,
                Title = title,
                Body = body,
                Link = link,
                IsRead = isRead,
                ReadAt = isRead ? (readAt ?? DateTime.UtcNow) : null,
                CreatedAt = readAt ?? DateTime.UtcNow
            });
        }
    }
}
