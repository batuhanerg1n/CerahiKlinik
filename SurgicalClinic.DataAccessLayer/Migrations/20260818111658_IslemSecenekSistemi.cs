using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SurgicalClinic.DataAccessLayer.Migrations
{
    /// <inheritdoc />
    public partial class IslemSecenekSistemi : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "IslemSecenekId",
                table: "Randevular",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "FiyatTipi",
                table: "Islemler",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateTable(
                name: "IslemSecenekler",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    IslemId = table.Column<int>(type: "int", nullable: false),
                    SecenekAd = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Fiyat = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_IslemSecenekler", x => x.Id);
                    table.ForeignKey(
                        name: "FK_IslemSecenekler_Islemler_IslemId",
                        column: x => x.IslemId,
                        principalTable: "Islemler",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Randevular_IslemSecenekId",
                table: "Randevular",
                column: "IslemSecenekId");

            migrationBuilder.CreateIndex(
                name: "IX_IslemSecenekler_IslemId",
                table: "IslemSecenekler",
                column: "IslemId");

            migrationBuilder.AddForeignKey(
                name: "FK_Randevular_IslemSecenekler_IslemSecenekId",
                table: "Randevular",
                column: "IslemSecenekId",
                principalTable: "IslemSecenekler",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Randevular_IslemSecenekler_IslemSecenekId",
                table: "Randevular");

            migrationBuilder.DropTable(
                name: "IslemSecenekler");

            migrationBuilder.DropIndex(
                name: "IX_Randevular_IslemSecenekId",
                table: "Randevular");

            migrationBuilder.DropColumn(
                name: "IslemSecenekId",
                table: "Randevular");

            migrationBuilder.DropColumn(
                name: "FiyatTipi",
                table: "Islemler");
        }
    }
}
