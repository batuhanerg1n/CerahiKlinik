using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SurgicalClinic.DataAccessLayer.Migrations
{
    /// <inheritdoc />
    public partial class AddDurumColumnToRandevu : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Drum",
                table: "Randevular",
                newName: "Durum");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Durum",
                table: "Randevular",
                newName: "Drum");
        }
    }
}
