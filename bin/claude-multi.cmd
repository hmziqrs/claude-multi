@echo off
setlocal
:: Resolve package root (bin\ -> ..\)
set "_cli=%~dp0..\dist\cli.js"

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

where deno >nul 2>&1
if not errorlevel 1 (
  deno run -A "%_cli%" %*
  exit /b %errorlevel%
)

echo claude-multi: no JavaScript runtime found (install bun, node, or deno) 1>&2
exit /b 1
endlocal
