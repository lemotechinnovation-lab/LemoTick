# ==============================================================
# LemoTick Azure Windows Server VM Setup Script
# Configures Windows Server for native deployment (NO DOCKER)
# Run this script on the Azure Windows Server VM as Administrator
# ==============================================================

param(
    [switch]$InstallIIS,
    [switch]$InstallNode,
    [switch]$InstallDotNet,
    [switch]$InstallPython,
    [switch]$InstallNSSM,
    [switch]$InstallPostgreSQL,
    [switch]$ConfigureFirewall,
    [switch]$All
)

$ErrorActionPreference = "Stop"

function Write-Step {
    param([string]$Message)
    Write-Host "`n==> $Message" -ForegroundColor Cyan
}

function Write-Success {
    param([string]$Message)
    Write-Host "OK $Message" -ForegroundColor Green
}

function Write-ErrorMsg {
    param([string]$Message)
    Write-Host "ERROR $Message" -ForegroundColor Red
}

if (-NOT ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
    Write-ErrorMsg "This script must be run as Administrator"
    exit 1
}

# ==============================================================
# Install and Configure IIS + ASP.NET Core Hosting Bundle
# ==============================================================
function Install-IISServer {
    Write-Step "Installing IIS and ASP.NET Core Hosting Bundle..."
    
    # Install IIS with common features
    Install-WindowsFeature -Name Web-Server -IncludeManagementTools
    Install-WindowsFeature -Name Web-Asp-Net45
    Install-WindowsFeature -Name Web-ISAPI-Ext
    Install-WindowsFeature -Name Web-ISAPI-Filter
    
    # Install ASP.NET Core Hosting Bundle
    Write-Host "Downloading ASP.NET Core Hosting Bundle..."
    $hostingBundle = "$env:TEMP\dotnet-hosting-bundle.exe"
    Invoke-WebRequest -Uri "https://download.visualstudio.microsoft.com/download/pr/751d3fcd-72db-4da2-b8d0-709c19442225/33cc492bde704bfd6d70a2b9109005a0/dotnet-hosting-8.0.1-win.exe" -OutFile $hostingBundle
    
    Write-Host "Installing ASP.NET Core Hosting Bundle..."
    Start-Process -FilePath $hostingBundle -ArgumentList "/quiet /norestart" -Wait
    Remove-Item $hostingBundle -Force
    
    # Restart IIS to load the module
    Write-Host "Restarting IIS..."
    Stop-Service W3SVC -Force
    Start-Service W3SVC
    
    # Create web directories for dashboard
    $webDirs = @(
        "C:\inetpub\wwwroot\lemotick-prod",
        "C:\inetpub\wwwroot\lemotick-qa",
        "C:\inetpub\wwwroot\lemotick-dev",
        "C:\inetpub\wwwroot\lemotick-backend-prod",
        "C:\inetpub\wwwroot\lemotick-backend-qa",
        "C:\inetpub\wwwroot\lemotick-backend-dev"
    )
    
    foreach ($dir in $webDirs) {
        if (-not (Test-Path $dir)) {
            New-Item -ItemType Directory -Path $dir -Force | Out-Null
            Write-Success "Created directory: $dir"
        }
    }
    
    Import-Module WebAdministration
    
    # Stop default website
    Stop-Website -Name "Default Web Site" -ErrorAction SilentlyContinue
    
    Write-Success "IIS and ASP.NET Core Hosting Bundle installed successfully"
}

