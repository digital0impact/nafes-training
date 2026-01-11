# Script to fix Prisma Build issue in Windows
# Encoding: UTF-8 with BOM

# Stop any running Node.js processes
Write-Host "Stopping Node.js processes..." -ForegroundColor Yellow
Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

# Stop any Next.js processes
Get-Process -Name "next" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

Write-Host "Processes stopped" -ForegroundColor Green

# Clean Prisma Client folder
Write-Host "`nCleaning Prisma Client..." -ForegroundColor Yellow
$prismaClientPath = "node_modules\.prisma\client"

if (Test-Path $prismaClientPath) {
    try {
        # Try to delete files individually
        Get-ChildItem -Path $prismaClientPath -Recurse -File | ForEach-Object {
            try {
                Remove-Item $_.FullName -Force -ErrorAction Stop
            } catch {
                Write-Host "Warning: Cannot delete: $($_.FullName)" -ForegroundColor Yellow
            }
        }
        # Delete directories
        Get-ChildItem -Path $prismaClientPath -Recurse -Directory | ForEach-Object {
            try {
                Remove-Item $_.FullName -Recurse -Force -ErrorAction Stop
            } catch {
                Write-Host "Warning: Cannot delete: $($_.FullName)" -ForegroundColor Yellow
            }
        }
        Remove-Item -Path $prismaClientPath -Recurse -Force -ErrorAction Stop
        Write-Host "Prisma Client deleted" -ForegroundColor Green
    } catch {
        Write-Host "Warning: Cannot delete Prisma Client completely. Will regenerate..." -ForegroundColor Yellow
    }
}

# Clean .next folder
Write-Host "`nCleaning .next..." -ForegroundColor Yellow
if (Test-Path ".next") {
    try {
        Remove-Item -Recurse -Force ".next" -ErrorAction Stop
        Write-Host ".next deleted" -ForegroundColor Green
    } catch {
        Write-Host "Warning: Cannot delete .next completely" -ForegroundColor Yellow
    }
}

# Regenerate Prisma Client
Write-Host "`nGenerating Prisma Client..." -ForegroundColor Cyan
npx prisma generate

if ($LASTEXITCODE -eq 0) {
    Write-Host "Prisma Client generated successfully" -ForegroundColor Green
} else {
    Write-Host "Failed to generate Prisma Client" -ForegroundColor Red
    Write-Host "`nTip: Close VS Code and reopen it, then run: npx prisma generate" -ForegroundColor Yellow
    exit 1
}

# Build
Write-Host "`nBuilding..." -ForegroundColor Cyan
npm run build

if ($LASTEXITCODE -eq 0) {
    Write-Host "`nBuild completed successfully!" -ForegroundColor Green
} else {
    Write-Host "`nBuild failed. Check errors above." -ForegroundColor Red
    exit 1
}
