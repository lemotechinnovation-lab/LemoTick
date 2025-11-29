namespace InvestorManagementSystem.Application.Interfaces;

/// <summary>
/// Interface for file storage operations
/// </summary>
public interface IFileStorageService
{
    /// <summary>
    /// Upload a file and return its URL/path
    /// </summary>
    Task<string> UploadFileAsync(Stream fileStream, string fileName, string contentType, string folder = "");

    /// <summary>
    /// Download a file as stream
    /// </summary>
    Task<Stream> DownloadFileAsync(string fileUrl);

    /// <summary>
    /// Delete a file
    /// </summary>
    Task DeleteFileAsync(string fileUrl);

    /// <summary>
    /// Check if file exists
    /// </summary>
    Task<bool> FileExistsAsync(string fileUrl);

    /// <summary>
    /// Get file size in bytes
    /// </summary>
    Task<long> GetFileSizeAsync(string fileUrl);

    /// <summary>
    /// Generate a pre-signed URL for temporary access (for cloud providers)
    /// </summary>
    Task<string> GetPresignedUrlAsync(string fileUrl, TimeSpan expiration);
}

