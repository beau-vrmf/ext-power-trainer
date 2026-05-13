$pptxPath = "$env:USERPROFILE\Downloads\External Power - FI Manual.pptx"
$outDir   = "$PSScriptRoot\..\public\figures\manual"

New-Item -ItemType Directory -Force -Path $outDir | Out-Null

$ppt  = New-Object -ComObject PowerPoint.Application
$ppt.Visible = [Microsoft.Office.Core.MsoTriState]::msoTrue
$pres = $ppt.Presentations.Open($pptxPath, $true, $false, $false)

# Export slides 1 and 2 at ~200 DPI (8.5 x 10 inch slide = 1700 x 2000 px)
$pres.Slides(1).Export("$outDir\sheet-123.png", "PNG", 1700, 2000)
$pres.Slides(2).Export("$outDir\sheet-124.png", "PNG", 1700, 2000)

$pres.Close()
$ppt.Quit()
[System.Runtime.InteropServices.Marshal]::ReleaseComObject($ppt) | Out-Null

Write-Host "Done - exported:"
Write-Host "  sheet-123.png"
Write-Host "  sheet-124.png"
