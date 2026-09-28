Add-Type -AssemblyName System.Drawing

# List of photos identified as landscape phone photos needing 90 deg rotation to stand upright
$targetFiles = @(
    "gallery_06.jpg", "gallery_07.jpg", "gallery_08.jpg", "gallery_09.jpg",
    "gallery_10.jpg", "gallery_11.jpg", "gallery_12.jpg", "gallery_13.jpg",
    "gallery_14.jpg", "gallery_15.jpg", "gallery_16.jpg", "gallery_17.jpg",
    "gallery_18.jpg", "gallery_19.jpg", "gallery_37.jpg"
)

foreach ($fileName in $targetFiles) {
    $filePath = Join-Path "public/gallery" $fileName
    if (Test-Path $filePath) {
        $bytes = [System.IO.File]::ReadAllBytes($filePath)
        $ms = New-Object System.IO.MemoryStream(,$bytes)
        $bmp = [System.Drawing.Bitmap]::FromStream($ms)

        # Rotate 90 degrees Clockwise so food faces UP and surface faces BOTTOM
        $bmp.RotateFlip([System.Drawing.RotateFlipType]::Rotate90FlipNone)

        $msOut = New-Object System.IO.MemoryStream
        $bmp.Save($msOut, [System.Drawing.Imaging.ImageFormat]::Jpeg)

        $bmp.Dispose()
        $ms.Dispose()

        [System.IO.File]::WriteAllBytes($filePath, $msOut.ToArray())
        $msOut.Dispose()

        Write-Host "Successfully rotated upright: $fileName"
    }
}
