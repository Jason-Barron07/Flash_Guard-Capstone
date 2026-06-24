param([string]$Server="localhost",[string]$Port="1433")

Write-Host "Initializing local SQL Server database on $Server,$Port" -ForegroundColor Cyan

$files=@("db/init/01-schema.sql","db/init/99-reset-and-seed.sql")

if (Get-Command sqlcmd -ErrorAction SilentlyContinue) {
    & sqlcmd -E -S "$Server,$Port" -Q "SELECT 1" 1>$null 2>&1
    if ($LASTEXITCODE -ne 0) { Write-Error "Windows authentication failed when using sqlcmd."; exit $LASTEXITCODE }
    $runner='sqlcmd'
} else {
    if (-not (Get-Command Invoke-Sqlcmd -ErrorAction SilentlyContinue)) {
        Install-Module -Name SqlServer -Scope CurrentUser -Force -AllowClobber -ErrorAction Stop
    }
    if (-not (Get-Command Invoke-Sqlcmd -ErrorAction SilentlyContinue)) { Write-Error "No SQL client available (sqlcmd or Invoke-Sqlcmd)."; exit 1 }
    try { Invoke-Sqlcmd -ServerInstance "$Server,$Port" -Query "SELECT 1" -ErrorAction Stop 1>$null } catch { Write-Error "Windows authentication failed when using Invoke-Sqlcmd."; exit 2 }
    $runner='invoke'
}

foreach ($f in $files) {
    if (-not (Test-Path $f)) { Write-Error "SQL file not found: $f"; exit 1 }
    Write-Host "Running: $f" -ForegroundColor Yellow
    if ($runner -eq 'sqlcmd') {
        & sqlcmd -E -S "$Server,$Port" -i $f -b
        if ($LASTEXITCODE -ne 0) { Write-Error "sqlcmd failed running $f (exit $LASTEXITCODE)"; exit $LASTEXITCODE }
    } else {
        try { Invoke-Sqlcmd -ServerInstance "$Server,$Port" -InputFile $f -ErrorAction Stop } catch { Write-Error "Invoke-Sqlcmd failed running $f"; exit 3 }
    }
}

Write-Host "Database initialization complete. FlashGuard should now exist on $Server." -ForegroundColor Green