# ==============================================================
# Install Node.js
# ==============================================================
function Install-NodeJS {
    Write-Step "Installing Node.js..."
    
    if (Get-Command node -ErrorAction SilentlyContinue) {
        Write-Success "Node.js is already installed"
        node --version
        npm --version
        return
    }
    
    $nodeVersion = "20.11.0"
    $nodeInstaller = "$env:TEMP\node-v$nodeVersion-x64.msi"
    
    Write-Host "Downloading Node.js..."
    Invoke-WebRequest -Uri "https://nodejs.org/dist/v$nodeVersion/node-v$nodeVersion-x64.msi" -OutFile $nodeInstaller
    
    Write-Host "Installing Node.js..."
    Start-Process msiexec.exe -ArgumentList "/i `"$nodeInstaller`" /quiet /norestart" -Wait
    Remove-Item $nodeInstaller -Force
    
    $machinePath = [System.Environment]::GetEnvironmentVariable("Path","Machine")
    $userPath = [System.Environment]::GetEnvironmentVariable("Path","User")
    $env:Path = $machinePath + ";" + $userPath
    
    Write-Success "Node.js installed successfully"
}

# ==============================================================
# Install .NET 8 SDK
# ==============================================================
function Install-DotNetSDK {
    Write-Step "Installing .NET 8 SDK..."
    
    if (Get-Command dotnet -ErrorAction SilentlyContinue) {
        Write-Success ".NET SDK is already installed"
        dotnet --version
        return
    }
    
    $dotnetInstaller = "$env:TEMP\dotnet-sdk-installer.exe"
    
    Write-Host "Downloading .NET 8 SDK..."
    Invoke-WebRequest -Uri "https://download.visualstudio.microsoft.com/download/pr/93961dfb-d1e0-49c8-9230-abcba1ebab5a/811ed1eb63d7652325727720edda26a8/dotnet-sdk-8.0.101-win-x64.exe" -OutFile $dotnetInstaller
    
    Write-Host "Installing .NET 8 SDK..."
    Start-Process -FilePath $dotnetInstaller -ArgumentList "/quiet /norestart" -Wait
    Remove-Item $dotnetInstaller -Force
    
    $machinePath = [System.Environment]::GetEnvironmentVariable("Path","Machine")
    $userPath = [System.Environment]::GetEnvironmentVariable("Path","User")
    $env:Path = $machinePath + ";" + $userPath
    
    Write-Success ".NET 8 SDK installed successfully"
}

# ==============================================================
# Install Python
# ==============================================================
function Install-PythonRuntime {
    Write-Step "Installing Python..."
    
    if (Get-Command python -ErrorAction SilentlyContinue) {
        Write-Success "Python is already installed"
        python --version
        return
    }
    
    $pythonVersion = "3.11.7"
    $pythonInstaller = "$env:TEMP\python-$pythonVersion-amd64.exe"
    
    Write-Host "Downloading Python..."
    Invoke-WebRequest -Uri "https://www.python.org/ftp/python/$pythonVersion/python-$pythonVersion-amd64.exe" -OutFile $pythonInstaller
    
    Write-Host "Installing Python..."
    Start-Process -FilePath $pythonInstaller -ArgumentList "/quiet InstallAllUsers=1 PrependPath=1" -Wait
    Remove-Item $pythonInstaller -Force
    
    $machinePath = [System.Environment]::GetEnvironmentVariable("Path","Machine")
    $userPath = [System.Environment]::GetEnvironmentVariable("Path","User")
    $env:Path = $machinePath + ";" + $userPath
    
    Write-Success "Python installed successfully"
}

# ==============================================================
# Install NSSM (Non-Sucking Service Manager)
# ==============================================================
function Install-NSSMTool {
    Write-Step "Installing NSSM (for Windows Services)..."
    
    $nssmPath = "C:\nssm\nssm.exe"
    if (Test-Path $nssmPath) {
        Write-Success "NSSM is already installed"
        return
    }
    
    Write-Host "Downloading NSSM..."
    $nssmZip = "$env:TEMP\nssm.zip"
    Invoke-WebRequest -Uri "https://nssm.cc/release/nssm-2.24.zip" -OutFile $nssmZip
    
    Write-Host "Extracting NSSM..."
    Expand-Archive -Path $nssmZip -DestinationPath "$env:TEMP\nssm" -Force
    New-Item -ItemType Directory -Path "C:\nssm" -Force | Out-Null
    Copy-Item -Path "$env:TEMP\nssm\nssm-2.24\win64\nssm.exe" -Destination $nssmPath -Force
    
    Remove-Item $nssmZip -Force
    Remove-Item "$env:TEMP\nssm" -Recurse -Force
    
    # Add to PATH
    $currentPath = [System.Environment]::GetEnvironmentVariable("Path","Machine")
    if ($currentPath -notlike "*C:\nssm*") {
        [System.Environment]::SetEnvironmentVariable("Path", $currentPath + ";C:\nssm", "Machine")
    }
    
    Write-Success "NSSM installed successfully"
}

# ==============================================================
# Install PostgreSQL
# ==============================================================
function Install-PostgreSQLServer {
    Write-Step "Installing PostgreSQL..."
    
    # Check if PostgreSQL is already installed
    $pgService = Get-Service -Name "postgresql*" -ErrorAction SilentlyContinue
    if ($pgService) {
        Write-Success "PostgreSQL is already installed"
        return
    }
    
    $postgresVersion = "16.1-1"
    $postgresInstaller = "$env:TEMP\postgresql-installer.exe"
    
    Write-Host "Downloading PostgreSQL $postgresVersion..."
    Invoke-WebRequest -Uri "https://get.enterprisedb.com/postgresql/postgresql-16.1-1-windows-x64.exe" -OutFile $postgresInstaller
    
    Write-Host "Installing PostgreSQL (this may take several minutes)..."
    Write-Host "Default password will be set to: postgres123 (CHANGE THIS AFTER INSTALLATION!)"
    
    # Silent install with default settings
    $installArgs = @(
        "--mode", "unattended",
        "--unattendedmodeui", "minimal",
        "--superpassword", "postgres123",
        "--servicename", "postgresql-16",
        "--serviceaccount", "NT AUTHORITY\NetworkService",
        "--serverport", "5432",
        "--locale", "en_US",
        "--enable-components", "server,commandlinetools"
    )
    
    Start-Process -FilePath $postgresInstaller -ArgumentList $installArgs -Wait -NoNewWindow
    Remove-Item $postgresInstaller -Force
    
    # Add PostgreSQL to PATH
    $pgPath = "C:\Program Files\PostgreSQL\16\bin"
    $currentPath = [System.Environment]::GetEnvironmentVariable("Path","Machine")
    if ($currentPath -notlike "*PostgreSQL*") {
        [System.Environment]::SetEnvironmentVariable("Path", $currentPath + ";$pgPath", "Machine")
    }
    
    # Refresh PATH for current session
    $machinePath = [System.Environment]::GetEnvironmentVariable("Path","Machine")
    $userPath = [System.Environment]::GetEnvironmentVariable("Path","User")
    $env:Path = $machinePath + ";" + $userPath
    
    Write-Success "PostgreSQL installed successfully"
    Write-Host ""
    Write-Host "IMPORTANT: Default postgres password is 'postgres123'" -ForegroundColor Yellow
    Write-Host "Change it immediately by running:" -ForegroundColor Yellow
    Write-Host "  psql -U postgres -c `"ALTER USER postgres PASSWORD 'your-secure-password';`"" -ForegroundColor Cyan
    Write-Host ""
}

