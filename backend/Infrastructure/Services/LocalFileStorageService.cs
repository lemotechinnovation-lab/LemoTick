using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using InvestorManagementSystem.Application.Interfaces;

namespace InvestorManagementSystem.Infrastructure.Services;

/// <summary>
/// Local file system storage implementation
/// </summary>
public class LocalFileStorageService : IFileStorageService
{
    private readonly string _basePath;
    private readonly ILogger<LocalFileStorageService> _logger;
    private readonly string _baseUrl;

    public LocalFileStorageService(
        IConfiguration configuration,
        ILogger<LocalFileStorageService> logger)
    {
        _logger = logger;

        // Get storage path from configuration or use default
        _basePath = configuration["FileStorage:LocalPath"] ?? Path.Combine(Directory.GetCurrentDirectory(), "uploads");
        _baseUrl = configuration["FileStorage:BaseUrl"] ?? "/files";

        // Ensure directory exists
        Directory.CreateDirectory(_basePath);

        _logger.LogInformation("LocalFileStorageService initialized with path: {Path}", _basePath);
    }

    public async Task<string> UploadFileAsync(Stream fileStream, string fileName, string contentType, string folder = "")
    {
        try
        {
            // Sanitize filename
            var sanitizedFileName = Path.GetFileName(fileName);
            var uniqueFileName = $"{Guid.NewGuid()}_{sanitizedFileName}";

            // Create folder structure
            var folderPath = string.IsNullOrEmpty(folder)
                ? _basePath
                : Path.Combine(_basePath, folder);

            Directory.CreateDirectory(folderPath);

            // Full file path
            var filePath = Path.Combine(folderPath, uniqueFileName);

            // Save file
            using (var fileStreamDest = new FileStream(filePath, FileMode.Create, FileAccess.Write))
            {
                await fileStream.CopyToAsync(fileStreamDest);
            }

            // Return relative URL
            var relativePath = string.IsNullOrEmpty(folder)
                ? uniqueFileName
                : Path.Combine(folder, uniqueFileName).Replace("\\", "/");

            var fileUrl = $"{_baseUrl}/{relativePath}";

            _logger.LogInformation("File uploaded successfully: {FileName} -> {FileUrl}", fileName, fileUrl);

            return fileUrl;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to upload file: {FileName}", fileName);
            throw;
        }
    }

    public async Task<Stream> DownloadFileAsync(string fileUrl)
    {
        try
        {
            var filePath = GetPhysicalPath(fileUrl);

            if (!File.Exists(filePath))
            {
                _logger.LogWarning("File not found: {FileUrl}", fileUrl);
                throw new FileNotFoundException($"File not found: {fileUrl}");
            }

            var memoryStream = new MemoryStream();
            using (var fileStream = new FileStream(filePath, FileMode.Open, FileAccess.Read))
            {
                await fileStream.CopyToAsync(memoryStream);
            }

            memoryStream.Position = 0;
            return memoryStream;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to download file: {FileUrl}", fileUrl);
            throw;
        }
    }

    public Task DeleteFileAsync(string fileUrl)
    {
        try
        {
            var filePath = GetPhysicalPath(fileUrl);

            if (File.Exists(filePath))
            {
                File.Delete(filePath);
                _logger.LogInformation("File deleted: {FileUrl}", fileUrl);
            }
            else
            {
                _logger.LogWarning("File not found for deletion: {FileUrl}", fileUrl);
            }

            return Task.CompletedTask;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to delete file: {FileUrl}", fileUrl);
            throw;
        }
    }

    public Task<bool> FileExistsAsync(string fileUrl)
    {
        try
        {
            var filePath = GetPhysicalPath(fileUrl);
            return Task.FromResult(File.Exists(filePath));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to check file existence: {FileUrl}", fileUrl);
            return Task.FromResult(false);
        }
    }

    public Task<long> GetFileSizeAsync(string fileUrl)
    {
        try
        {
            var filePath = GetPhysicalPath(fileUrl);

            if (!File.Exists(filePath))
            {
                throw new FileNotFoundException($"File not found: {fileUrl}");
            }

            var fileInfo = new FileInfo(filePath);
            return Task.FromResult(fileInfo.Length);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to get file size: {FileUrl}", fileUrl);
            throw;
        }
    }

    public Task<string> GetPresignedUrlAsync(string fileUrl, TimeSpan expiration)
    {
        // For local storage, we don't need pre-signed URLs
        // Just return the original URL
        // In Azure Blob/AWS S3 implementation, this would generate a temporary SAS token or pre-signed URL

        _logger.LogDebug("GetPresignedUrl called for local storage (returning original URL): {FileUrl}", fileUrl);
        return Task.FromResult(fileUrl);
    }

    private string GetPhysicalPath(string fileUrl)
    {
        // Remove base URL prefix
        var relativePath = fileUrl.StartsWith(_baseUrl)
            ? fileUrl.Substring(_baseUrl.Length).TrimStart('/')
            : fileUrl.TrimStart('/');

        // Convert to physical path
        var physicalPath = Path.Combine(_basePath, relativePath.Replace("/", Path.DirectorySeparatorChar.ToString()));

        // Security: Ensure path is within base directory
        var fullPath = Path.GetFullPath(physicalPath);
        var fullBasePath = Path.GetFullPath(_basePath);

        if (!fullPath.StartsWith(fullBasePath, StringComparison.OrdinalIgnoreCase))
        {
            throw new UnauthorizedAccessException("Access to path outside storage directory is not allowed");
        }

        return fullPath;
    }
}

