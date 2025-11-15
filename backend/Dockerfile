# Use the official .NET 8 SDK image for building
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build

# Set the working directory
WORKDIR /src

# Copy the solution file
COPY *.sln .

# Copy project files
COPY API/InvestorManagementSystem.API.csproj API/
COPY Application/InvestorManagementSystem.Application.csproj Application/
COPY Core/InvestorManagementSystem.Core.csproj Core/
COPY Infrastructure/InvestorManagementSystem.Infrastructure.csproj Infrastructure/
COPY Services/InvestorManagementSystem.Services.csproj Services/
COPY BotIntegration/InvestorManagementSystem.BotIntegration.csproj BotIntegration/
COPY Tests/InvestorManagementSystem.Tests.csproj Tests/

# Restore dependencies
RUN dotnet restore

# Copy the rest of the source code
COPY . .

# Build the application
RUN dotnet build -c Release --no-restore

# Publish the application
RUN dotnet publish API/InvestorManagementSystem.API.csproj -c Release -o /app/publish --no-restore

# Use the official .NET 8 runtime image for running
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime

# Set the working directory
WORKDIR /app

# Install curl for health checks
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Copy the published application
COPY --from=build /app/publish .

# Create logs directory
RUN mkdir -p /app/logs

# Expose ports
EXPOSE 5000
EXPOSE 5001

# Set environment variables
ENV ASPNETCORE_ENVIRONMENT=Production
ENV ASPNETCORE_URLS=http://+:5000;https://+:5001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD curl -f http://localhost:5000/health || exit 1

# Run the application
ENTRYPOINT ["dotnet", "InvestorManagementSystem.API.dll"]
