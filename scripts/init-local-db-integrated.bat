@echo off
SETLOCAL
if "%1"=="" (set SERVER=localhost) else set SERVER=%1
if "%2"=="" (set PORT=1433) else set PORT=%2

echo Initializing local SQL Server database using integrated auth on %SERVER%,%PORT%

echo Running schema: db\init\01-schema.sql
sqlcmd -C -E -S %SERVER%,%PORT% -i db\init\01-schema.sql -b
if errorlevel 1 (
  echo sqlcmd failed running schema with integrated auth
  exit /b 1
)

echo Running seed: db\init\99-reset-and-seed.sql
sqlcmd -C -E -S %SERVER%,%PORT% -i db\init\99-reset-and-seed.sql -b
if errorlevel 1 (
  echo sqlcmd failed running seed with integrated auth
  exit /b 1
)

echo Database initialization complete using integrated auth.
ENDLOCAL
