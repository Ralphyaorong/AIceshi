$ErrorActionPreference = "Stop"

$ProjectDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$Node = Join-Path $env:LOCALAPPDATA "OpenAI\Codex\bin\node.exe"
$Cloudflared = Join-Path $ProjectDir "cloudflared.exe"
$ServerOut = Join-Path $ProjectDir "server-live.out.log"
$ServerErr = Join-Path $ProjectDir "server-live.err.log"
$TunnelOut = Join-Path $ProjectDir "cloudflared-live.out.log"
$TunnelErr = Join-Path $ProjectDir "cloudflared-live.err.log"

Set-Location $ProjectDir

if (!(Test-Path $Node)) {
  $NodeCommand = Get-Command node -ErrorAction SilentlyContinue
  if (!$NodeCommand) {
    throw "Node.js was not found. Install Node.js or run inside Codex where bundled Node exists."
  }
  $Node = $NodeCommand.Source
}

if (!(Test-Path $Cloudflared)) {
  Write-Host "Downloading Cloudflare tunnel..."
  curl.exe -L --retry 5 --retry-delay 2 -o $Cloudflared "https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe"
}

Get-Process node,cloudflared -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Remove-Item -LiteralPath $ServerOut,$ServerErr,$TunnelOut,$TunnelErr -Force -ErrorAction SilentlyContinue

$server = Start-Process -WindowStyle Hidden -FilePath $Node -ArgumentList "server.js" -WorkingDirectory $ProjectDir -RedirectStandardOutput $ServerOut -RedirectStandardError $ServerErr -PassThru
Start-Sleep -Seconds 2

$health = Invoke-WebRequest -Uri "http://127.0.0.1:8787/health" -UseBasicParsing | Select-Object -ExpandProperty Content
Write-Host "Local server is running. Health: $health"

$tunnel = Start-Process -WindowStyle Hidden -FilePath $Cloudflared -ArgumentList "tunnel","--no-autoupdate","--url","http://127.0.0.1:8787" -WorkingDirectory $ProjectDir -RedirectStandardOutput $TunnelOut -RedirectStandardError $TunnelErr -PassThru

$url = $null
for ($i = 0; $i -lt 60; $i++) {
  Start-Sleep -Seconds 1
  $log = ""
  if (Test-Path $TunnelOut) { $log += Get-Content $TunnelOut -Raw -ErrorAction SilentlyContinue }
  if (Test-Path $TunnelErr) { $log += Get-Content $TunnelErr -Raw -ErrorAction SilentlyContinue }
  $match = [regex]::Match($log, "https://[a-zA-Z0-9-]+\.trycloudflare\.com")
  if ($match.Success) {
    $url = $match.Value
    break
  }
}

if (!$url) {
  throw "Cloudflare tunnel started but URL was not found. Check cloudflared-live.out.log and cloudflared-live.err.log."
}

Write-Host ""
Write-Host "Public URL:"
Write-Host $url
Write-Host ""
Write-Host "Keep this computer running while sharing the URL."
Write-Host "Server PID: $($server.Id)"
Write-Host "Tunnel PID: $($tunnel.Id)"
