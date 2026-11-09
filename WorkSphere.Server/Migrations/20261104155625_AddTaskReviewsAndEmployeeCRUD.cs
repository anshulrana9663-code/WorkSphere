using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WorkSphere.Server.Migrations
{
    /// <inheritdoc />
    public partial class AddTaskReviewsAndEmployeeCRUD : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "TaskReviews",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    RevieweeId = table.Column<int>(type: "int", nullable: false),
                    ReviewerId = table.Column<int>(type: "int", nullable: false),
                    StarRating = table.Column<int>(type: "int", nullable: false),
                    Comment = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: false),
                    ReviewPeriod = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()"),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TaskReviews", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TaskReviews_Employees_RevieweeId",
                        column: x => x.RevieweeId,
                        principalTable: "Employees",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_TaskReviews_Employees_ReviewerId",
                        column: x => x.ReviewerId,
                        principalTable: "Employees",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_TaskReviews_RevieweeId",
                table: "TaskReviews",
                column: "RevieweeId");

            migrationBuilder.CreateIndex(
                name: "IX_TaskReviews_RevieweeId_ReviewPeriod",
                table: "TaskReviews",
                columns: new[] { "RevieweeId", "ReviewPeriod" });

            migrationBuilder.CreateIndex(
                name: "IX_TaskReviews_ReviewerId",
                table: "TaskReviews",
                column: "ReviewerId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "TaskReviews");
        }
    }
}
