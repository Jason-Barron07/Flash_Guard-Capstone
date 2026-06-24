IF NOT EXISTS (SELECT * FROM sys.sql_logins WHERE name = 'fg')
BEGIN
    CREATE LOGIN fg WITH PASSWORD = 'YourStrong!Passw0rd';
END
GO

USE FlashGuard;
GO

IF NOT EXISTS (SELECT * FROM sys.database_principals WHERE name = 'fg')
BEGIN
    CREATE USER fg FOR LOGIN fg;
    EXEC sp_addrolemember N'db_owner', N'fg';
END
GO
