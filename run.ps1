<#
.SYNOPSIS
    Spatial Playback & Telemetry - Multi-Terminal Launcher
.DESCRIPTION
    Launches Backend (FastAPI on Port 8000) and Frontend (Vite React on Port 3000)
    in two dedicated, separate PowerShell terminal windows with zero policy errors.
#>

param(
    [switch]$RestartBackend
)

$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "   Spatial Playback & Telemetry - Multi-Terminal Runner " -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan

# ----------------------------------------------------
# 1. Backend Service (Port 8000)
# ----------------------------------------------------
$backendConn = Get-NetTCPConnection -LocalPort 8000 -ErrorAction SilentlyContinue | Select-Object -First 1

if ($backendConn -and -not $RestartBackend) {
    Write-Host "[OK] Backend is already running on http://127.0.0.1:8000 (PID: $($backendConn.OwningProcess))" -ForegroundColor Green
} else {
    if ($backendConn -and $RestartBackend) {
        Write-Host "[INFO] Stopping existing backend process (PID: $($backendConn.OwningProcess))..." -ForegroundColor Yellow
        Stop-Process -Id $backendConn.OwningProcess -Force -ErrorAction SilentlyContinue
        Start-Sleep -Seconds 1
    }

    Write-Host "[INFO] Opening dedicated terminal for Backend (Port 8000)..." -ForegroundColor Cyan
    $backendScript = @"
`$host.UI.RawUI.WindowTitle = 'Spatial Playback — Backend Server (Port 8000)'
Set-Location '$projectRoot\Backend'
Set-ExecutionPolicy -Scope Process -ExecutionPolicy RemoteSigned -Force

if (Test-Path '..\.venv\Scripts\Activate.ps1') {
    & '..\.venv\Scripts\Activate.ps1'
} elseif (Test-Path '.\venv\Scripts\Activate.ps1') {
    & '.\venv\Scripts\Activate.ps1'
}

Write-Host '===================================================' -ForegroundColor Green
Write-Host ' Starting FastAPI Backend on http://127.0.0.1:8000 ' -ForegroundColor Green
Write-Host ' Swagger UI: http://127.0.0.1:8000/docs            ' -ForegroundColor Green
Write-Host '===================================================' -ForegroundColor Green
python -m uvicorn app.main:app --reload
"@

    Start-Process powershell.exe -ArgumentList "-ExecutionPolicy", "Bypass", "-NoExit", "-Command", $backendScript
    Start-Sleep -Seconds 2
}

# ----------------------------------------------------
# 2. Frontend Service (Port 3000)
# ----------------------------------------------------
$frontendConn = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue | Select-Object -First 1

if ($frontendConn) {
    Write-Host "[OK] Frontend is already running on http://localhost:3000 (PID: $($frontendConn.OwningProcess))" -ForegroundColor Green
} else {
    Write-Host "[INFO] Opening dedicated terminal for Frontend (Port 3000)..." -ForegroundColor Cyan
    $frontendScript = @"
`$host.UI.RawUI.WindowTitle = 'Spatial Playback — Frontend Dev Server (Port 3000)'
Set-Location '$projectRoot\frontend'
Set-ExecutionPolicy -Scope Process -ExecutionPolicy RemoteSigned -Force

Write-Host '===================================================' -ForegroundColor Cyan
Write-Host ' Starting Vite Frontend Dev on http://localhost:3000' -ForegroundColor Cyan
Write-Host '===================================================' -ForegroundColor Cyan
npm.cmd run dev
"@

    Start-Process powershell.exe -ArgumentList "-ExecutionPolicy", "Bypass", "-NoExit", "-Command", $frontendScript
    Start-Sleep -Seconds 2
}

Write-Host ""
Write-Host "========================================================" -ForegroundColor Green
Write-Host " Services are running in separate terminal windows!     " -ForegroundColor Green
Write-Host "   Frontend Application : http://localhost:3000        " -ForegroundColor White
Write-Host "   Backend API          : http://127.0.0.1:8000         " -ForegroundColor White
Write-Host "   Interactive API Docs : http://127.0.0.1:8000/docs    " -ForegroundColor White
Write-Host "========================================================" -ForegroundColor Green
