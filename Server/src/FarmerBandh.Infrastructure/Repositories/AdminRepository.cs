using System.Globalization;
using FarmerBandh.Application.DTOs.Admin;
using FarmerBandh.Application.Interfaces;
using FarmerBandh.Domain.Entities;
using FarmerBandh.Domain.Enums;
using FarmerBandh.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace FarmerBandh.Infrastructure.Repositories;

public class AdminRepository : IAdminRepository
{
    private readonly AppDbContext _context;

    public AdminRepository(AppDbContext context)
    {
        _context = context;
    }

    #region Dashboard
    public async Task<AdminDashboardDto> GetDashboardAsync()
    {
        var now = DateTime.UtcNow;
        var startOfMonth = new DateTime(now.Year, now.Month, 1, 0, 0, 0, DateTimeKind.Utc);
        var startOfToday = new DateTime(now.Year, now.Month, now.Day, 0, 0, 0, DateTimeKind.Utc);
        var startOfWeek = startOfToday.AddDays(-(int)startOfToday.DayOfWeek);

        // Users
        var totalUsers = await _context.Users.CountAsync();
        var buyers = await _context.Users.CountAsync(u => u.Role == UserRole.Buyer);
        var farmers = await _context.Users.CountAsync(u => u.Role == UserRole.Farmer);
        var admins = await _context.Users.CountAsync(u => u.Role == UserRole.Admin);
        var newUsersThisMonth = await _context.Users.CountAsync(u => u.CreatedAt >= startOfMonth);
        var suspendedUsers = await _context.Users.CountAsync(u => u.Status == UserStatus.Suspended);

        // Orders
        var totalOrders = await _context.Orders.CountAsync();
        var todayOrders = await _context.Orders.CountAsync(o => o.PlacedAt >= startOfToday);
        var weekOrders = await _context.Orders.CountAsync(o => o.PlacedAt >= startOfWeek);
        var monthOrders = await _context.Orders.CountAsync(o => o.PlacedAt >= startOfMonth);
        var pendingOrders = await _context.Orders.CountAsync(o => o.Status == OrderStatus.Pending || o.Status == OrderStatus.Confirmed);
        var deliveredOrders = await _context.Orders.CountAsync(o => o.Status == OrderStatus.Delivered);
        var cancelledOrders = await _context.Orders.CountAsync(o => o.Status == OrderStatus.Cancelled);
        var disputedOrders = await _context.Disputes.CountAsync(d => d.Status == DisputeStatus.Open || d.Status == DisputeStatus.Escalated);

        // Revenue
        var allDelivered = await _context.Orders
            .Where(o => o.Status == OrderStatus.Delivered)
            .ToListAsync();
        var monthDelivered = allDelivered.Where(o => o.DeliveredAt >= startOfMonth || o.PlacedAt >= startOfMonth).ToList();

        var gmvAllTime = allDelivered.Sum(o => o.TotalAmount);
        var gmvThisMonth = monthDelivered.Sum(o => o.TotalAmount);
        var platformFeesThisMonth = monthDelivered.Sum(o => o.PlatformFee);
        var commissionThisMonth = Math.Round(gmvThisMonth * 0.02m, 2);

        // Listings
        var activeListings = await _context.Products.CountAsync(p => p.Status == ProductStatus.Active);
        var draftListings = await _context.Products.CountAsync(p => p.Status == ProductStatus.Draft);
        var outOfStockListings = await _context.Products.CountAsync(p => p.Status == ProductStatus.OutOfStock);
        var removedListings = await _context.Products.CountAsync(p => p.Status == ProductStatus.Removed);
        var pendingVerifListings = await _context.Products.CountAsync(p => p.Verified == ProductVerificationStatus.Pending);

        // Verifications
        var pendingVerifications = await _context.VerificationRequests.CountAsync(v => v.Status == VerificationRequestStatus.Pending);
        var approvedVerificationsThisMonth = await _context.VerificationRequests.CountAsync(v => v.Status == VerificationRequestStatus.Approved && v.ReviewedAt >= startOfMonth);

        // Payouts
        var pendingPayoutsList = await _context.Payouts.Where(p => p.Status == PayoutStatus.Pending).ToListAsync();
        var paidPayoutsThisMonthList = await _context.Payouts.Where(p => p.Status == PayoutStatus.Paid && p.PaidAt >= startOfMonth).ToListAsync();

        // Refunds
        var pendingRefunds = await _context.Refunds.CountAsync(r => r.Status == RefundStatus.Pending);
        var processedRefundsThisMonth = await _context.Refunds.CountAsync(r => r.Status == RefundStatus.Processed && r.ProcessedAt >= startOfMonth);

        // Disputes
        var openDisputes = await _context.Disputes.CountAsync(d => d.Status == DisputeStatus.Open);
        var escalatedDisputes = await _context.Disputes.CountAsync(d => d.Status == DisputeStatus.Escalated);
        var resolvedDisputesThisMonth = await _context.Disputes.CountAsync(d => d.Status == DisputeStatus.Resolved && d.ResolvedAt >= startOfMonth);

        // 12 Months Charts
        var revenueChart = new List<ChartDataPoint>();
        var ordersChart = new List<OrderChartPoint>();
        var userGrowthChart = new List<UserChartPoint>();

        for (int i = 11; i >= 0; i--)
        {
            var mDate = now.AddMonths(-i);
            var mStart = new DateTime(mDate.Year, mDate.Month, 1, 0, 0, 0, DateTimeKind.Utc);
            var mEnd = mStart.AddMonths(1);
            var mLabel = mDate.ToString("yyyy-MM");

            var mRev = allDelivered.Where(o => (o.DeliveredAt ?? o.PlacedAt) >= mStart && (o.DeliveredAt ?? o.PlacedAt) < mEnd).Sum(o => o.TotalAmount);
            var mOrders = await _context.Orders.CountAsync(o => o.PlacedAt >= mStart && o.PlacedAt < mEnd);
            var mUsers = await _context.Users.CountAsync(u => u.CreatedAt >= mStart && u.CreatedAt < mEnd);

            revenueChart.Add(new ChartDataPoint { month = mLabel, revenue = mRev });
            ordersChart.Add(new OrderChartPoint { month = mLabel, orders = mOrders });
            userGrowthChart.Add(new UserChartPoint { month = mLabel, users = mUsers });
        }

        // Category split
        var orderItems = await _context.OrderItems
            .Include(oi => oi.Product)
            .ThenInclude(p => p.Category)
            .ToListAsync();

        var catGroups = orderItems
            .Where(oi => oi.Product?.Category != null)
            .GroupBy(oi => oi.Product.Category.Name)
            .Select(g => new { Category = g.Key, Revenue = g.Sum(x => x.LineTotal) })
            .OrderByDescending(x => x.Revenue)
            .ToList();

        var totalCatRev = catGroups.Sum(x => x.Revenue);
        var categorySplit = catGroups.Select(cg => new CategorySplitPoint
        {
            category = cg.Category,
            revenue = cg.Revenue,
            percentage = totalCatRev > 0 ? Math.Round((cg.Revenue / totalCatRev) * 100, 1) : 0
        }).ToList();

        // Recent Activity (last 10)
        var recentLogs = await _context.ActivityLogs
            .Include(a => a.ActorUser)
            .OrderByDescending(a => a.CreatedAt)
            .Take(10)
            .Select(a => new RecentActivityItem
            {
                id = a.Id,
                action = a.Action,
                summary = a.Summary,
                actorName = a.ActorUser != null ? a.ActorUser.FullName : "System",
                createdAt = a.CreatedAt
            })
            .ToListAsync();

        return new AdminDashboardDto
        {
            users = new UserKpis
            {
                total = totalUsers,
                buyers = buyers,
                farmers = farmers,
                admins = admins,
                newThisMonth = newUsersThisMonth,
                suspended = suspendedUsers
            },
            orders = new OrderKpis
            {
                total = totalOrders,
                today = todayOrders,
                thisWeek = weekOrders,
                thisMonth = monthOrders,
                pending = pendingOrders,
                delivered = deliveredOrders,
                cancelled = cancelledOrders,
                disputed = disputedOrders
            },
            revenue = new RevenueKpis
            {
                gmvThisMonth = gmvThisMonth,
                gmvAllTime = gmvAllTime,
                platformFeesThisMonth = platformFeesThisMonth,
                commissionThisMonth = commissionThisMonth
            },
            listings = new ListingKpis
            {
                active = activeListings,
                draft = draftListings,
                outOfStock = outOfStockListings,
                removed = removedListings,
                pendingVerification = pendingVerifListings
            },
            verifications = new VerificationKpis
            {
                pending = pendingVerifications,
                approvedThisMonth = approvedVerificationsThisMonth
            },
            payouts = new PayoutKpis
            {
                pending = pendingPayoutsList.Count,
                pendingAmount = pendingPayoutsList.Sum(p => p.Amount),
                paidThisMonth = paidPayoutsThisMonthList.Count,
                paidAmountThisMonth = paidPayoutsThisMonthList.Sum(p => p.Amount)
            },
            refunds = new RefundKpis
            {
                pending = pendingRefunds,
                processedThisMonth = processedRefundsThisMonth
            },
            disputes = new DisputeKpis
            {
                open = openDisputes,
                escalated = escalatedDisputes,
                resolvedThisMonth = resolvedDisputesThisMonth
            },
            revenueChart = revenueChart,
            ordersChart = ordersChart,
            userGrowthChart = userGrowthChart,
            categorySplit = categorySplit,
            recentActivity = recentLogs
        };
    }
    #endregion

