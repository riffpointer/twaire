$ErrorActionPreference = "Stop"

$RootDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$BackendDir = Join-Path $RootDir "twaire-backend"
$FrontendDir = Join-Path $RootDir "twaire-frontend"
$SetupDir = Join-Path $RootDir "scripts\setup"

function Write-Title([string]$Text) { Write-Host "`n[$Text]" -ForegroundColor Cyan }
function Write-Info([string]$Message) { Write-Host "  $Message" -ForegroundColor DarkGray }
function Write-Ok([string]$Message) { Write-Host "  $Message" -ForegroundColor Green }
function Write-Warn([string]$Message) { Write-Host "  $Message" -ForegroundColor Yellow }
function Write-Err([string]$Message) { Write-Host "  $Message" -ForegroundColor Red }

function Require-Path([string]$Path, [string]$Label) {
  if (-not (Test-Path $Path)) { throw "$Label not found: $Path" }
}

function Run-Process([string]$FilePath, [string[]]$ArgumentList, [string]$WorkingDirectory) {
  $p = Start-Process -FilePath $FilePath -ArgumentList $ArgumentList -WorkingDirectory $WorkingDirectory -PassThru -NoNewWindow -Wait
  if ($p.ExitCode -ne 0) { throw "$FilePath exited with code $($p.ExitCode)" }
}

function Open-ProcessWindow([string]$CommandLine) {
  Start-Process -FilePath "cmd.exe" -ArgumentList "/k", $CommandLine | Out-Null
}

function Show-Help {
  Write-Title "Twaire Manager"
  Write-Info "Arrow keys move, Enter selects, Esc exits."
  Write-Info "1. setup     - verify Node, install pnpm/deps, check MongoDB"
  Write-Info "2. install   - install project dependencies"
  Write-Info "3. update    - update project dependencies"
  Write-Info "4. start     - launch backend and frontend"
  Write-Info "5. backend   - launch backend only"
  Write-Info "6. frontend  - launch frontend only"
  Write-Info "7. check     - check Node, pnpm, MongoDB"
  Write-Info "8. status    - show local project status"
  Write-Info "9. reset     - reset user data and clear the database"
  Write-Info "0. exit      - keep the window open until you exit"
  Write-Host ""
  Write-Info "Examples:"
  Write-Info "  .\manager.ps1 setup"
  Write-Info "  .\manager.ps1 start"
  Write-Info "  .\manager.ps1 update"
}

function Invoke-Setup {
  Write-Title "Setup"
  $script = Join-Path $SetupDir "setup.ps1"
  Require-Path $script "Setup script"
  & powershell -NoProfile -ExecutionPolicy Bypass -File $script
}

function Invoke-Install([switch]$Update) {
  Require-Path $BackendDir "Backend"
  Require-Path $FrontendDir "Frontend"
  $mode = if ($Update) { "Updating" } else { "Installing" }
  Write-Title $mode
  Write-Info "Backend"
  Push-Location $BackendDir
  if ($Update) { pnpm update } else { pnpm install }
  Pop-Location
  Write-Info "Frontend"
  Push-Location $FrontendDir
  if ($Update) { pnpm update } else { pnpm install }
  Pop-Location
  Write-Ok "Done"
}

function Invoke-Check {
  Write-Title "Environment"
  if (Get-Command node -ErrorAction SilentlyContinue) { Write-Ok "Node: $(node -p "process.versions.node")" } else { Write-Err "Node: not found" }
  if (Get-Command pnpm -ErrorAction SilentlyContinue) { Write-Ok "pnpm: $(pnpm -v)" } else { Write-Warn "pnpm: not found" }
  if (Get-Command mongod -ErrorAction SilentlyContinue) { Write-Ok "MongoDB: mongod found" } else { Write-Warn "MongoDB: mongod not found on PATH" }
}

function Invoke-StartBackend {
  Require-Path $BackendDir "Backend"
  Write-Title "Backend"
  Open-ProcessWindow "cd /d `"$BackendDir`" && pnpm run dev"
  Write-Ok "Backend window launched"
}

function Invoke-StartFrontend {
  Require-Path $FrontendDir "Frontend"
  Write-Title "Frontend"
  Open-ProcessWindow "cd /d `"$FrontendDir`" && pnpm run dev"
  Write-Ok "Frontend window launched"
}

function Invoke-Start {
  Invoke-StartBackend
  Invoke-StartFrontend
  Write-Info "Open the URLs printed by each server."
}

