@echo off
setlocal
set "_cli=%~dp0..\build\cli.js"

where bun >nul 2>&1
if not errorlevel 1 (
  bun "%_cli%" %*
  exit /b %errorlevel%
)

where node >nul 2>&1
if not errorlevel 1 (
  node "%_cli%" %*
  exit /b %errorlevel%
)

echo claude-multi: no JavaScript runtime found (install bun or node 22+) 1>&2
exit /b 1
endlocal