    #region Users
    public async Task<(IEnumerable<AdminUserListItemDto> Items, int TotalCount)> GetUsersAsync(AdminUserQuery query)
    {
        var q = _context.Users.AsNoTracking().AsQueryable();

        if (!string.IsNullOrWhiteSpace(query.Search))
        {
            var term = query.Search.Trim().ToLower();
            q = q.Where(u => u.FullName.ToLower().Contains(term) || u.Email.ToLower().Contains(term));
        }

        if (!string.IsNullOrWhiteSpace(query.Role) && !query.Role.Equals("all", StringComparison.OrdinalIgnoreCase))
        {
            if (Enum.TryParse<UserRole>(query.Role, true, out var r))
            {
                q = q.Where(u => u.Role == r);
            }
        }

        if (!string.IsNullOrWhiteSpace(query.Status) && !query.Status.Equals("all", StringComparison.OrdinalIgnoreCase))
        {
            if (Enum.TryParse<UserStatus>(query.Status, true, out var s))
            {
                q = q.Where(u => u.Status == s);
            }
        }

        if (!string.IsNullOrWhiteSpace(query.VerificationStatus) && !query.VerificationStatus.Equals("all", StringComparison.OrdinalIgnoreCase))
        {
            var vs = query.VerificationStatus.Trim().ToLower();
            if (vs == "approved" || vs == "verified")
            {
                q = q.Where(u => _context.Farmers.Any(f => f.UserId == u.Id && f.Verified == 2));
            }
            else if (vs == "pending")
            {
                q = q.Where(u => _context.Farmers.Any(f => f.UserId == u.Id && f.Verified == 1));
            }
            else if (vs == "rejected" || vs == "unverified")
            {
                q = q.Where(u => _context.Farmers.Any(f => f.UserId == u.Id && f.Verified == 0));
            }
        }

        var total = await q.CountAsync();

        var users = await q
            .OrderByDescending(u => u.CreatedAt)
            .Skip((query.Page - 1) * query.PageSize)
            .Take(query.PageSize)
            .ToListAsync();

        var userIds = users.Select(u => u.Id).ToList();

        // Count orders for buyers
        var buyerIds = await _context.Buyers
            .Where(b => userIds.Contains(b.UserId))
            .ToDictionaryAsync(b => b.UserId, b => b.Id);

        var buyerOrdersCount = new Dictionary<Guid, int>();
        if (buyerIds.Count > 0)
        {
            var bIdList = buyerIds.Values.ToList();
            var counts = await _context.Orders
                .Where(o => bIdList.Contains(o.BuyerId))
                .GroupBy(o => o.BuyerId)
                .Select(g => new { BuyerId = g.Key, Count = g.Count() })
                .ToDictionaryAsync(x => x.BuyerId, x => x.Count);

            foreach (var kvp in buyerIds)
            {
                buyerOrdersCount[kvp.Key] = counts.TryGetValue(kvp.Value, out var c) ? c : 0;
            }
        }

        // Count listings and load profile for farmers
        var farmers = await _context.Farmers.AsNoTracking()
            .Where(f => userIds.Contains(f.UserId))
            .ToListAsync();
        var farmerMap = farmers.ToDictionary(f => f.UserId, f => f);
        var farmerIds = farmers.ToDictionary(f => f.UserId, f => f.Id);

        var farmerListingsCount = new Dictionary<Guid, int>();
        if (farmerIds.Count > 0)
        {
            var fIdList = farmerIds.Values.ToList();
            var counts = await _context.Products
                .Where(p => fIdList.Contains(p.FarmerId))
                .GroupBy(p => p.FarmerId)
                .Select(g => new { FarmerId = g.Key, Count = g.Count() })
                .ToDictionaryAsync(x => x.FarmerId, x => x.Count);

            foreach (var kvp in farmerIds)
            {
                farmerListingsCount[kvp.Key] = counts.TryGetValue(kvp.Value, out var c) ? c : 0;
            }
        }

        var dtos = users.Select(u => {
            farmerMap.TryGetValue(u.Id, out var farm);
            return new AdminUserListItemDto
            {
                Id = u.Id,
                FullName = u.FullName,
                Email = u.Email,
                Role = u.Role.ToString(),
                Status = u.Status.ToString(),
                State = u.State,
                District = u.District,
                JoinedAt = u.CreatedAt,
                LastLoginAt = u.LastLoginAt,
                OrderCount = buyerOrdersCount.TryGetValue(u.Id, out var oc) ? oc : 0,
                ListingCount = farmerListingsCount.TryGetValue(u.Id, out var lc) ? lc : 0,
                FarmerId = farm?.Id,
                FarmName = farm?.FarmName,
                FarmerVerified = farm?.Verified ?? 0,
                FarmerVerifiedStatus = farm?.Verified switch
                {
                    2 => "Approved",
                    1 => "Pending",
                    _ => "Rejected"
                }
            };
        }).ToList();

        return (dtos, total);
    }

    public async Task<AdminUserDetailDto?> GetUserDetailAsync(Guid id)
    {
        var user = await _context.Users.AsNoTracking().FirstOrDefaultAsync(u => u.Id == id);
        if (user == null) return null;

        var buyer = await _context.Buyers.AsNoTracking().FirstOrDefaultAsync(b => b.UserId == id);
        var farmer = await _context.Farmers.AsNoTracking().FirstOrDefaultAsync(f => f.UserId == id);

        var ordersCount = 0;
        var addresses = new List<AdminUserAddressDto>();
        if (buyer != null)
        {
            ordersCount = await _context.Orders.CountAsync(o => o.BuyerId == buyer.Id);
            addresses = await _context.Addresses
                .Where(a => a.BuyerId == buyer.Id)
                .Select(a => new AdminUserAddressDto
                {
                    Id = a.Id,
                    AddressLine1 = a.Line1,
                    AddressLine2 = a.Line2,
                    City = a.City,
                    District = a.City,
                    State = a.State,
                    Pincode = a.Pincode,
                    IsDefault = a.IsDefault
                }).ToListAsync();
        }

        var listings = new List<AdminUserListingDto>();
        AdminUserBankAccountDto? bankAccount = null;
        if (farmer != null)
        {
            listings = await _context.Products
                .Include(p => p.Category)
                .Where(p => p.FarmerId == farmer.Id)
                .OrderByDescending(p => p.CreatedAt)
                .Select(p => new AdminUserListingDto
                {
                    Id = p.Id,
                    Name = p.Name,
                    CategoryName = p.Category.Name,
                    PricePerQuintal = p.PricePerQuintal,
                    AvailableQuantityQuintal = p.AvailableQuantityQuintal,
                    Status = p.Status.ToString(),
                    CreatedAt = p.CreatedAt
                }).ToListAsync();

            var ba = await _context.BankAccounts.AsNoTracking().FirstOrDefaultAsync(b => b.FarmerId == farmer.Id);
            if (ba != null)
            {
                var masked = ba.AccountNumber.Length > 4
                    ? new string('*', ba.AccountNumber.Length - 4) + ba.AccountNumber[^4..]
                    : ba.AccountNumber;
                bankAccount = new AdminUserBankAccountDto
                {
                    AccountHolderName = ba.AccountHolderName,
                    MaskedAccountNumber = masked,
                    IfscCode = ba.IfscCode,
                    BankName = ba.BankName,
                    UpiId = ba.UpiId,
                    IsVerified = ba.IsVerified
                };
            }
        }

        var disputesCount = await _context.Disputes.CountAsync(d => d.RaisedByUserId == id || d.AgainstUserId == id);
        var reviewsWritten = await _context.Reviews.CountAsync(r => r.Buyer != null && r.Buyer.UserId == id);
        var reviewsReceived = farmer != null ? await _context.Reviews.CountAsync(r => r.FarmerId == farmer.Id) : 0;

        AdminUserFarmerDto? farmerProfile = null;
        if (farmer != null)
        {
            farmerProfile = new AdminUserFarmerDto
            {
                FarmerId = farmer.Id,
                FarmName = farmer.FarmName,
                Verified = farmer.Verified,
                VerificationStatus = farmer.Verified switch
                {
                    2 => "Approved",
                    1 => "Pending",
                    _ => "Rejected"
                },
                Rating = farmer.Rating,
                Location = farmer.Location ?? $"{farmer.District}, {farmer.State}"
            };
        }

        return new AdminUserDetailDto
        {
            Id = user.Id,
            FullName = user.FullName,
            Email = user.Email,
            Role = user.Role.ToString(),
            Status = user.Status.ToString(),
            State = user.State,
            District = user.District,
            City = user.City,
            JoinedAt = user.CreatedAt,
            LastLoginAt = user.LastLoginAt,
            OrdersCount = ordersCount,
            DisputesCount = disputesCount,
            ReviewsWrittenCount = reviewsWritten,
            ReviewsReceivedCount = reviewsReceived,
            Addresses = addresses,
            Listings = listings,
            BankAccount = bankAccount,
            FarmerProfile = farmerProfile
        };
    }

