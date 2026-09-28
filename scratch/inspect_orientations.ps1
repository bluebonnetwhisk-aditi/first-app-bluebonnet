Add-Type -AssemblyName System.Drawing

$files = Get-ChildItem -Path "public/gallery" -File | Where-Object { $_.Extension -match "\.(jpg|jpeg|png)$" }

foreach ($file in $files) {
    $bytes = [System.IO.File]::ReadAllBytes($file.FullName)
    $ms = New-Object System.IO.MemoryStream(,$bytes)
    $bmp = [System.Drawing.Bitmap]::FromStream($ms)
    
    $aspect = [Math]::Round($bmp.Width / $bmp.Height, 2)
    Write-Host "$($file.Name): $($bmp.Width)x$($bmp.Height) (ratio: $aspect)"
    
    $bmp.Dispose()
    $ms.Dispose()
}
