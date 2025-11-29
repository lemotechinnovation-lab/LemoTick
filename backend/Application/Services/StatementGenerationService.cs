using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using InvestorManagementSystem.Application.DTOs;

namespace InvestorManagementSystem.Application.Services;

/// <summary>
/// Service for generating PDF statements
/// </summary>
public class StatementGenerationService
{
    public StatementGenerationService()
    {
        // Set QuestPDF license (Community license is free for non-commercial use)
        QuestPDF.Settings.License = LicenseType.Community;
    }

    /// <summary>
    /// Generate a PDF statement
    /// </summary>
    public byte[] GenerateStatement(StatementDataDto data)
    {
        return Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4);
                page.Margin(40);
                page.PageColor(Colors.White);
                page.DefaultTextStyle(x => x.FontSize(10).FontColor(Colors.Black));

                page.Header().Element(c => ComposeHeader(c, data));
                page.Content().Element(c => ComposeContent(c, data));
                page.Footer().Element(c => ComposeFooter(c, data));
            });
        }).GeneratePdf();
    }

    private void ComposeHeader(IContainer container, StatementDataDto data)
    {
        container.Column(column =>
        {
            // Company Logo and Header
            column.Item().Row(row =>
            {
                row.RelativeItem().Column(c =>
                {
                    c.Item().Text("LemoTick")
                        .FontSize(24)
                        .Bold()
                        .FontColor(Colors.Blue.Medium);

                    c.Item().Text("Investor Management System")
                        .FontSize(12)
                        .FontColor(Colors.Grey.Darken2);
                });

                row.RelativeItem().AlignRight().Column(c =>
                {
                    c.Item().Text($"Statement Period")
                        .FontSize(10)
                        .Bold();
                    c.Item().Text(data.StatementPeriod)
                        .FontSize(10);
                    c.Item().PaddingTop(5);
                    c.Item().Text($"Generated: {data.GeneratedAt:dd MMM yyyy HH:mm}")
                        .FontSize(8)
                        .FontColor(Colors.Grey.Darken1);
                });
            });

            // Divider
            column.Item().PaddingVertical(10).LineHorizontal(1).LineColor(Colors.Grey.Lighten2);

            // Investor Information
            column.Item().Row(row =>
            {
                row.RelativeItem().Column(c =>
                {
                    c.Item().Text("Investor Information").FontSize(12).Bold();
                    c.Item().PaddingTop(5);
                    c.Item().Text($"Name: {data.InvestorName}").FontSize(10);
                    c.Item().Text($"Email: {data.InvestorEmail}").FontSize(10);
                    c.Item().Text($"ID Number: {data.IdNumber}").FontSize(10);
                });

                row.RelativeItem().AlignRight().Column(c =>
                {
                    c.Item().Text("Statement ID").FontSize(10).Bold();
                    c.Item().Text($"INV-{data.InvestorId.ToString().Substring(0, 8).ToUpper()}")
                        .FontSize(10)
                        .FontColor(Colors.Grey.Darken1);
                });
            });

            column.Item().PaddingVertical(10).LineHorizontal(1).LineColor(Colors.Grey.Lighten2);
        });
    }

    private void ComposeContent(IContainer container, StatementDataDto data)
    {
        container.Column(column =>
        {
            // Executive Summary
            column.Item().Element(c => ComposeSummary(c, data));

            // Portfolio Performance
            if (data.Portfolios.Any())
            {
                column.Item().PaddingTop(15).Element(c => ComposePortfolios(c, data));
            }

            // Transactions
            if (data.Transactions.Any())
            {
                column.Item().PageBreak();
                column.Item().Element(c => ComposeTransactions(c, data));
            }

            // Trades
            if (data.Trades.Any())
            {
                column.Item().PageBreak();
                column.Item().Element(c => ComposeTrades(c, data));
            }

            // Fees
            if (data.Fees.Any())
            {
                column.Item().PaddingTop(15).Element(c => ComposeFees(c, data));
            }
        });
    }

    private void ComposeSummary(IContainer container, StatementDataDto data)
    {
        container.Column(column =>
        {
            column.Item().Text("Executive Summary").FontSize(14).Bold();
            column.Item().PaddingTop(10);

            column.Item().Table(table =>
            {
                table.ColumnsDefinition(columns =>
                {
                    columns.RelativeColumn(2);
                    columns.RelativeColumn(1);
                });

                // Header
                table.Header(header =>
                {
                    header.Cell().Element(CellStyle).Text("Metric").Bold();
                    header.Cell().Element(CellStyle).AlignRight().Text("Value").Bold();
                });

                // Rows
                table.Cell().Element(CellStyle).Text("Total Investment");
                table.Cell().Element(CellStyle).AlignRight().Text($"R {data.TotalInvestment:N2}");

                table.Cell().Element(CellStyle).Text("Current Value");
                table.Cell().Element(CellStyle).AlignRight().Text($"R {data.TotalCurrentValue:N2}");

                table.Cell().Element(CellStyle).Text("Total Profit");
                table.Cell().Element(CellStyle).AlignRight().Text($"R {data.TotalProfit:N2}").FontColor(Colors.Green.Darken2);

                table.Cell().Element(CellStyle).Text("Total Loss");
                table.Cell().Element(CellStyle).AlignRight().Text($"R {data.TotalLoss:N2}").FontColor(Colors.Red.Darken2);

                table.Cell().Element(CellStyle).Text("Net Profit/Loss").Bold();
                table.Cell().Element(CellStyle).AlignRight()
                    .Text($"R {data.NetProfit:N2}")
                    .FontColor(data.NetProfit >= 0 ? Colors.Green.Darken2 : Colors.Red.Darken2)
                    .Bold();

                table.Cell().Element(CellStyle).Text("Return %").Bold();
                table.Cell().Element(CellStyle).AlignRight()
                    .Text($"{data.ReturnPercentage:N2}%")
                    .FontColor(data.ReturnPercentage >= 0 ? Colors.Green.Darken2 : Colors.Red.Darken2)
                    .Bold();

                table.Cell().Element(CellStyle).Text("Total Deposits");
                table.Cell().Element(CellStyle).AlignRight().Text($"R {data.TotalDeposits:N2}");

                table.Cell().Element(CellStyle).Text("Total Withdrawals");
                table.Cell().Element(CellStyle).AlignRight().Text($"R {data.TotalWithdrawals:N2}");

                table.Cell().Element(CellStyle).Text("Total Fees");
                table.Cell().Element(CellStyle).AlignRight().Text($"R {data.TotalFees:N2}");

                table.Cell().Element(CellStyle).Text("Win Rate").Bold();
                table.Cell().Element(CellStyle).AlignRight()
                    .Text($"{data.WinRate:N2}%")
                    .Bold();
            });
        });
    }

    private void ComposePortfolios(IContainer container, StatementDataDto data)
    {
        container.Column(column =>
        {
            column.Item().Text("Portfolio Performance").FontSize(14).Bold();
            column.Item().PaddingTop(10);

            column.Item().Table(table =>
            {
                table.ColumnsDefinition(columns =>
                {
                    columns.RelativeColumn(2);
                    columns.RelativeColumn(1);
                    columns.RelativeColumn(1);
                    columns.RelativeColumn(1);
                    columns.RelativeColumn(1);
                });

                // Header
                table.Header(header =>
                {
                    header.Cell().Element(CellStyle).Text("Portfolio").Bold();
                    header.Cell().Element(CellStyle).AlignRight().Text("Initial").Bold();
                    header.Cell().Element(CellStyle).AlignRight().Text("Current").Bold();
                    header.Cell().Element(CellStyle).AlignRight().Text("Net P/L").Bold();
                    header.Cell().Element(CellStyle).AlignRight().Text("Return %").Bold();
                });

                // Rows
                foreach (var portfolio in data.Portfolios)
                {
                    table.Cell().Element(CellStyle).Text(portfolio.Name);
                    table.Cell().Element(CellStyle).AlignRight().Text($"R {portfolio.InitialValue:N2}");
                    table.Cell().Element(CellStyle).AlignRight().Text($"R {portfolio.CurrentValue:N2}");
                    table.Cell().Element(CellStyle).AlignRight()
                        .Text($"R {portfolio.NetProfit:N2}")
                        .FontColor(portfolio.NetProfit >= 0 ? Colors.Green.Darken2 : Colors.Red.Darken2);
                    table.Cell().Element(CellStyle).AlignRight()
                        .Text($"{portfolio.ReturnPercentage:N2}%")
                        .FontColor(portfolio.ReturnPercentage >= 0 ? Colors.Green.Darken2 : Colors.Red.Darken2);
                }
            });
        });
    }

    private void ComposeTransactions(IContainer container, StatementDataDto data)
    {
        container.Column(column =>
        {
            column.Item().Text("Transactions").FontSize(14).Bold();
            column.Item().PaddingTop(10);

            column.Item().Table(table =>
            {
                table.ColumnsDefinition(columns =>
                {
                    columns.RelativeColumn(1);
                    columns.RelativeColumn(1);
                    columns.RelativeColumn(1);
                    columns.RelativeColumn(1);
                    columns.RelativeColumn(2);
                });

                // Header
                table.Header(header =>
                {
                    header.Cell().Element(CellStyle).Text("Date").Bold();
                    header.Cell().Element(CellStyle).Text("Type").Bold();
                    header.Cell().Element(CellStyle).AlignRight().Text("Amount").Bold();
                    header.Cell().Element(CellStyle).Text("Status").Bold();
                    header.Cell().Element(CellStyle).Text("Description").Bold();
                });

                // Rows
                foreach (var txn in data.Transactions.OrderByDescending(t => t.Date))
                {
                    table.Cell().Element(CellStyle).Text(txn.Date.ToString("dd MMM yyyy"));
                    table.Cell().Element(CellStyle).Text(txn.Type);
                    table.Cell().Element(CellStyle).AlignRight().Text($"R {txn.Amount:N2}");
                    table.Cell().Element(CellStyle).Text(txn.Status);
                    table.Cell().Element(CellStyle).Text(txn.Description ?? "-");
                }
            });
        });
    }

    private void ComposeTrades(IContainer container, StatementDataDto data)
    {
        container.Column(column =>
        {
            column.Item().Text("Trading Activity").FontSize(14).Bold();
            column.Item().PaddingTop(10);

            column.Item().Table(table =>
            {
                table.ColumnsDefinition(columns =>
                {
                    columns.RelativeColumn(1);
                    columns.RelativeColumn(1);
                    columns.RelativeColumn(1);
                    columns.RelativeColumn(1);
                    columns.RelativeColumn(1);
                    columns.RelativeColumn(1);
                });

                // Header
                table.Header(header =>
                {
                    header.Cell().Element(CellStyle).Text("Date").Bold();
                    header.Cell().Element(CellStyle).Text("Symbol").Bold();
                    header.Cell().Element(CellStyle).Text("Direction").Bold();
                    header.Cell().Element(CellStyle).AlignRight().Text("Entry").Bold();
                    header.Cell().Element(CellStyle).AlignRight().Text("Exit").Bold();
                    header.Cell().Element(CellStyle).AlignRight().Text("P/L").Bold();
                });

                // Rows
                foreach (var trade in data.Trades.OrderByDescending(t => t.EntryDate))
                {
                    table.Cell().Element(CellStyle).Text(trade.EntryDate.ToString("dd MMM"));
                    table.Cell().Element(CellStyle).Text(trade.Symbol);
                    table.Cell().Element(CellStyle).Text(trade.Direction);
                    table.Cell().Element(CellStyle).AlignRight().Text($"R {trade.EntryPrice:N2}");
                    table.Cell().Element(CellStyle).AlignRight().Text(trade.ExitPrice.HasValue ? $"R {trade.ExitPrice.Value:N2}" : "-");

                    var profitLoss = trade.Profit ?? (trade.Loss.HasValue ? -trade.Loss.Value : 0);
                    table.Cell().Element(CellStyle).AlignRight()
                        .Text($"R {profitLoss:N2}")
                        .FontColor(profitLoss >= 0 ? Colors.Green.Darken2 : Colors.Red.Darken2);
                }
            });
        });
    }

    private void ComposeFees(IContainer container, StatementDataDto data)
    {
        container.Column(column =>
        {
            column.Item().Text("Fees Breakdown").FontSize(14).Bold();
            column.Item().PaddingTop(10);

            column.Item().Table(table =>
            {
                table.ColumnsDefinition(columns =>
                {
                    columns.RelativeColumn(1);
                    columns.RelativeColumn(2);
                    columns.RelativeColumn(1);
                    columns.RelativeColumn(2);
                });

                // Header
                table.Header(header =>
                {
                    header.Cell().Element(CellStyle).Text("Date").Bold();
                    header.Cell().Element(CellStyle).Text("Type").Bold();
                    header.Cell().Element(CellStyle).AlignRight().Text("Amount").Bold();
                    header.Cell().Element(CellStyle).Text("Description").Bold();
                });

                // Rows
                foreach (var fee in data.Fees.OrderByDescending(f => f.Date))
                {
                    table.Cell().Element(CellStyle).Text(fee.Date.ToString("dd MMM yyyy"));
                    table.Cell().Element(CellStyle).Text(fee.Type);
                    table.Cell().Element(CellStyle).AlignRight().Text($"R {fee.Amount:N2}");
                    table.Cell().Element(CellStyle).Text(fee.Description ?? "-");
                }
            });
        });
    }

    private void ComposeFooter(IContainer container, StatementDataDto data)
    {
        container.AlignCenter().Column(column =>
        {
            column.Item().PaddingTop(10).LineHorizontal(1).LineColor(Colors.Grey.Lighten2);

            column.Item().PaddingTop(5).Text(text =>
            {
                text.Span("This statement is generated electronically and is valid without a signature. ").FontSize(8);
                text.Span("For queries, contact support@lemotick.com").FontSize(8).FontColor(Colors.Blue.Medium);
            });

            column.Item().Text("LemoTick © 2025. All rights reserved.").FontSize(8).FontColor(Colors.Grey.Darken1);
        });
    }

    private static IContainer CellStyle(IContainer container)
    {
        return container
            .BorderBottom(1)
            .BorderColor(Colors.Grey.Lighten2)
            .PaddingVertical(5);
    }
}

