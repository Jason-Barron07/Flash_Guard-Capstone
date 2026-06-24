@echo off
echo ========================================
echo  FlashGuard Database Connection
echo ========================================
echo.
echo Server: localhost:1433
echo Database: FlashGuard
echo Username: sa
echo.
echo Testing connection...
echo.

docker exec fg-sqlserver /opt/mssql-tools18/bin/sqlcmd -C -S localhost -U sa -P "YourStrong!Passw0rd" -Q "SELECT 'Connection successful!' as Status"

if %errorlevel% neq 0 (
    echo.
    echo ERROR: Connection failed!
    echo Make sure Docker containers are running:
    echo docker-compose up -d sqlserver db-init
    pause
    exit /b 1
)

echo.
echo Connection successful!
echo.
echo Starting interactive SQL session...
echo Type your SQL queries, then press Enter twice (or type GO)
echo Type 'QUIT' to exit
echo.

docker exec -it fg-sqlserver /opt/mssql-tools18/bin/sqlcmd -C -S localhost -U sa -P "YourStrong!Passw0rd" -d FlashGuard