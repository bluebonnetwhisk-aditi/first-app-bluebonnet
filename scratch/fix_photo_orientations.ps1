Add-Type -AssemblyName System.Drawing

$outDir = "public/gallery"
$files = Get-ChildItem -Path $outDir -File | Where-Object { $_.Extension -match "\.(jpg|jpeg|png)$" }

Write-Host "Checking EXIF and dimensions for $($files.Count) gallery photos..."

$rotatedCount = 0

foreach ($file in $files) {
    $filePath = $file.FullName
    $bytes = [System.IO.File]::ReadAllBytes($filePath)
    $ms = New-Object System.IO.MemoryStream(,$bytes)
    $bmp = [System.Drawing.Bitmap]::FromStream($ms)

    $rotated = $false

    # Check EXIF Orientation tag (Property ID 0x0112 = 274)
    if ($bmp.PropertyIdList -contains 274) {
        $prop = $bmp.GetPropertyItem(274)
        $orientation = [BitConverter]::ToUInt16($prop.Value, 0)
        
        switch ($orientation) {
            1 { # Normal (0 deg)
            }
            3 { # Rotate 180
                $bmp.RotateFlip([System.Drawing.RotateFlipType]::Rotate180FlipNone)
                $rotated = $true
                Write-Host "Rotated 180: $($file.Name)"
            }
            6 { # Rotate 90 CW
                $bmp.RotateFlip([System.Drawing.RotateFlipType]::Rotate90FlipNone)
                $rotated = $true
                Write-Host "Rotated 90 CW: $($file.Name)"
            }
            8 { # Rotate 270 CW (90 CCW)
                $bmp.RotateFlip([System.Drawing.RotateFlipType]::Rotate270FlipNone)
                $rotated = $true
                Write-Host "Rotated 270 CW: $($file.Name)"
            }
        }
        # Remove orientation tag after burning rotation into image
        $bmp.RemovePropertyItem(274)
    }

    if ($rotated) {
        $rotatedCount++
        # Save updated bitmap
        $msOut = New-Object System.IO.MemoryStream
        if ($file.Extension -eq ".jpg") {
            $bmp.Save($msOut, [System.Drawing.Imaging.ImageFormat]::Jpeg)
        } else {
            $bmp.Save($msOut, [System.Drawing.Imaging.ImageFormat]::Png)
        }
        $bmp.Dispose()
        $ms.Dispose()

        [System.IO.File]::WriteAllBytes($filePath, $msOut.ToArray())
        $msOut.Dispose()
    } else {
        $bmp.Dispose()
        $ms.Dispose()
    }
}

Write-Host "Completed EXIF orientation check. Rotated $rotatedCount images."
