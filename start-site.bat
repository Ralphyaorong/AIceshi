@echo off
setlocal

set "PROJECT_DIR=%~dp0"
set "CODEX_NODE=%LOCALAPPDATA%\OpenAI\Codex\bin\node.exe"

cd /d "%PROJECT_DIR%"

if exist "%CODEX_NODE%" (
  start "" "http://127.0.0.1:8787"
  "%CODEX_NODE%" server.js
  exit /b
)

where node >nul 2>nul
if %errorlevel%==0 (
  start "" "http://127.0.0.1:8787"
  node server.js
  exit /b
)

echo Node.js was not found. Opening the static HTML version instead.
echo Some browser features, such as clipboard copy, may be limited in file mode.
start "" "%PROJECT_DIR%index.html"
pause