    public async Task<User?> GetUserByIdAsync(Guid id)
    {
        return await _context.Users.FirstOrDefaultAsync(u => u.Id == id);
    }

    public Task UpdateUserAsync(User user)
    {
        _context.Users.Update(user);
        return Task.CompletedTask;
    }
    #endregion

    #region Verifications
    public async Task<(IEnumerable<AdminVerificationListItemDto> Items, int TotalCount)> GetVerificationsAsync(AdminVerificationQuery query)
    {
        var q = _context.VerificationRequests
            .Include(v => v.Farmer)
            .ThenInclude(f => f.User)
            .AsNoTracking()
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(query.Status) && !query.Status.Equals("all", StringComparison.OrdinalIgnoreCase))
        {
            if (Enum.TryParse<VerificationRequestStatus>(query.Status, true, out var s))
            {
                q = q.Where(v => v.Status == s);
            }
        }

        if (!string.IsNullOrWhiteSpace(query.Search))
        {
            var term = query.Search.Trim().ToLower();
            q = q.Where(v => v.Farmer.FarmName.ToLower().Contains(term) || v.Farmer.User.FullName.ToLower().Contains(term) || v.RequestNumber.ToLower().Contains(term));
        }

        var total = await q.CountAsync();

        var items = await q
            .OrderByDescending(v => v.SubmittedAt)
            .Skip((query.Page - 1) * query.PageSize)
            .Take(query.PageSize)
            .ToListAsync();

        var dtos = items.Select(v =>
        {
            var files = new List<string>();
            if (!string.IsNullOrEmpty(v.LandRecordUrl)) files.Add(Path.GetFileName(v.LandRecordUrl));
            if (!string.IsNullOrEmpty(v.SelfieUrl)) files.Add(Path.GetFileName(v.SelfieUrl));

            var masked = v.AadhaarNumber.Length > 4
                ? "XXXX-XXXX-" + v.AadhaarNumber[^4..]
                : v.AadhaarNumber;

            return new AdminVerificationListItemDto
            {
                Id = v.Id,
                RequestNumber = v.RequestNumber,
                FarmerId = v.FarmerId,
                FarmerName = v.Farmer?.User?.FullName ?? "Unknown",
                FarmName = v.Farmer?.FarmName ?? string.Empty,
                Status = v.Status.ToString(),
                MaskedAadhaar = masked,
                FileNames = files,
                SubmittedAt = v.SubmittedAt
            };
        }).ToList();

