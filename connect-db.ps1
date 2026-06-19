# FlashGuard Database Connection Script
# Run this script to connect to the SQL Server database

Write-Host "Connecting to FlashGuard database..." -ForegroundColor Green
Write-Host "Server: localhost:1433" -ForegroundColor Yellow
Write-Host "Database: FlashGuard" -ForegroundColor Yellow
Write-Host "Username: sa" -ForegroundColor Yellow
Write-Host ""

# Test connection first
Write-Host "Testing connection..." -ForegroundColor Cyan
try {
    $testResult = sqlcmd -C -S localhost,1433 -U sa -P 'YourStrong!Passw0rd' -d master -Q "SELECT 'Connection successful!' as Status"
    if ($testResult -match "successful") {
        Write-Host "✓ Connection test passed!" -ForegroundColor Green
    } else {
        Write-Host "✗ Connection test failed!" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "✗ Connection test failed!" -ForegroundColor Red
    Write-Host "Make sure your local SQL Server instance is running on localhost:1433" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "Starting interactive SQL session..." -ForegroundColor Green
Write-Host "Type your SQL queries, then press Enter twice (or type GO)" -ForegroundColor Cyan
Write-Host "Type 'QUIT' to exit" -ForegroundColor Cyan
Write-Host ""

# Start interactive session
sqlcmd -C -S localhost,1433 -U sa -P 'YourStrong!Passw0rd' -d FlashGuard