function Invoke-Status {
  Write-Title "Project Status"
  Write-Info "Root: $RootDir"
  Write-Info "Backend: twaire-backend"
  Write-Info "Frontend: twaire-frontend"
  Invoke-Check
}

function Invoke-ResetData {
  Write-Title "Reset Data"
  Write-Warn "This will delete all database records and local user uploads/data."
  $confirm = Read-Host "Type RESET to continue"
  if ($confirm -ne "RESET") {
    Write-Info "Reset cancelled"
    return
  }

  $script = Join-Path $BackendDir "scripts\reset-database.js"
  Require-Path $script "Reset script"
  Write-Info "Clearing database and local data..."
  Push-Location $BackendDir
  try {
    node $script
    Write-Ok "Reset complete"
  } finally {
    Pop-Location
  }
}

function Invoke-Menu {
  $items = @(
    @{ Label = "Setup"; Action = { Invoke-Setup } },
    @{ Label = "Install dependencies"; Action = { Invoke-Install } },
    @{ Label = "Update dependencies"; Action = { Invoke-Install -Update } },
    @{ Label = "Start backend + frontend"; Action = { Invoke-Start } },
    @{ Label = "Start backend only"; Action = { Invoke-StartBackend } },
    @{ Label = "Start frontend only"; Action = { Invoke-StartFrontend } },
    @{ Label = "Check environment"; Action = { Invoke-Check } },
    @{ Label = "Show status"; Action = { Invoke-Status } },
    @{ Label = "Reset user data and database"; Action = { Invoke-ResetData } },
    @{ Label = "Exit"; Action = { return "exit" } }
  )

  $selected = 0
  while ($true) {
    Clear-Host
    Write-Title "Twaire Manager"
    Write-Info "Use Up/Down or 1-0, Enter to run, Esc to exit."
    Write-Host ""

    for ($i = 0; $i -lt $items.Count; $i++) {
      $prefix = if ($i -eq $selected) { ">" } else { " " }
      $color = if ($i -eq $selected) { "Cyan" } else { "Gray" }
      Write-Host (" {0} {1}. {2}" -f $prefix, ($i + 1), $items[$i].Label) -ForegroundColor $color
    }

    $key = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    switch ($key.VirtualKeyCode) {
      38 { if ($selected -gt 0) { $selected-- } }
      40 { if ($selected -lt ($items.Count - 1)) { $selected++ } }
      27 { return }
      13 {
        $result = & $items[$selected].Action
        if ($result -eq "exit") { return }
        Write-Host ""
        Write-Host "Press any key to return to the menu..." -ForegroundColor DarkGray
        $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown") | Out-Null
      }
      49 { $selected = 0; & $items[$selected].Action | Out-Null }
      50 { $selected = 1; & $items[$selected].Action | Out-Null }
      51 { $selected = 2; & $items[$selected].Action | Out-Null }
      52 { $selected = 3; & $items[$selected].Action | Out-Null }
      53 { $selected = 4; & $items[$selected].Action | Out-Null }
      54 { $selected = 5; & $items[$selected].Action | Out-Null }
      55 { $selected = 6; & $items[$selected].Action | Out-Null }
      56 { $selected = 7; & $items[$selected].Action | Out-Null }
      57 { $selected = 8; & $items[$selected].Action | Out-Null }
      48 { $selected = 9; & $items[$selected].Action | Out-Null }
    }
  }
}

function Invoke-CommandMode([string]$Command) {
  switch ($Command.ToLowerInvariant()) {
    "setup" { Invoke-Setup }
    "install" { Invoke-Install }
    "update" { Invoke-Install -Update }
    "start" { Invoke-Start }
    "backend" { Invoke-StartBackend }
    "frontend" { Invoke-StartFrontend }
    "check" { Invoke-Check }
    "status" { Invoke-Status }
    "reset" { Invoke-ResetData }
    "help" { Show-Help }
    "-h" { Show-Help }
    "--help" { Show-Help }
    default {
      Write-Warn "Unknown command: $Command"
      Show-Help
      exit 1
    }
  }
}

try {
  if ($args.Count -gt 0) {
    Invoke-CommandMode $args[0]
  } else {
    Invoke-Menu
  }
}
catch {
  Write-Err $_.Exception.Message
  Write-Host "Press Enter to close..." -ForegroundColor DarkGray
  [void][System.Console]::ReadLine()
  exit 1
}
