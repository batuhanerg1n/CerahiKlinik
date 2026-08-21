using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SurgicalClinic.DataAccessLayer.Migrations
{
    /// <inheritdoc />
    public partial class IslemBransEkeleme : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "BransId",
                table: "Islemler",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Islemler_BransId",
                table: "Islemler",
                column: "BransId");

            migrationBuilder.AddForeignKey(
                name: "FK_Islemler_Branslar_BransId",
                table: "Islemler",
                column: "BransId",
                principalTable: "Branslar",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Islemler_Branslar_BransId",
                table: "Islemler");

            migrationBuilder.DropIndex(
                name: "IX_Islemler_BransId",
                table: "Islemler");

            migrationBuilder.DropColumn(
                name: "BransId",
                table: "Islemler");
        }
    }
}