# ==============================================================
# Configure Windows Firewall
# ==============================================================
function Configure-WindowsFirewall {
    Write-Step "Configuring Windows Firewall..."
    
    $ports = @(
        @{Name="LemoTick-HTTP"; Port=80; Protocol="TCP"},
        @{Name="LemoTick-Dev-Dashboard"; Port=8080; Protocol="TCP"},
        @{Name="LemoTick-QA-Dashboard"; Port=8090; Protocol="TCP"},
        @{Name="LemoTick-Backend-Prod"; Port=5000; Protocol="TCP"},
        @{Name="LemoTick-Backend-Dev"; Port=5001; Protocol="TCP"},
        @{Name="LemoTick-Backend-QA"; Port=5002; Protocol="TCP"},
        @{Name="PostgreSQL"; Port=5432; Protocol="TCP"}
    )
    
    foreach ($portRule in $ports) {
        $existingRule = Get-NetFirewallRule -DisplayName $portRule.Name -ErrorAction SilentlyContinue
        
        if ($existingRule) {
            Write-Host "Firewall rule already exists: $($portRule.Name)"
        } else {
            New-NetFirewallRule -DisplayName $portRule.Name -Direction Inbound -Protocol $portRule.Protocol -LocalPort $portRule.Port -Action Allow | Out-Null
            Write-Success "Created firewall rule: $($portRule.Name) (port $($portRule.Port))"
        }
    }
    
    Write-Success "Firewall configured successfully"
}

# ==============================================================
# Create log and app directories
# ==============================================================
function Create-Directories {
    Write-Step "Creating application directories..."
    
    $dirs = @(
        "C:\lemotick-logs\bot-prod",
        "C:\lemotick-logs\bot-qa",
        "C:\lemotick-logs\bot-dev",
        "C:\LemoTick\Bot\Prod",
        "C:\LemoTick\Bot\QA",
        "C:\LemoTick\Bot\Dev"
    )
    
    foreach ($dir in $dirs) {
        if (-not (Test-Path $dir)) {
            New-Item -ItemType Directory -Path $dir -Force | Out-Null
            Write-Success "Created directory: $dir"
        }
    }
}

# ==============================================================
# Main execution
# ==============================================================

Write-Host "LemoTick Azure Windows Server Setup Script (Native Deployment)" -ForegroundColor Yellow
Write-Host "No Docker required - using IIS and Windows Services" -ForegroundColor Yellow

if ($All) {
    $InstallIIS = $true
    $InstallNode = $true
    $InstallDotNet = $true
    $InstallPython = $true
    $InstallNSSM = $true
    $InstallPostgreSQL = $true
    $ConfigureFirewall = $true
}

if ($InstallIIS) { Install-IISServer }
if ($InstallNode) { Install-NodeJS }
if ($InstallDotNet) { Install-DotNetSDK }
if ($InstallPython) { Install-PythonRuntime }
if ($InstallNSSM) { Install-NSSMTool }
if ($InstallPostgreSQL) { Install-PostgreSQLServer }
if ($ConfigureFirewall) { Configure-WindowsFirewall }

Create-Directories

Write-Host "`nSetup completed successfully!" -ForegroundColor Green
Write-Host @"

Next steps:
1. If PostgreSQL was installed, change the default password:
   psql -U postgres -c "ALTER USER postgres PASSWORD 'your-secure-password';"
2. Create databases for your environments:
   psql -U postgres -c "CREATE DATABASE lemotick_dev;"
   psql -U postgres -c "CREATE DATABASE lemotick_qa;"
   psql -U postgres -c "CREATE DATABASE lemotick_prod;"
3. Install Azure DevOps self-hosted agent:
   - Download from: https://dev.azure.com/YOUR_ORG/_settings/agentpools
   - Configure agent name as: lemotick-vm
   - Run agent as Windows service
4. Set up variable groups in Azure DevOps:
   - lemotick-dev
   - lemotick-qa
   - lemotick-prod
5. Configure Azure NSG to allow inbound traffic on ports: 80, 5000-5002, 8080, 8090

For more information, see: azure-pipelines/DEPLOYMENT_GUIDE.md
"@ -ForegroundColor Cyan
