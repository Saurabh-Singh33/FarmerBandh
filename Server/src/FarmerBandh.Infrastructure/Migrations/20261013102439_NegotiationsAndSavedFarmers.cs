using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FarmerBandh.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class NegotiationsAndSavedFarmers : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("DROP TABLE IF EXISTS `NegotiationMessages`;");
            migrationBuilder.Sql("DROP TABLE IF EXISTS `SavedFarmers`;");
            migrationBuilder.Sql("DROP TABLE IF EXISTS `Negotiations`;");

            migrationBuilder.CreateTable(
                name: "Negotiations",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    BuyerId = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    FarmerId = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    ProductId = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    InitialPricePerQuintal = table.Column<decimal>(type: "decimal(12,2)", precision: 12, scale: 2, nullable: false),
                    CurrentOfferPrice = table.Column<decimal>(type: "decimal(12,2)", precision: 12, scale: 2, nullable: false),
                    CurrentOfferByUserId = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    CurrentOfferByRole = table.Column<int>(type: "int", nullable: false),
                    LastCounterPrice = table.Column<decimal>(type: "decimal(12,2)", precision: 12, scale: 2, nullable: true),
                    Status = table.Column<int>(type: "int", nullable: false),
                    AgreedPricePerQuintal = table.Column<decimal>(type: "decimal(12,2)", precision: 12, scale: 2, nullable: true),
                    QuantityQuintal = table.Column<decimal>(type: "decimal(12,2)", precision: 12, scale: 2, nullable: true),
                    OpenedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    LastMessageAt = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    ExpiresAt = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    AcceptedAt = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    RejectedAt = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    ExpiredAt = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    WithdrawnAt = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    RejectionReason = table.Column<string>(type: "varchar(300)", maxLength: 300, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Negotiations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Negotiations_Buyers_BuyerId",
                        column: x => x.BuyerId,
                        principalTable: "Buyers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Negotiations_Farmers_FarmerId",
                        column: x => x.FarmerId,
                        principalTable: "Farmers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Negotiations_Products_ProductId",
                        column: x => x.ProductId,
                        principalTable: "Products",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Negotiations_Users_CurrentOfferByUserId",
                        column: x => x.CurrentOfferByUserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                })
                .Annotation("MySql:CharSet", "utf8mb4");



            migrationBuilder.CreateTable(
                name: "SavedFarmers",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    BuyerId = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    FarmerId = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    SavedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    Note = table.Column<string>(type: "varchar(300)", maxLength: 300, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SavedFarmers", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SavedFarmers_Buyers_BuyerId",
                        column: x => x.BuyerId,
                        principalTable: "Buyers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_SavedFarmers_Farmers_FarmerId",
                        column: x => x.FarmerId,
                        principalTable: "Farmers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "NegotiationMessages",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    NegotiationId = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    SenderUserId = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    SenderRole = table.Column<int>(type: "int", nullable: false),
                    MessageType = table.Column<int>(type: "int", nullable: false),
                    Body = table.Column<string>(type: "varchar(1000)", maxLength: 1000, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    OfferPrice = table.Column<decimal>(type: "decimal(12,2)", precision: 12, scale: 2, nullable: true),
                    QuantityQuintal = table.Column<decimal>(type: "decimal(12,2)", precision: 12, scale: 2, nullable: true),
                    IsRead = table.Column<bool>(type: "tinyint(1)", nullable: false, defaultValue: false),
                    ReadAt = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_NegotiationMessages", x => x.Id);
                    table.ForeignKey(
                        name: "FK_NegotiationMessages_Negotiations_NegotiationId",
                        column: x => x.NegotiationId,
                        principalTable: "Negotiations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_NegotiationMessages_Users_SenderUserId",
                        column: x => x.SenderUserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateIndex(
                name: "IX_NegotiationMessages_NegotiationId_CreatedAt",
                table: "NegotiationMessages",
                columns: new[] { "NegotiationId", "CreatedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_NegotiationMessages_SenderUserId_IsRead",
                table: "NegotiationMessages",
                columns: new[] { "SenderUserId", "IsRead" });

            migrationBuilder.CreateIndex(
                name: "IX_Negotiations_BuyerId_FarmerId_ProductId",
                table: "Negotiations",
                columns: new[] { "BuyerId", "FarmerId", "ProductId" });

            migrationBuilder.CreateIndex(
                name: "IX_Negotiations_BuyerId_LastMessageAt",
                table: "Negotiations",
                columns: new[] { "BuyerId", "LastMessageAt" });

            migrationBuilder.CreateIndex(
                name: "IX_Negotiations_CurrentOfferByUserId",
                table: "Negotiations",
                column: "CurrentOfferByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_Negotiations_FarmerId_LastMessageAt",
                table: "Negotiations",
                columns: new[] { "FarmerId", "LastMessageAt" });

            migrationBuilder.CreateIndex(
                name: "IX_Negotiations_ProductId",
                table: "Negotiations",
                column: "ProductId");

            migrationBuilder.CreateIndex(
                name: "IX_Negotiations_Status_ExpiresAt",
                table: "Negotiations",
                columns: new[] { "Status", "ExpiresAt" });

            migrationBuilder.CreateIndex(
                name: "IX_SavedFarmers_BuyerId_FarmerId",
                table: "SavedFarmers",
                columns: new[] { "BuyerId", "FarmerId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_SavedFarmers_BuyerId_SavedAt",
                table: "SavedFarmers",
                columns: new[] { "BuyerId", "SavedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_SavedFarmers_FarmerId",
                table: "SavedFarmers",
                column: "FarmerId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "NegotiationMessages");

            migrationBuilder.DropTable(
                name: "SavedFarmers");

            migrationBuilder.DropTable(
                name: "Negotiations");
        }
    }
}
