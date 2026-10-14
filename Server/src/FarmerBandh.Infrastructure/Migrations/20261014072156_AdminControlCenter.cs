using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FarmerBandh.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AdminControlCenter : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "FlaggedAt",
                table: "Products",
                type: "datetime(6)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "FlaggedReason",
                table: "Products",
                type: "varchar(300)",
                maxLength: 300,
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<bool>(
                name: "MaintenanceModeEnabled",
                table: "PlatformSettings",
                type: "tinyint(1)",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<int>(
                name: "MaxDeliverySlotsPerDay",
                table: "PlatformSettings",
                type: "int",
                nullable: false,
                defaultValue: 5);

            migrationBuilder.AddColumn<bool>(
                name: "NegotiationsEnabled",
                table: "PlatformSettings",
                type: "tinyint(1)",
                nullable: false,
                defaultValue: true);

            migrationBuilder.AddColumn<bool>(
                name: "NewRegistrationsEnabled",
                table: "PlatformSettings",
                type: "tinyint(1)",
                nullable: false,
                defaultValue: true);

            migrationBuilder.AddColumn<string>(
                name: "SupportEmail",
                table: "PlatformSettings",
                type: "varchar(150)",
                maxLength: 150,
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "SupportPhone",
                table: "PlatformSettings",
                type: "varchar(20)",
                maxLength: 20,
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<Guid>(
                name: "UpdatedByUserId",
                table: "PlatformSettings",
                type: "char(36)",
                nullable: true,
                collation: "ascii_general_ci");

            migrationBuilder.AddColumn<bool>(
                name: "VerifiedOnlyMarketplace",
                table: "PlatformSettings",
                type: "tinyint(1)",
                nullable: false,
                defaultValue: false);

            migrationBuilder.CreateTable(
                name: "ActivityLogs",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    ActorUserId = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    ActorRole = table.Column<int>(type: "int", nullable: false),
                    Action = table.Column<string>(type: "varchar(80)", maxLength: 80, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    TargetType = table.Column<string>(type: "varchar(60)", maxLength: 60, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    TargetId = table.Column<Guid>(type: "char(36)", nullable: true, collation: "ascii_general_ci"),
                    Summary = table.Column<string>(type: "varchar(500)", maxLength: 500, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Metadata = table.Column<string>(type: "varchar(2000)", maxLength: 2000, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    IpAddress = table.Column<string>(type: "varchar(45)", maxLength: 45, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    UserAgent = table.Column<string>(type: "varchar(300)", maxLength: 300, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    CreatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ActivityLogs", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ActivityLogs_Users_ActorUserId",
                        column: x => x.ActorUserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "FeaturedListings",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    ProductId = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    FeaturedByUserId = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    DisplayOrder = table.Column<int>(type: "int", nullable: false, defaultValue: 0),
                    StartsAt = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    EndsAt = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    IsActive = table.Column<bool>(type: "tinyint(1)", nullable: false, defaultValue: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FeaturedListings", x => x.Id);
                    table.ForeignKey(
                        name: "FK_FeaturedListings_Products_ProductId",
                        column: x => x.ProductId,
                        principalTable: "Products",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_FeaturedListings_Users_FeaturedByUserId",
                        column: x => x.FeaturedByUserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateIndex(
                name: "IX_PlatformSettings_UpdatedByUserId",
                table: "PlatformSettings",
                column: "UpdatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_ActivityLogs_Action",
                table: "ActivityLogs",
                column: "Action");

            migrationBuilder.CreateIndex(
                name: "IX_ActivityLogs_ActorUserId_CreatedAt",
                table: "ActivityLogs",
                columns: new[] { "ActorUserId", "CreatedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_ActivityLogs_CreatedAt",
                table: "ActivityLogs",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_ActivityLogs_TargetType_TargetId_CreatedAt",
                table: "ActivityLogs",
                columns: new[] { "TargetType", "TargetId", "CreatedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_FeaturedListings_FeaturedByUserId",
                table: "FeaturedListings",
                column: "FeaturedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_FeaturedListings_IsActive_DisplayOrder",
                table: "FeaturedListings",
                columns: new[] { "IsActive", "DisplayOrder" });

            migrationBuilder.CreateIndex(
                name: "IX_FeaturedListings_ProductId",
                table: "FeaturedListings",
                column: "ProductId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_FeaturedListings_StartsAt_EndsAt",
                table: "FeaturedListings",
                columns: new[] { "StartsAt", "EndsAt" });

            migrationBuilder.AddForeignKey(
                name: "FK_PlatformSettings_Users_UpdatedByUserId",
                table: "PlatformSettings",
                column: "UpdatedByUserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_PlatformSettings_Users_UpdatedByUserId",
                table: "PlatformSettings");

            migrationBuilder.DropTable(
                name: "ActivityLogs");

            migrationBuilder.DropTable(
                name: "FeaturedListings");

            migrationBuilder.DropIndex(
                name: "IX_PlatformSettings_UpdatedByUserId",
                table: "PlatformSettings");

            migrationBuilder.DropColumn(
                name: "FlaggedAt",
                table: "Products");

            migrationBuilder.DropColumn(
                name: "FlaggedReason",
                table: "Products");

            migrationBuilder.DropColumn(
                name: "MaintenanceModeEnabled",
                table: "PlatformSettings");

            migrationBuilder.DropColumn(
                name: "MaxDeliverySlotsPerDay",
                table: "PlatformSettings");

            migrationBuilder.DropColumn(
                name: "NegotiationsEnabled",
                table: "PlatformSettings");

            migrationBuilder.DropColumn(
                name: "NewRegistrationsEnabled",
                table: "PlatformSettings");

            migrationBuilder.DropColumn(
                name: "SupportEmail",
                table: "PlatformSettings");

            migrationBuilder.DropColumn(
                name: "SupportPhone",
                table: "PlatformSettings");

            migrationBuilder.DropColumn(
                name: "UpdatedByUserId",
                table: "PlatformSettings");

            migrationBuilder.DropColumn(
                name: "VerifiedOnlyMarketplace",
                table: "PlatformSettings");
        }
    }
}
