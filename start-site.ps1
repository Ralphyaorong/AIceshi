$ProjectDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$CodexNode = Join-Path $env:LOCALAPPDATA "OpenAI\Codex\bin\node.exe"

Set-Location $ProjectDir

if (Test-Path $CodexNode) {
  Start-Process "http://127.0.0.1:8787"
  & $CodexNode "server.js"
  exit
}

$NodeCommand = Get-Command node -ErrorAction SilentlyContinue
if ($NodeCommand) {
  Start-Process "http://127.0.0.1:8787"
  & node "server.js"
  exit
}

Write-Host "Node.js was not found. Opening the static HTML version instead."
Write-Host "Some browser features, such as clipboard copy, may be limited in file mode."
Start-Process (Join-Path $ProjectDir "index.html")
