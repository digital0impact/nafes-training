# Simple build script without Arabic text to avoid encoding issues

Write-Host "Cleaning cache..." -ForegroundColor Cyan

# Stop Node processes
Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 1

# Remove Prisma Client
if (Test-Path "node_modules\.prisma") {
    Remove-Item -Recurse -Force "node_modules\.prisma" -ErrorAction SilentlyContinue
}

# Remove .next
if (Test-Path ".next") {
    Remove-Item -Recurse -Force ".next" -ErrorAction SilentlyContinue
}

Write-Host "Generating Prisma Client..." -ForegroundColor Yellow
npx prisma generate

Write-Host "Building..." -ForegroundColor Cyan
npm run build
