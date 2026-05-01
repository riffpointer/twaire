# scripts/setup.ps1

Write-Host "Twaire Setup Script" -ForegroundColor Cyan

function Check-Command($cmd, $name) {
    $command = Get-Command $cmd -ErrorAction SilentlyContinue
    if ($null -eq $command) {
        Write-Host "[!] $name not found ($cmd)" -ForegroundColor Red
        return $false
    }
    Write-Host "[v] $name found" -ForegroundColor Green
    return $true
}

$allChecksPassed = $true

# Check Node.js
if (!(Check-Command "node" "Node.js")) {
    Write-Host "    Please install Node.js from https://nodejs.org/"
    $allChecksPassed = $false
} else {
    $nodeVersion = node -v
    Write-Host "    Version: $nodeVersion"
}

# Check pnpm
if (!(Check-Command "pnpm" "pnpm")) {
    Write-Host "    Please install pnpm: npm install -g pnpm"
    $allChecksPassed = $false
}

# Check MongoDB
if (!(Check-Command "mongod" "MongoDB")) {
    Write-Host "    Please install MongoDB from https://www.mongodb.com/try/download/community"
    Write-Host "    Ensure 'mongod' is in your PATH."
    $allChecksPassed = $false
}

if (-not $allChecksPassed) {
    Write-Host "`n[!] Some environment checks failed. Please resolve them before proceeding." -ForegroundColor Yellow
    exit 1
}

Write-Host "`n[i] Environment checks passed. Installing dependencies..." -ForegroundColor Cyan

# Backend
Write-Host "`n[i] Installing Backend dependencies..." -ForegroundColor Cyan
Set-Location "$PSScriptRoot\..\twaire-backend"
pnpm install

# Frontend
Write-Host "`n[i] Installing Frontend dependencies..." -ForegroundColor Cyan
Set-Location "$PSScriptRoot\..\twaire-frontend"
pnpm install

Write-Host "`n[v] Setup completed successfully!" -ForegroundColor Green
Set-Location $PSScriptRoot\..
