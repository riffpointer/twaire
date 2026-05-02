$ErrorActionPreference = "Stop"

$RootDir = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$BackendDir = Join-Path $RootDir "twaire-backend"
$FrontendDir = Join-Path $RootDir "twaire-frontend"

function Write-Info([string]$Message) { Write-Host "`n[setup] $Message" -ForegroundColor Cyan }
function Write-Warn([string]$Message) { Write-Host "`n[setup] WARNING: $Message" -ForegroundColor Yellow }
function Write-Success([string]$Message) { Write-Host "`n[setup] $Message" -ForegroundColor Green }
function Fail([string]$Message) { Write-Host "`n[setup] ERROR: $Message" -ForegroundColor Red; throw "[setup] ERROR" }

function Require-Command([string]$Name) {
  if (-not (Get-Command $Name -ErrorAction SilentlyContinue)) { Fail "Missing required command: $Name" }
}

function Ensure-Node {
  Require-Command node
  $Current = node -p "process.versions.node"
  if (([version]$Current).CompareTo([version]"20.19.0") -lt 0) { Fail "Node.js $Current is installed, but 20.19.0 or newer is required." }
  Write-Info "Node.js $Current detected"
}

function Ensure-Pnpm {
  if (Get-Command pnpm -ErrorAction SilentlyContinue) { Write-Info "pnpm detected: $(pnpm -v)"; return }
  if (Get-Command corepack -ErrorAction SilentlyContinue) { Write-Info "pnpm not found, enabling it through corepack"; corepack enable | Out-Null; corepack prepare pnpm@latest --activate | Out-Null }
  else { Write-Info "pnpm not found, installing globally with npm"; npm install -g pnpm }
  Require-Command pnpm
  Write-Info "pnpm detected: $(pnpm -v)"
}

function Ensure-MongoDB {
  if (Get-Command mongod -ErrorAction SilentlyContinue) { Write-Info "mongod detected: $(& mongod --version | Select-Object -First 1)"; return }
  $Service = Get-Service -Name "MongoDB" -ErrorAction SilentlyContinue
  if ($Service) {
    if ($Service.Status -ne "Running") { Write-Info "Starting MongoDB Windows service"; Start-Service -Name "MongoDB" }
    Write-Info "MongoDB Windows service is available"; return
  }
  Write-Warn "mongod is not installed. Install MongoDB Server or run it as a Windows service, then re-run this script."
}

function Install-Dependencies {
  Write-Info "Installing backend dependencies"; Push-Location $BackendDir; pnpm install; Pop-Location
  Write-Info "Installing frontend dependencies"; Push-Location $FrontendDir; pnpm install; Pop-Location
}

function Print-Next-Steps {
  Write-Success "Setup checks completed."
  Write-Host ""
  Write-Host "[setup] Next:" -ForegroundColor Cyan
  Write-Host "  - Start MongoDB if it is not already running"
  Write-Host "  - Run backend:  cd twaire-backend; pnpm run dev"
  Write-Host "  - Run frontend: cd twaire-frontend; pnpm run dev"
}

Ensure-Node
Ensure-Pnpm
Ensure-MongoDB
Install-Dependencies
Print-Next-Steps