        return (dtos, total);
    }

    public async Task<AdminVerificationDetailDto?> GetVerificationDetailAsync(Guid id)
    {
        var v = await _context.VerificationRequests
            .Include(x => x.Farmer)
            .ThenInclude(f => f.User)
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == id);

        if (v == null) return null;

        var reviewer = v.ReviewedByUserId.HasValue
            ? await _context.Users.AsNoTracking().FirstOrDefaultAsync(u => u.Id == v.ReviewedByUserId.Value)
            : null;

        var masked = !string.IsNullOrEmpty(v.AadhaarNumber) && v.AadhaarNumber.Length > 4
            ? "XXXX-XXXX-" + v.AadhaarNumber[^4..]
            : (v.AadhaarNumber ?? string.Empty);

        return new AdminVerificationDetailDto
        {
            Id = v.Id,
            RequestNumber = v.RequestNumber,
            FarmerId = v.FarmerId,
            FarmerName = v.Farmer?.User?.FullName ?? string.Empty,
            FarmName = v.Farmer?.FarmName ?? string.Empty,
            Location = v.Farmer?.Location ?? string.Empty,
            State = v.Farmer?.State ?? string.Empty,
            District = v.Farmer?.District ?? string.Empty,
            Email = v.Farmer?.User?.Email ?? string.Empty,
            Status = v.Status.ToString(),
            MaskedAadhaar = masked,
            LandRecordUrl = v.LandRecordUrl,
            SelfieUrl = v.SelfieUrl,
            Notes = v.Notes,
            RejectionReason = v.RejectionReason,
            SubmittedAt = v.SubmittedAt,
            ReviewedAt = v.ReviewedAt,
            ReviewedByName = reviewer?.FullName
        };
    }

    public async Task<VerificationRequest?> GetVerificationRequestByIdAsync(Guid id)
    {
        return await _context.VerificationRequests
            .Include(v => v.Farmer)
            .FirstOrDefaultAsync(v => v.Id == id);
    }

    public Task UpdateVerificationRequestAsync(VerificationRequest request)
    {
        _context.VerificationRequests.Update(request);
        return Task.CompletedTask;
    }

    public async Task<Farmer?> GetFarmerByIdAsync(Guid farmerId)
    {
        return await _context.Farmers.Include(f => f.User).FirstOrDefaultAsync(f => f.Id == farmerId);
    }

    public Task UpdateFarmerAsync(Farmer farmer)
    {
        _context.Farmers.Update(farmer);
        return Task.CompletedTask;
    }

    public async Task<VerificationRequest?> GetCurrentPendingVerificationRequestAsync(Guid farmerId)
    {
        return await _context.VerificationRequests
            .OrderByDescending(v => v.SubmittedAt)
            .FirstOrDefaultAsync(v => v.FarmerId == farmerId && v.Status == VerificationRequestStatus.Pending);
    }
    #endregion

    #region Listings
    public async Task<(IEnumerable<AdminListingListItemDto> Items, int TotalCount)> GetListingsAsync(AdminListingQuery query)
    {
        var q = _context.Products
            .Include(p => p.Farmer)
            .ThenInclude(f => f.User)
            .Include(p => p.Category)
            .AsNoTracking()
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(query.Search))
        {
            var term = query.Search.Trim().ToLower();
            q = q.Where(p => p.Name.ToLower().Contains(term) || p.Farmer.FarmName.ToLower().Contains(term) || p.Farmer.User.FullName.ToLower().Contains(term));
        }

        if (!string.IsNullOrWhiteSpace(query.Status) && !query.Status.Equals("all", StringComparison.OrdinalIgnoreCase))
        {
            if (Enum.TryParse<ProductStatus>(query.Status, true, out var s))
            {
                q = q.Where(p => p.Status == s);
            }
        }

        if (!string.IsNullOrWhiteSpace(query.Category) && !query.Category.Equals("all", StringComparison.OrdinalIgnoreCase))
        {
            q = q.Where(p => p.Category.Name == query.Category || p.Category.Slug == query.Category);
        }

        if (query.Verified.HasValue)
        {
            var targetStatus = query.Verified.Value ? ProductVerificationStatus.Verified : ProductVerificationStatus.Unverified;
            q = q.Where(p => p.Verified == targetStatus);
        }

        if (query.Flagged.HasValue && query.Flagged.Value)
        {
            q = q.Where(p => !string.IsNullOrEmpty(p.FlaggedReason));
        }

        var total = await q.CountAsync();

        var items = await q
            .OrderByDescending(p => p.CreatedAt)
            .Skip((query.Page - 1) * query.PageSize)
            .Take(query.PageSize)
            .ToListAsync();

        var productIds = items.Select(p => p.Id).ToList();
        var featuredProductIds = await _context.FeaturedListings
            .Where(f => productIds.Contains(f.ProductId) && f.IsActive)
            .Select(f => f.ProductId)
            .ToListAsync();

        var dtos = items.Select(p => new AdminListingListItemDto
        {
            Id = p.Id,
            Name = p.Name,
            Slug = p.Slug,
            ImageUrl = p.ImageUrl,
            FarmerId = p.FarmerId,
            FarmerName = p.Farmer?.User?.FullName ?? "Unknown",
            FarmName = p.Farmer?.FarmName ?? string.Empty,
            CategoryName = p.Category?.Name ?? string.Empty,
            PricePerQuintal = p.PricePerQuintal,
            AvailableQuantityQuintal = p.AvailableQuantityQuintal,
            Status = p.Status.ToString(),
            IsVerified = p.Verified == ProductVerificationStatus.Verified,
            IsFeatured = featuredProductIds.Contains(p.Id),
            IsFlagged = !string.IsNullOrEmpty(p.FlaggedReason),
            FlaggedReason = p.FlaggedReason,
            CreatedAt = p.CreatedAt
        }).ToList();

        return (dtos, total);
    }

    public async Task<AdminListingDetailDto?> GetListingDetailAsync(Guid id)
    {
        var p = await _context.Products
            .Include(x => x.Farmer)
            .ThenInclude(f => f.User)
            .Include(x => x.Category)
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == id);

        if (p == null) return null;

        var isFeatured = await _context.FeaturedListings.AnyAsync(f => f.ProductId == id && f.IsActive);

        return new AdminListingDetailDto
        {
            Id = p.Id,
            Name = p.Name,
            Slug = p.Slug,
            Description = p.Description,
            ImageUrl = p.ImageUrl,
            Grade = p.Grade.ToString(),
            PricePerQuintal = p.PricePerQuintal,
            AvailableQuantityQuintal = p.AvailableQuantityQuintal,
            MinOrderQuantityQuintal = p.MinOrderQuantityQuintal,
            BulkDiscountPercent = p.BulkDiscountPercent,
            BulkDiscountThresholdQuintal = p.BulkDiscountThresholdQuintal,
            HarvestDate = p.HarvestDate,
            Status = p.Status.ToString(),
            State = p.State,
            District = p.District,
            City = p.City,
            Rating = p.Rating,
            RatingCount = p.RatingCount,
            IsVerified = p.Verified == ProductVerificationStatus.Verified,
            IsFeatured = isFeatured,
            IsFlagged = !string.IsNullOrEmpty(p.FlaggedReason),
            FlaggedReason = p.FlaggedReason,
            FlaggedAt = p.FlaggedAt,
            CreatedAt = p.CreatedAt,
            UpdatedAt = p.UpdatedAt,
            FarmerId = p.FarmerId,
            FarmerName = p.Farmer?.User?.FullName ?? string.Empty,
            FarmName = p.Farmer?.FarmName ?? string.Empty,
            FarmerEmail = p.Farmer?.User?.Email ?? string.Empty,
            FarmerPhone = string.Empty,
            CategoryName = p.Category?.Name ?? string.Empty
        };
    }

    public async Task<Product?> GetProductByIdAsync(Guid id)
    {
        return await _context.Products
            .Include(p => p.Farmer)
            .Include(p => p.Category)
            .FirstOrDefaultAsync(p => p.Id == id);
    }

    public Task UpdateProductAsync(Product product)
    {
        _context.Products.Update(product);
        return Task.CompletedTask;
    }

    public async Task<List<FeaturedListingItemDto>> GetFeaturedListingsAsync()
    {
        var items = await _context.FeaturedListings
            .Include(f => f.Product)
            .ThenInclude(p => p.Category)
            .Include(f => f.Product.Farmer)
            .ThenInclude(farmer => farmer.User)
            .OrderBy(f => f.DisplayOrder)
            .ThenByDescending(f => f.CreatedAt)
            .ToListAsync();

        return items.Select(f => new FeaturedListingItemDto
        {
            Id = f.Id,
            ProductId = f.ProductId,
            ProductName = f.Product?.Name ?? string.Empty,
            ProductSlug = f.Product?.Slug ?? string.Empty,
            ImageUrl = f.Product?.ImageUrl,
            CategoryName = f.Product?.Category?.Name ?? string.Empty,
            PricePerQuintal = f.Product?.PricePerQuintal ?? 0,
            FarmerName = f.Product?.Farmer?.User?.FullName ?? string.Empty,
            FarmName = f.Product?.Farmer?.FarmName ?? string.Empty,
            DisplayOrder = f.DisplayOrder,
            IsActive = f.IsActive,
            StartsAt = f.StartsAt,
            EndsAt = f.EndsAt,
            CreatedAt = f.CreatedAt
        }).ToList();
    }

    public async Task<FeaturedListing?> GetFeaturedListingByProductIdAsync(Guid productId)
    {
        return await _context.FeaturedListings.FirstOrDefaultAsync(f => f.ProductId == productId);
    }

    public async Task AddFeaturedListingAsync(FeaturedListing featuredListing)
    {
        await _context.FeaturedListings.AddAsync(featuredListing);
    }

    public Task RemoveFeaturedListingAsync(FeaturedListing featuredListing)
    {
        _context.FeaturedListings.Remove(featuredListing);
        return Task.CompletedTask;
    }

    public async Task UpdateFeaturedListingsOrderAsync(List<FeaturedOrderItem> items)
    {
        var prodIds = items.Select(i => i.ProductId).ToList();
        var featured = await _context.FeaturedListings.Where(f => prodIds.Contains(f.ProductId)).ToListAsync();

        foreach (var f in featured)
        {
            var match = items.FirstOrDefault(i => i.ProductId == f.ProductId);
            if (match != null)
            {
                f.DisplayOrder = match.DisplayOrder;
            }
        }
    }
    #endregion

    #region Orders
    public async Task<(IEnumerable<AdminOrderListItemDto> Items, int TotalCount)> GetOrdersAsync(AdminOrderQuery query)
    {
        var q = _context.Orders
            .Include(o => o.Buyer)
            .ThenInclude(b => b.User)
            .Include(o => o.Seller)
            .ThenInclude(f => f.User)
            .AsNoTracking()
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(query.Search))
        {
            var term = query.Search.Trim().ToLower();
            q = q.Where(o => o.OrderNumber.ToLower().Contains(term) ||
                             o.Buyer.User.FullName.ToLower().Contains(term) ||
                             o.Seller.FarmName.ToLower().Contains(term) ||
                             o.Seller.User.FullName.ToLower().Contains(term));
        }

        if (!string.IsNullOrWhiteSpace(query.Status) && !query.Status.Equals("all", StringComparison.OrdinalIgnoreCase))
        {
            if (Enum.TryParse<OrderStatus>(query.Status, true, out var s))
            {
                q = q.Where(o => o.Status == s);
            }
        }

        if (!string.IsNullOrWhiteSpace(query.PaymentStatus) && !query.PaymentStatus.Equals("all", StringComparison.OrdinalIgnoreCase))
        {
            if (Enum.TryParse<PaymentStatus>(query.PaymentStatus, true, out var ps))
            {
                q = q.Where(o => o.PaymentStatus == ps);
            }
        }

        if (query.From.HasValue)
        {
            q = q.Where(o => o.PlacedAt >= query.From.Value);
        }

        if (query.To.HasValue)
        {
            q = q.Where(o => o.PlacedAt <= query.To.Value);
        }

        var total = await q.CountAsync();

        var items = await q
            .OrderByDescending(o => o.PlacedAt)
            .Skip((query.Page - 1) * query.PageSize)
            .Take(query.PageSize)
            .ToListAsync();

        var dtos = items.Select(o => new AdminOrderListItemDto
        {
            Id = o.Id,
            OrderNumber = o.OrderNumber,
            BuyerId = o.BuyerId,
            BuyerName = o.Buyer?.User?.FullName ?? "Unknown",
            FarmerId = o.SellerId,
            SellerName = o.Seller?.FarmName ?? o.Seller?.User?.FullName ?? "Unknown",
            TotalAmount = o.TotalAmount,
            Status = o.Status.ToString(),
            PaymentStatus = o.PaymentStatus.ToString(),
            PaymentMethod = o.PaymentMethod.ToString(),
            PlacedAt = o.PlacedAt
        }).ToList();

        return (dtos, total);
    }

    public async Task<AdminOrderDetailDto?> GetOrderDetailAsync(Guid id)
    {
        var o = await _context.Orders
            .Include(x => x.Buyer).ThenInclude(b => b.User)
            .Include(x => x.Seller).ThenInclude(f => f.User)
            .Include(x => x.Items).ThenInclude(i => i.Product)
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == id);

        if (o == null) return null;

        var statusHistory = await _context.OrderStatusHistories
            .Where(h => h.OrderId == id)
            .OrderBy(h => h.CreatedAt)
            .Select(h => new AdminOrderStatusHistoryDto
            {
                Id = h.Id,
                Status = h.Status.ToString(),
                Note = h.Note,
                CreatedAt = h.CreatedAt
            }).ToListAsync();

        var disputes = await _context.Disputes
            .Where(d => d.OrderId == id)
            .Select(d => new AdminOrderDisputeSummaryDto
            {
                Id = d.Id,
                Subject = d.Subject,
                Status = d.Status.ToString(),
                CreatedAt = d.OpenedAt
            }).ToListAsync();

        var returns = await _context.ReturnRequests
            .Where(r => r.OrderId == id)
            .Select(r => new AdminOrderReturnSummaryDto
            {
                Id = r.Id,
                ReturnNumber = "FB-RET-" + r.Id.ToString().Substring(0, 8).ToUpper(),
                Reason = r.Reason,
                Status = r.Status.ToString(),
                CreatedAt = r.RequestedAt
            }).ToListAsync();

        var refunds = await _context.Refunds
            .Where(rf => rf.OrderId == id)
            .Select(rf => new AdminOrderRefundSummaryDto
            {
                Id = rf.Id,
                Amount = rf.Amount,
                Status = rf.Status.ToString(),
                Reason = rf.Reference ?? "Refund",
                Reference = rf.Reference,
                CreatedAt = rf.CreatedAt
            }).ToListAsync();

        return new AdminOrderDetailDto
        {
            Id = o.Id,
            OrderNumber = o.OrderNumber,
            SubtotalAmount = o.Subtotal,
            DeliveryFee = o.DeliveryFee,
            PlatformFee = o.PlatformFee,
            DiscountAmount = o.DiscountAmount,
            TotalAmount = o.TotalAmount,
            Status = o.Status.ToString(),
            PaymentStatus = o.PaymentStatus.ToString(),
            PaymentMethod = o.PaymentMethod.ToString(),
            PlacedAt = o.PlacedAt,
            ConfirmedAt = o.ConfirmedAt,
            ShippedAt = o.ShippedAt,
            DeliveredAt = o.DeliveredAt,
            CancelledAt = o.CancelledAt,
            CancellationReason = o.CancellationReason,
            Buyer = new AdminOrderParticipantDto
            {
                Id = o.BuyerId,
                UserId = o.Buyer?.UserId ?? Guid.Empty,
                Name = o.Buyer?.User?.FullName ?? string.Empty,
                Email = o.Buyer?.User?.Email ?? string.Empty,
                Phone = o.Buyer?.Phone ?? string.Empty
            },
            Seller = new AdminOrderParticipantDto
            {
                Id = o.SellerId,
                UserId = o.Seller?.UserId ?? Guid.Empty,
                Name = o.Seller?.FarmName ?? o.Seller?.User?.FullName ?? string.Empty,
                Email = o.Seller?.User?.Email ?? string.Empty,
                Phone = string.Empty
            },
            DeliveryAddress = new AdminOrderAddressDto
            {
                AddressLine1 = o.DeliveryLine1,
                AddressLine2 = o.DeliveryLine2,
                City = o.DeliveryCity,
                District = o.DeliveryCity,
                State = o.DeliveryState,
                Pincode = o.DeliveryPincode
            },
            Items = o.Items.Select(i => new AdminOrderItemDto
            {
                Id = i.Id,
                ProductId = i.ProductId,
                ProductName = i.Product?.Name ?? string.Empty,
                QuantityQuintal = i.QuantityQuintal,
                UnitPricePerQuintal = i.UnitPricePerQuintal,
                TotalPrice = i.LineTotal
            }).ToList(),
            Timeline = statusHistory,
            Disputes = disputes,
            Returns = returns,
            Refunds = refunds
        };
    }

    public async Task<Order?> GetOrderByIdAsync(Guid id)
    {
        return await _context.Orders
            .Include(o => o.Items)
            .Include(o => o.Buyer)
            .Include(o => o.Seller)
            .FirstOrDefaultAsync(o => o.Id == id);
    }

    public Task UpdateOrderAsync(Order order)
    {
        _context.Orders.Update(order);
        return Task.CompletedTask;
    }

    public async Task AddOrderStatusHistoryAsync(OrderStatusHistory history)
    {
        await _context.OrderStatusHistories.AddAsync(history);
    }
    #endregion

    #region Disputes
    public async Task<(IEnumerable<AdminDisputeListItemDto> Items, int TotalCount)> GetDisputesAsync(AdminDisputeQuery query)
    {
        var q = _context.Disputes
            .Include(d => d.Order)
            .Include(d => d.RaisedByUser)
            .Include(d => d.AgainstUser)
            .AsNoTracking()
            .AsQueryable();

        if (query.Escalated.HasValue && query.Escalated.Value)
        {
            q = q.Where(d => d.Status == DisputeStatus.Escalated);
        }
        else if (!string.IsNullOrWhiteSpace(query.Status) && !query.Status.Equals("all", StringComparison.OrdinalIgnoreCase))
        {
            if (Enum.TryParse<DisputeStatus>(query.Status, true, out var s))
            {
                q = q.Where(d => d.Status == s);
            }
        }

        if (!string.IsNullOrWhiteSpace(query.Search))
        {
            var term = query.Search.Trim().ToLower();
            q = q.Where(d => d.Subject.ToLower().Contains(term) || d.Order.OrderNumber.ToLower().Contains(term));
        }

        var total = await q.CountAsync();

        var items = await q
            .OrderByDescending(d => d.OpenedAt)
            .Skip((query.Page - 1) * query.PageSize)
            .Take(query.PageSize)
            .ToListAsync();

        var dtos = items.Select(d => new AdminDisputeListItemDto
        {
            Id = d.Id,
            OrderId = d.OrderId,
            OrderNumber = d.Order?.OrderNumber ?? string.Empty,
            Subject = d.Subject,
            RaisedByName = d.RaisedByUser?.FullName ?? "Unknown",
            AgainstName = d.AgainstUser?.FullName ?? "Unknown",
            Status = d.Status.ToString(),
            CreatedAt = d.OpenedAt
        }).ToList();

        return (dtos, total);
    }

    public async Task<AdminDisputeDetailDto?> GetDisputeDetailAsync(Guid id)
    {
        var d = await _context.Disputes
            .Include(x => x.Order)
            .Include(x => x.RaisedByUser)
            .Include(x => x.AgainstUser)
            .Include(x => x.Messages).ThenInclude(m => m.SenderUser)
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == id);

        if (d == null) return null;

        return new AdminDisputeDetailDto
        {
            Id = d.Id,
            OrderId = d.OrderId,
            OrderNumber = d.Order?.OrderNumber ?? string.Empty,
            OrderAmount = d.Order?.TotalAmount ?? 0,
            OrderStatus = d.Order?.Status.ToString() ?? string.Empty,
            Subject = d.Subject,
            Description = d.Subject,
            Status = d.Status.ToString(),
            ResolutionNote = d.ResolutionNote,
            CreatedAt = d.OpenedAt,
            ResolvedAt = d.ResolvedAt,
            RaisedBy = new AdminOrderParticipantDto
            {
                Id = Guid.Empty,
                UserId = d.RaisedByUserId,
                Name = d.RaisedByUser?.FullName ?? string.Empty,
                Email = d.RaisedByUser?.Email ?? string.Empty,
                Phone = string.Empty
            },
            Against = new AdminOrderParticipantDto
            {
                Id = Guid.Empty,
                UserId = d.AgainstUserId,
                Name = d.AgainstUser?.FullName ?? string.Empty,
                Email = d.AgainstUser?.Email ?? string.Empty,
                Phone = string.Empty
            },
            Messages = d.Messages.OrderBy(m => m.CreatedAt).Select(m => new AdminDisputeMessageDto
            {
                Id = m.Id,
                SenderUserId = m.SenderUserId,
                SenderName = m.SenderUser?.FullName ?? "Unknown",
                SenderRole = m.SenderRole.ToString(),
                MessageText = m.Body,
                AttachmentUrl = m.AttachmentUrl,
                CreatedAt = m.CreatedAt
            }).ToList()
        };
    }

    public async Task<Dispute?> GetDisputeByIdAsync(Guid id)
    {
        return await _context.Disputes
            .Include(d => d.Order)
            .FirstOrDefaultAsync(d => d.Id == id);
    }

    public Task UpdateDisputeAsync(Dispute dispute)
    {
        _context.Disputes.Update(dispute);
        return Task.CompletedTask;
    }

    public async Task AddDisputeMessageAsync(DisputeMessage message)
    {
        await _context.DisputeMessages.AddAsync(message);
    }
    #endregion

    #region Payouts
    public async Task<(IEnumerable<AdminPayoutListItemDto> Items, int TotalCount)> GetPayoutsAsync(AdminPayoutQuery query)
    {
        var q = _context.Payouts
            .Include(p => p.Farmer).ThenInclude(f => f.User)
            .AsNoTracking()
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(query.Status) && !query.Status.Equals("all", StringComparison.OrdinalIgnoreCase))
        {
            if (Enum.TryParse<PayoutStatus>(query.Status, true, out var s))
            {
                q = q.Where(p => p.Status == s);
            }
        }

        if (!string.IsNullOrWhiteSpace(query.Search))
        {
            var term = query.Search.Trim().ToLower();
            q = q.Where(p => p.PayoutNumber.ToLower().Contains(term) || p.Farmer.FarmName.ToLower().Contains(term) || p.Farmer.User.FullName.ToLower().Contains(term));
        }

        if (query.From.HasValue) q = q.Where(p => p.RequestedAt >= query.From.Value);
        if (query.To.HasValue) q = q.Where(p => p.RequestedAt <= query.To.Value);

        var total = await q.CountAsync();

        var items = await q
            .OrderByDescending(p => p.RequestedAt)
            .Skip((query.Page - 1) * query.PageSize)
            .Take(query.PageSize)
            .ToListAsync();

        var dtos = items.Select(p => new AdminPayoutListItemDto
        {
            Id = p.Id,
            PayoutNumber = p.PayoutNumber,
            FarmerId = p.FarmerId,
            FarmerName = p.Farmer?.User?.FullName ?? "Unknown",
            FarmName = p.Farmer?.FarmName ?? string.Empty,
            Amount = p.Amount,
            Method = p.Method.ToString(),
            Status = p.Status.ToString(),
            RequestedAt = p.RequestedAt,
            PaidAt = p.PaidAt,
            Reference = p.Reference
        }).ToList();

        return (dtos, total);
    }

    public async Task<AdminPayoutDetailDto?> GetPayoutDetailAsync(Guid id)
    {
        var p = await _context.Payouts
            .Include(x => x.Farmer).ThenInclude(f => f.User)
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == id);

        if (p == null) return null;

        var fName = p.Farmer?.User?.FullName ?? string.Empty;
        var fFarm = p.Farmer?.FarmName ?? string.Empty;

        var history = await _context.Payouts
            .Where(x => x.FarmerId == p.FarmerId && x.Id != id)
            .OrderByDescending(x => x.RequestedAt)
            .Take(5)
            .Select(x => new AdminPayoutListItemDto
            {
                Id = x.Id,
                PayoutNumber = x.PayoutNumber,
                FarmerId = x.FarmerId,
                FarmerName = fName,
                FarmName = fFarm,
                Amount = x.Amount,
                Method = x.Method.ToString(),
                Status = x.Status.ToString(),
                RequestedAt = x.RequestedAt,
                PaidAt = x.PaidAt,
                Reference = x.Reference
            }).ToListAsync();

        return new AdminPayoutDetailDto
        {
            Id = p.Id,
            PayoutNumber = p.PayoutNumber,
            FarmerId = p.FarmerId,
            FarmerName = fName,
            FarmName = fFarm,
            FarmerEmail = p.Farmer?.User?.Email ?? string.Empty,
            FarmerPhone = string.Empty,
            Amount = p.Amount,
            Method = p.Method.ToString(),
            Status = p.Status.ToString(),
            BankAccountNameSnapshot = p.BankAccountNameSnapshot,
            BankAccountNumberSnapshot = p.BankAccountNumberSnapshot,
            IfscCodeSnapshot = p.IfscCodeSnapshot,
            UpiIdSnapshot = p.UpiIdSnapshot,
            RequestedAt = p.RequestedAt,
            ProcessedAt = p.ProcessedAt,
            PaidAt = p.PaidAt,
            Reference = p.Reference,
            FailureReason = p.FailureReason,
            Notes = p.Notes,
            FarmerPayoutHistory = history
        };
    }

    public async Task<Payout?> GetPayoutByIdAsync(Guid id)
    {
        return await _context.Payouts.FirstOrDefaultAsync(p => p.Id == id);
    }

    public Task UpdatePayoutAsync(Payout payout)
    {
        _context.Payouts.Update(payout);
        return Task.CompletedTask;
    }

    public async Task<List<Payout>> GetPayoutsByIdsAsync(List<Guid> ids)
    {
        return await _context.Payouts.Where(p => ids.Contains(p.Id)).ToListAsync();
    }
    #endregion

    #region Refunds
    public async Task<(IEnumerable<AdminRefundListItemDto> Items, int TotalCount)> GetRefundsAsync(AdminRefundQuery query)
    {
        var q = _context.Refunds
            .Include(r => r.Order).ThenInclude(o => o.Buyer).ThenInclude(b => b.User)
            .AsNoTracking()
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(query.Status) && !query.Status.Equals("all", StringComparison.OrdinalIgnoreCase))
        {
            if (Enum.TryParse<RefundStatus>(query.Status, true, out var s))
            {
                q = q.Where(r => r.Status == s);
            }
        }

        if (query.From.HasValue) q = q.Where(r => r.CreatedAt >= query.From.Value);
        if (query.To.HasValue) q = q.Where(r => r.CreatedAt <= query.To.Value);

        var total = await q.CountAsync();

        var items = await q
            .OrderByDescending(r => r.CreatedAt)
            .Skip((query.Page - 1) * query.PageSize)
            .Take(query.PageSize)
            .ToListAsync();

        var dtos = items.Select(r => new AdminRefundListItemDto
        {
            Id = r.Id,
            OrderId = r.OrderId,
            OrderNumber = r.Order?.OrderNumber ?? string.Empty,
            BuyerName = r.Order?.Buyer?.User?.FullName ?? "Unknown",
            Amount = r.Amount,
            Reason = r.Reference ?? "Refund",
            Status = r.Status.ToString(),
            Reference = r.Reference,
            CreatedAt = r.CreatedAt,
            ProcessedAt = r.ProcessedAt
        }).ToList();

        return (dtos, total);
    }

    public async Task<AdminRefundDetailDto?> GetRefundDetailAsync(Guid id)
    {
        var r = await _context.Refunds
            .Include(x => x.Order).ThenInclude(o => o.Buyer).ThenInclude(b => b.User)
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == id);

        if (r == null) return null;

        return new AdminRefundDetailDto
        {
            Id = r.Id,
            OrderId = r.OrderId,
            OrderNumber = r.Order?.OrderNumber ?? string.Empty,
            OrderTotalAmount = r.Order?.TotalAmount ?? 0,
            BuyerName = r.Order?.Buyer?.User?.FullName ?? string.Empty,
            BuyerEmail = r.Order?.Buyer?.User?.Email ?? string.Empty,
            Amount = r.Amount,
            Reason = r.Reference ?? "Refund",
            Status = r.Status.ToString(),
            Reference = r.Reference,
            CreatedAt = r.CreatedAt,
            ProcessedAt = r.ProcessedAt
        };
    }

    public async Task<Refund?> GetRefundByIdAsync(Guid id)
    {
        return await _context.Refunds.Include(r => r.Order).FirstOrDefaultAsync(r => r.Id == id);
    }

    public async Task AddRefundAsync(Refund refund)
    {
        await _context.Refunds.AddAsync(refund);
    }

    public Task UpdateRefundAsync(Refund refund)
    {
        _context.Refunds.Update(refund);
        return Task.CompletedTask;
    }
    #endregion

    #region Reports
    public async Task<AdminReportOverviewDto> GetReportOverviewAsync(DateTime? from, DateTime? to)
    {
        var orderQ = _context.Orders.AsQueryable();
        var userQ = _context.Users.AsQueryable();

        if (from.HasValue)
        {
            orderQ = orderQ.Where(o => o.PlacedAt >= from.Value);
            userQ = userQ.Where(u => u.CreatedAt >= from.Value);
        }
        if (to.HasValue)
        {
            orderQ = orderQ.Where(o => o.PlacedAt <= to.Value);
            userQ = userQ.Where(u => u.CreatedAt <= to.Value);
        }

        var ordersList = await orderQ.ToListAsync();
        var delivered = ordersList.Where(o => o.Status == OrderStatus.Delivered).ToList();
        var nonCancelled = ordersList.Where(o => o.Status != OrderStatus.Cancelled).ToList();

        // Period GMV: Gross value of all valid orders traded on the platform in period
        var totalGmv = nonCancelled.Sum(o => o.TotalAmount);
        var deliveredRev = delivered.Sum(o => o.TotalAmount);
        var totalOrders = ordersList.Count;
        var avgOrder = totalOrders > 0 ? Math.Round(totalGmv / totalOrders, 2) : 0;

        var newUsers = await userQ.CountAsync();
        var newFarmers = await userQ.CountAsync(u => u.Role == UserRole.Farmer);
        var newBuyers = await userQ.CountAsync(u => u.Role == UserRole.Buyer);

        var returnsCount = await _context.ReturnRequests.CountAsync();
        var disputesCount = await _context.Disputes.CountAsync();

        var returnRate = totalOrders > 0 ? Math.Round((decimal)returnsCount / totalOrders, 3) : 0;
        var disputeRate = totalOrders > 0 ? Math.Round((decimal)disputesCount / totalOrders, 3) : 0;

        var activeListings = await _context.Products.CountAsync(p => p.Status == ProductStatus.Active);
        
        // Net Platform Revenue (2% commission or sum of platform fees)
        var platformFees = nonCancelled.Sum(o => o.PlatformFee);
        if (platformFees == 0 && totalGmv > 0)
        {
            platformFees = Math.Round(totalGmv * 0.02m, 2);
        }

        // Crops traded volume in quintals
        var nonCancelledOrderIds = nonCancelled.Select(d => d.Id).ToList();
        var orderItems = await _context.OrderItems
            .Where(oi => nonCancelledOrderIds.Contains(oi.OrderId))
            .ToListAsync();
        var totalQuintals = orderItems.Sum(oi => oi.QuantityQuintal);

        return new AdminReportOverviewDto
        {
            TotalRevenue = deliveredRev > 0 ? deliveredRev : totalGmv,
            TotalGmv = totalGmv,
            NetRevenue = platformFees,
            UnitsSoldQuintals = totalQuintals,
            TotalOrders = totalOrders,
            AverageOrderValue = avgOrder,
            NewUsers = newUsers,
            NewFarmers = newFarmers,
            NewBuyers = newBuyers,
            ReturnRate = returnRate,
            DisputeRate = disputeRate,
            ActiveListings = activeListings,
            PlatformFeeRevenue = platformFees
        };
    }

    public async Task<List<AdminRevenueSeriesPoint>> GetRevenueReportAsync(string granularity, DateTime? from, DateTime? to)
    {
        var start = from ?? DateTime.UtcNow.AddMonths(-11);
        var end = to ?? DateTime.UtcNow;

        var orders = await _context.Orders
            .Where(o => o.Status != OrderStatus.Cancelled && (o.DeliveredAt ?? o.PlacedAt) >= start && (o.DeliveredAt ?? o.PlacedAt) <= end)
            .ToListAsync();

        var result = new List<AdminRevenueSeriesPoint>();

        if (granularity.ToLower() == "day")
        {
            var groups = orders.GroupBy(o => (o.DeliveredAt ?? o.PlacedAt).ToString("yyyy-MM-dd")).OrderBy(g => g.Key);
            foreach (var g in groups)
            {
                var dayGmv = g.Sum(x => x.TotalAmount);
                var fees = g.Sum(x => x.PlatformFee);
                if (fees == 0 && dayGmv > 0) fees = Math.Round(dayGmv * 0.02m, 2);

                result.Add(new AdminRevenueSeriesPoint
                {
                    Period = g.Key,
                    Revenue = dayGmv,
                    Orders = g.Count(),
                    PlatformFees = fees
                });
            }
        }
        else if (granularity.ToLower() == "week")
        {
            var groups = orders.GroupBy(o =>
            {
                var dt = o.DeliveredAt ?? o.PlacedAt;
                var cal = CultureInfo.InvariantCulture.Calendar;
                var week = cal.GetWeekOfYear(dt, CalendarWeekRule.FirstFourDayWeek, DayOfWeek.Monday);
                return $"{dt.Year}-W{week:D2}";
            }).OrderBy(g => g.Key);

            foreach (var g in groups)
            {
                result.Add(new AdminRevenueSeriesPoint
                {
                    Period = g.Key,
                    Revenue = g.Sum(x => x.TotalAmount),
                    Orders = g.Count(),
                    PlatformFees = g.Sum(x => x.PlatformFee)
                });
            }
        }
        else
        {
            var groups = orders.GroupBy(o => (o.DeliveredAt ?? o.PlacedAt).ToString("yyyy-MM")).OrderBy(g => g.Key);
            foreach (var g in groups)
            {
                result.Add(new AdminRevenueSeriesPoint
                {
                    Period = g.Key,
                    Revenue = g.Sum(x => x.TotalAmount),
                    Orders = g.Count(),
                    PlatformFees = g.Sum(x => x.PlatformFee)
                });
            }
        }

        return result;
    }

    public async Task<List<AdminUserGrowthSeriesPoint>> GetUserGrowthReportAsync(DateTime? from, DateTime? to)
    {
        var start = from ?? DateTime.UtcNow.AddMonths(-11);
        var end = to ?? DateTime.UtcNow;

        var users = await _context.Users
            .Where(u => u.CreatedAt >= start && u.CreatedAt <= end)
            .ToListAsync();

        return users
            .GroupBy(u => u.CreatedAt.ToString("yyyy-MM"))
            .OrderBy(g => g.Key)
            .Select(g => new AdminUserGrowthSeriesPoint
            {
                Period = g.Key,
                Buyers = g.Count(u => u.Role == UserRole.Buyer),
                Farmers = g.Count(u => u.Role == UserRole.Farmer),
                Total = g.Count()
            }).ToList();
    }

    public async Task<List<AdminTopFarmerDto>> GetTopFarmersAsync(int limit, DateTime? from, DateTime? to)
    {
        var ordersQ = _context.Orders.Include(o => o.Seller).AsQueryable();
        if (from.HasValue) ordersQ = ordersQ.Where(o => o.PlacedAt >= from.Value);
        if (to.HasValue) ordersQ = ordersQ.Where(o => o.PlacedAt <= to.Value);

        var list = await ordersQ
            .GroupBy(o => new { FarmerId = o.SellerId, o.Seller.FarmName, o.Seller.Rating })
            .Select(g => new AdminTopFarmerDto
            {
                FarmerId = g.Key.FarmerId,
                FarmName = g.Key.FarmName,
                Revenue = g.Sum(o => o.TotalAmount),
                Orders = g.Count(),
                Rating = g.Key.Rating
            })
            .OrderByDescending(x => x.Revenue)
            .Take(limit)
            .ToListAsync();

        return list;
    }

    public async Task<List<AdminTopBuyerDto>> GetTopBuyersAsync(int limit, DateTime? from, DateTime? to)
    {
        var ordersQ = _context.Orders.Include(o => o.Buyer).ThenInclude(b => b.User).AsQueryable();
        if (from.HasValue) ordersQ = ordersQ.Where(o => o.PlacedAt >= from.Value);
        if (to.HasValue) ordersQ = ordersQ.Where(o => o.PlacedAt <= to.Value);

        var list = await ordersQ
            .GroupBy(o => new { o.BuyerId, BuyerName = o.Buyer.User.FullName })
            .Select(g => new AdminTopBuyerDto
            {
                BuyerId = g.Key.BuyerId,
                BuyerName = g.Key.BuyerName,
                TotalSpent = g.Sum(o => o.TotalAmount),
                Orders = g.Count()
            })
            .OrderByDescending(x => x.TotalSpent)
            .Take(limit)
            .ToListAsync();

        return list;
    }

    public async Task<List<AdminTopProductDto>> GetTopProductsAsync(int limit, DateTime? from, DateTime? to)
    {
        var itemsQ = _context.OrderItems
            .Include(oi => oi.Product).ThenInclude(p => p.Farmer).ThenInclude(f => f.User)
            .Include(oi => oi.Order)
            .AsQueryable();

        if (from.HasValue) itemsQ = itemsQ.Where(oi => oi.Order.PlacedAt >= from.Value);
        if (to.HasValue) itemsQ = itemsQ.Where(oi => oi.Order.PlacedAt <= to.Value);

        var list = await itemsQ
            .GroupBy(oi => new { oi.ProductId, ProductName = oi.Product.Name, FarmerName = oi.Product.Farmer.FarmName })
            .Select(g => new AdminTopProductDto
            {
                ProductId = g.Key.ProductId,
                ProductName = g.Key.ProductName,
                FarmerName = g.Key.FarmerName,
                UnitsSold = g.Sum(x => x.QuantityQuintal),
                Revenue = g.Sum(x => x.LineTotal)
            })
            .OrderByDescending(x => x.Revenue)
            .Take(limit)
            .ToListAsync();

        return list;
    }

    public async Task<List<AdminCategoryReportDto>> GetCategoryReportAsync(DateTime? from, DateTime? to)
    {
        var itemsQ = _context.OrderItems
            .Include(oi => oi.Product).ThenInclude(p => p.Category)
            .Include(oi => oi.Order)
            .AsQueryable();

        if (from.HasValue) itemsQ = itemsQ.Where(oi => oi.Order.PlacedAt >= from.Value);
        if (to.HasValue) itemsQ = itemsQ.Where(oi => oi.Order.PlacedAt <= to.Value);

        var groups = await itemsQ
            .Where(oi => oi.Product.Category != null)
            .GroupBy(oi => new { oi.Product.CategoryId, CategoryName = oi.Product.Category.Name })
            .Select(g => new
            {
                g.Key.CategoryId,
                g.Key.CategoryName,
                Revenue = g.Sum(x => x.LineTotal),
                Orders = g.Select(x => x.OrderId).Distinct().Count()
            })
            .OrderByDescending(x => x.Revenue)
            .ToListAsync();

        var totalRev = groups.Sum(x => x.Revenue);

        return groups.Select(g => new AdminCategoryReportDto
        {
            CategoryId = g.CategoryId,
            CategoryName = g.CategoryName,
            Revenue = g.Revenue,
            Orders = g.Orders,
            Percentage = totalRev > 0 ? Math.Round((g.Revenue / totalRev) * 100, 1) : 0
        }).ToList();
    }

    public async Task<List<AdminLocationReportDto>> GetLocationReportAsync(DateTime? from, DateTime? to)
    {
        var ordersQ = _context.Orders.AsQueryable();
        if (from.HasValue) ordersQ = ordersQ.Where(o => o.PlacedAt >= from.Value);
        if (to.HasValue) ordersQ = ordersQ.Where(o => o.PlacedAt <= to.Value);

        var list = await ordersQ
            .GroupBy(o => new { State = o.DeliveryState, District = o.DeliveryCity })
            .Select(g => new AdminLocationReportDto
            {
                State = g.Key.State,
                District = g.Key.District,
                Orders = g.Count(),
                Revenue = g.Sum(o => o.TotalAmount),
                UniqueBuyers = g.Select(o => o.BuyerId).Distinct().Count()
            })
            .OrderByDescending(x => x.Revenue)
            .ToListAsync();

        return list;
    }
    #endregion

    #region Coupons
    public async Task<(IEnumerable<AdminCouponDto> Items, int TotalCount)> GetCouponsAsync(AdminCouponQuery query)
    {
        var q = _context.Coupons.AsNoTracking().AsQueryable();

        if (query.Active.HasValue)
        {
            q = q.Where(c => c.IsActive == query.Active.Value);
        }

        if (!string.IsNullOrWhiteSpace(query.Search))
        {
            var term = query.Search.Trim().ToUpper();
            q = q.Where(c => c.Code.Contains(term));
        }

        var total = await q.CountAsync();

        var items = await q
            .OrderByDescending(c => c.CreatedAt)
            .Skip((query.Page - 1) * query.PageSize)
            .Take(query.PageSize)
            .ToListAsync();

        var dtos = items.Select(c => new AdminCouponDto
        {
            Id = c.Id,
            Code = c.Code,
            Description = c.Description,
            Type = c.Type.ToString(),
            Value = c.Value,
            MinOrderValue = c.MinOrderValue,
            MaxDiscount = c.MaxDiscount,
            ValidFrom = c.ValidFrom,
            ValidTo = c.ValidTo,
            IsActive = c.IsActive,
            UsageLimit = c.UsageLimit,
            UsedCount = c.UsedCount,
            CreatedAt = c.CreatedAt
        }).ToList();

        return (dtos, total);
    }

    public async Task<Coupon?> GetCouponByIdAsync(Guid id)
    {
        return await _context.Coupons.FirstOrDefaultAsync(c => c.Id == id);
    }

    public async Task<Coupon?> GetCouponByCodeAsync(string code)
    {
        var upper = code.Trim().ToUpper();
        return await _context.Coupons.FirstOrDefaultAsync(c => c.Code == upper);
    }

    public async Task AddCouponAsync(Coupon coupon)
    {
        await _context.Coupons.AddAsync(coupon);
    }

    public Task UpdateCouponAsync(Coupon coupon)
    {
        _context.Coupons.Update(coupon);
        return Task.CompletedTask;
    }

    public Task DeleteCouponAsync(Coupon coupon)
    {
        _context.Coupons.Remove(coupon);
        return Task.CompletedTask;
    }
    #endregion

    #region Categories
    public async Task<List<AdminCategoryDto>> GetCategoriesAsync()
    {
        var categories = await _context.Categories
            .Include(c => c.Products)
            .OrderBy(c => c.DisplayOrder)
            .ThenBy(c => c.Name)
            .ToListAsync();

        return categories.Select(c => new AdminCategoryDto
        {
            Id = c.Id,
            Name = c.Name,
            Slug = c.Slug,
            DisplayOrder = c.DisplayOrder,
            IsActive = c.IsActive,
            ProductsCount = c.Products.Count,
            CreatedAt = c.CreatedAt
        }).ToList();
    }

    public async Task<Category?> GetCategoryByIdAsync(Guid id)
    {
        return await _context.Categories.Include(c => c.Products).FirstOrDefaultAsync(c => c.Id == id);
    }

    public async Task<Category?> GetCategoryBySlugAsync(string slug)
    {
        return await _context.Categories.FirstOrDefaultAsync(c => c.Slug == slug.Trim().ToLower());
    }

    public async Task<int> GetActiveProductCountForCategoryAsync(Guid categoryId)
    {
        return await _context.Products.CountAsync(p => p.CategoryId == categoryId && p.Status == ProductStatus.Active);
    }

    public async Task AddCategoryAsync(Category category)
    {
        await _context.Categories.AddAsync(category);
    }

    public Task UpdateCategoryAsync(Category category)
    {
        _context.Categories.Update(category);
        return Task.CompletedTask;
    }

    public async Task UpdateCategoriesOrderAsync(List<CategoryOrderItem> items)
    {
        var catIds = items.Select(i => i.CategoryId).ToList();
        var categories = await _context.Categories.Where(c => catIds.Contains(c.Id)).ToListAsync();

        foreach (var cat in categories)
        {
            var match = items.FirstOrDefault(i => i.CategoryId == cat.Id);
            if (match != null)
            {
                cat.DisplayOrder = match.DisplayOrder;
            }
        }
    }
    #endregion

    #region Platform Settings
    public async Task<PlatformSetting> GetPlatformSettingsAsync()
    {
        var settings = await _context.PlatformSettings
            .Include(p => p.UpdatedByUser)
            .FirstOrDefaultAsync();

        if (settings == null)
        {
            settings = new PlatformSetting
            {
                Id = Guid.NewGuid(),
                CommissionPercent = 2.00m,
                DefaultDeliveryFee = 50.00m,
                PlatformFee = 10.00m,
                TaxPercent = 5.00m,
                CODEnabled = true,
                MaintenanceModeEnabled = false,
                NewRegistrationsEnabled = true,
                NegotiationsEnabled = true,
                VerifiedOnlyMarketplace = false,
                MaxDeliverySlotsPerDay = 5,
                SupportEmail = "support@farmerbandh.com",
                SupportPhone = "1800123456",
                UpdatedAt = DateTime.UtcNow
            };
            await _context.PlatformSettings.AddAsync(settings);
            await _context.SaveChangesAsync();
        }

        return settings;
    }

    public Task UpdatePlatformSettingsAsync(PlatformSetting settings)
    {
        _context.PlatformSettings.Update(settings);
        return Task.CompletedTask;
    }
    #endregion

    #region Activity Logs
    public async Task<(IEnumerable<AdminActivityLogListItemDto> Items, int TotalCount)> GetActivityLogsAsync(AdminActivityLogQuery query)
    {
        var q = _context.ActivityLogs
            .Include(a => a.ActorUser)
            .AsNoTracking()
            .AsQueryable();

        if (query.Actor.HasValue) q = q.Where(a => a.ActorUserId == query.Actor.Value);
        if (!string.IsNullOrWhiteSpace(query.Action)) q = q.Where(a => a.Action == query.Action);
        if (!string.IsNullOrWhiteSpace(query.TargetType)) q = q.Where(a => a.TargetType == query.TargetType);
        if (query.TargetId.HasValue) q = q.Where(a => a.TargetId == query.TargetId.Value);
        if (query.From.HasValue) q = q.Where(a => a.CreatedAt >= query.From.Value);
        if (query.To.HasValue) q = q.Where(a => a.CreatedAt <= query.To.Value);

        if (!string.IsNullOrWhiteSpace(query.Search))
        {
            var term = query.Search.Trim().ToLower();
            q = q.Where(a => a.Summary.ToLower().Contains(term) || (a.ActorUser != null && a.ActorUser.FullName.ToLower().Contains(term)));
        }

        var total = await q.CountAsync();

        var items = await q
            .OrderByDescending(a => a.CreatedAt)
            .Skip((query.Page - 1) * query.PageSize)
            .Take(query.PageSize)
            .ToListAsync();

        var dtos = items.Select(a => new AdminActivityLogListItemDto
        {
            Id = a.Id,
            ActorUserId = a.ActorUserId,
            ActorName = a.ActorUser?.FullName ?? "System",
            ActorRole = a.ActorRole.ToString(),
            Action = a.Action,
            TargetType = a.TargetType,
            TargetId = a.TargetId,
            Summary = a.Summary,
            IpAddress = a.IpAddress,
            CreatedAt = a.CreatedAt
        }).ToList();

        return (dtos, total);
    }

    public async Task<AdminActivityLogDetailDto?> GetActivityLogDetailAsync(Guid id)
    {
        var a = await _context.ActivityLogs
            .Include(x => x.ActorUser)
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == id);

        if (a == null) return null;

        return new AdminActivityLogDetailDto
        {
            Id = a.Id,
            ActorUserId = a.ActorUserId,
            ActorName = a.ActorUser?.FullName ?? "System",
            ActorEmail = a.ActorUser?.Email ?? string.Empty,
            ActorRole = a.ActorRole.ToString(),
            Action = a.Action,
            TargetType = a.TargetType,
            TargetId = a.TargetId,
            Summary = a.Summary,
            Metadata = a.Metadata,
            IpAddress = a.IpAddress,
            UserAgent = a.UserAgent,
            CreatedAt = a.CreatedAt
        };
    }

    public async Task<List<ActivityLog>> GetActivityLogsForExportAsync(AdminActivityLogQuery query)
    {
        var q = _context.ActivityLogs
            .Include(a => a.ActorUser)
            .AsNoTracking()
            .AsQueryable();

        if (query.Actor.HasValue) q = q.Where(a => a.ActorUserId == query.Actor.Value);
        if (!string.IsNullOrWhiteSpace(query.Action)) q = q.Where(a => a.Action == query.Action);
        if (!string.IsNullOrWhiteSpace(query.TargetType)) q = q.Where(a => a.TargetType == query.TargetType);
        if (query.TargetId.HasValue) q = q.Where(a => a.TargetId == query.TargetId.Value);
        if (query.From.HasValue) q = q.Where(a => a.CreatedAt >= query.From.Value);
        if (query.To.HasValue) q = q.Where(a => a.CreatedAt <= query.To.Value);

        return await q.OrderByDescending(a => a.CreatedAt).Take(5000).ToListAsync();
    }
    #endregion

    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }
}
