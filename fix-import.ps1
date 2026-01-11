# Fix import path in student page.tsx
$filePath = "src/app/student/page.tsx"
$content = Get-Content $filePath -Raw -Encoding UTF8
$content = $content -replace '@/components/student/student-auth-guard', '@/components/student'
$content | Set-Content $filePath -Encoding UTF8 -NoNewline
Write-Host "Fixed import path in $filePath" -ForegroundColor Green
