using System.Text;
using System.Globalization;

namespace InvestorManagementSystem.Application.Services;

/// <summary>
/// Service for exporting data to CSV format
/// </summary>
public class CsvExportService
{
    /// <summary>
    /// Export trades to CSV format
    /// </summary>
    public byte[] ExportTradesToCsv<T>(IEnumerable<T> trades)
    {
        var csv = new StringBuilder();
        var properties = typeof(T).GetProperties();

        // Header row
        csv.AppendLine(string.Join(",", properties.Select(p => EscapeCsvField(p.Name))));

        // Data rows
        foreach (var trade in trades)
        {
            var values = properties.Select(p =>
            {
                var value = p.GetValue(trade);
                return EscapeCsvField(value?.ToString() ?? string.Empty);
            });
            csv.AppendLine(string.Join(",", values));
        }

        return Encoding.UTF8.GetBytes(csv.ToString());
    }

    /// <summary>
    /// Escape CSV field to handle commas, quotes, and newlines
    /// </summary>
    private string EscapeCsvField(string field)
    {
        if (string.IsNullOrEmpty(field))
            return field;

        // If field contains comma, quote, or newline, wrap it in quotes
        if (field.Contains(',') || field.Contains('"') || field.Contains('\n') || field.Contains('\r'))
        {
            // Escape existing quotes by doubling them
            field = field.Replace("\"", "\"\"");
            return $"\"{field}\"";
        }

        return field;
    }
}

