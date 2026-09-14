# Script للتحقق من متغيرات البيئة
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope Process -Force
Set-Location (Join-Path $PSScriptRoot "..\..")
npm run check-env
