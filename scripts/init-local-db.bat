@echo off
SETLOCAL
if "%1"=="" (set SERVER=localhost) else set SERVER=%1
if "%2"=="" (set PORT=1433) else set PORT=%2

echo Initializing local SQL Server database on %SERVER%,%PORT% using Windows authentication

echo Testing Windows Integrated Authentication...
sqlcmd -E -S %SERVER%,%PORT% -Q "SELECT 1" >nul 2>&1
if errorlevel 1 (
  echo Windows authentication failed. Make sure you are running this on the machine/account that has access to SQL Server.
  exit /b 1
)

echo Windows authentication available — running init scripts.

echo Running schema: db\init\01-schema.sql
sqlcmd -E -S %SERVER%,%PORT% -i db\init\01-schema.sql -b
if errorlevel 1 (
  echo sqlcmd failed running schema
  exit /b 1
)

echo Running seed: db\init\99-reset-and-seed.sql
sqlcmd -E -S %SERVER%,%PORT% -i db\init\99-reset-and-seed.sql -b
if errorlevel 1 (
  echo sqlcmd failed running seed
  exit /b 1
)

echo Database initialization complete. 'FlashGuard' should now exist on %SERVER%.
ENDLOCAL
