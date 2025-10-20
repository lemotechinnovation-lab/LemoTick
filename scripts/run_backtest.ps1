# PowerShell helper: create venv with Python launcher, install deps, run backtest
param(
    [string]$PythonLauncher = "py",
    [string]$VenvPath = ".venv",
    [string]$Requirements = "requirements.txt",
    [string]$Entry = "lemo_tick_backtest.py"
)

function Fail($msg) { Write-Error $msg; exit 1 }

# Resolve repo root (script can be run from anywhere)
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$RepoRoot = Resolve-Path (Join-Path $ScriptDir "..")
Set-Location $RepoRoot

# Detect Python launcher or python.exe
function Get-PythonCmd {
    param([string]$Preferred)
    $candidates = @($Preferred, "python")
    foreach ($c in $candidates) {
        try { & $c --version *> $null; if ($LASTEXITCODE -eq 0) { return $c } } catch {}
    }
    return $null
}

$pycmd = Get-PythonCmd -Preferred $PythonLauncher
if (-not $pycmd) { Fail "Python not found. Install Python 3.x and ensure it is on PATH or 'py' is available." }

Write-Host "Using Python command: $pycmd"

# Create venv if missing
if (-not (Test-Path $VenvPath)) {
    & $pycmd -m venv $VenvPath
    if ($LASTEXITCODE -ne 0) { Fail "Failed to create virtual environment" }
}

# Activate venv for this session
$activate = Join-Path $VenvPath "Scripts/Activate.ps1"
if (-not (Test-Path $activate)) { Fail "Activation script not found at $activate" }

Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass -Force | Out-Null
. $activate

# Upgrade pip and install requirements
python -m pip install --upgrade pip
if ($LASTEXITCODE -ne 0) { Fail "Failed to upgrade pip" }
if (Test-Path $Requirements) {
    python -m pip install -r $Requirements
    if ($LASTEXITCODE -ne 0) { Fail "Failed to install requirements" }
}
else {
    Write-Warning "Requirements file not found at $Requirements. Installing minimal deps."
    python -m pip install pandas numpy
}

# Run backtest
if (-not (Test-Path $Entry)) { Fail "Entry script not found: $Entry" }
python $Entry


