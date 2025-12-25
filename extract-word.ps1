$word = New-Object -ComObject Word.Application
$word.Visible = $false
$docPath = "C:\Users\hope-\Desktop\نافس\التطبيق\نواتج-التعلم2025 (1).docx"
$outputPath = "C:\Users\hope-\Desktop\نافس\التطبيق\nafes-training\temp-outcomes.txt"

try {
    $doc = $word.Documents.Open($docPath)
    $text = $doc.Content.Text
    $doc.Close()
    $text | Out-File -FilePath $outputPath -Encoding UTF8
    Write-Host "Text extracted successfully to $outputPath"
} catch {
    Write-Host "Error: $_"
} finally {
    $word.Quit()
}




