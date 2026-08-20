using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SurgicalClinic.DataAccessLayer.Migrations
{
    /// <inheritdoc />
    public partial class IslemSecenekCascadeFix : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_IslemSecenekler_Islemler_IslemId",
                table: "IslemSecenekler");

            migrationBuilder.AddForeignKey(
                name: "FK_IslemSecenekler_Islemler_IslemId",
                table: "IslemSecenekler",
                column: "IslemId",
                principalTable: "Islemler",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_IslemSecenekler_Islemler_IslemId",
                table: "IslemSecenekler");

            migrationBuilder.AddForeignKey(
                name: "FK_IslemSecenekler_Islemler_IslemId",
                table: "IslemSecenekler",
                column: "IslemId",
                principalTable: "Islemler",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
