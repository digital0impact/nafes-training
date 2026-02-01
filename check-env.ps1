# Script للتحقق من متغيرات البيئة
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope Process -Force
Set-Location $PSScriptRoot
npx tsx scripts/check-all-env.ts
