using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FarmerBandh.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class MultiItemNegotiation : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "BundleItemsJson",
                table: "Negotiations",
                type: "text",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<bool>(
                name: "IsBundle",
                table: "Negotiations",
                type: "tinyint(1)",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "BundleItemsJson",
                table: "NegotiationMessages",
                type: "text",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "BundleItemsJson",
                table: "Negotiations");

            migrationBuilder.DropColumn(
                name: "IsBundle",
                table: "Negotiations");

            migrationBuilder.DropColumn(
                name: "BundleItemsJson",
                table: "NegotiationMessages");
        }
    }
}
