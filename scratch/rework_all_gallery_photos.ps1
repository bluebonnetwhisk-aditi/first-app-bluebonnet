Add-Type -AssemblyName System.Drawing

$origDir = "public/gallery/orig"
$outDir = "public/gallery"

$files = Get-ChildItem -Path $origDir -File | Where-Object { $_.Extension -match "\.(jpg|jpeg|png)$" }

Write-Host "Found $($files.Count) original gallery photos to process."

foreach ($file in $files) {
    $inputPath = $file.FullName
    $outputPath = Join-Path $outDir $file.Name

    # Read original image via MemoryStream to avoid file lock
    $bytes = [System.IO.File]::ReadAllBytes($inputPath)
    $ms = New-Object System.IO.MemoryStream(,$bytes)
    $srcBmp = [System.Drawing.Bitmap]::FromStream($ms)
    $srcW = $srcBmp.Width
    $srcH = $srcBmp.Height

    # Target canvas dimensions (1200 x 1000 - perfect 6:5 gallery card aspect ratio)
    $canvasW = 1200
    $canvasH = 1000

    $canvas = New-Object System.Drawing.Bitmap($canvasW, $canvasH)
    $g = [System.Drawing.Graphics]::FromImage($canvas)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality

    # 1. American Oak Background Base Gradient
    $rect = New-Object System.Drawing.Rectangle(0, 0, $canvasW, $canvasH)
    $cTop = [System.Drawing.Color]::FromArgb(255, 42, 28, 19)       # Dark rich oak shadow top
    $cMid = [System.Drawing.Color]::FromArgb(255, 62, 42, 28)       # Golden oak slab center
    $cBot = [System.Drawing.Color]::FromArgb(255, 30, 20, 14)       # Deep rich oak edge bottom

    $bgBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush($rect, $cTop, $cBot, 65.0)
    $g.FillRectangle($bgBrush, $rect)
    $bgBrush.Dispose()

    # Subtle Oak Wood Grain Texture Lines
    $rand = New-Object System.Random($file.Name.GetHashCode())
    for ($y = 0; $y -lt $canvasH; $y += 5) {
        $alpha = $rand.Next(8, 22)
        $grainPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb($alpha, 185, 135, 90), $rand.Next(1, 3))
        $g.DrawLine($grainPen, 0, $y, $canvasW, $y + $rand.Next(-8, 8))
        $grainPen.Dispose()
    }

    # Soft Central Amber Spotlight
    $path = New-Object System.Drawing.Drawing2D.GraphicsPath
    $path.AddEllipse(-100, -100, $canvasW + 200, $canvasH + 200)
    $pgb = New-Object System.Drawing.Drawing2D.PathGradientBrush($path)
    $pgb.CenterColor = [System.Drawing.Color]::FromArgb(55, 212, 168, 70)  # Soft amber spotlight
    $pgb.SurroundColors = @([System.Drawing.Color]::FromArgb(220, 18, 12, 8)) # Warm dark vignette edge
    $g.FillRectangle($pgb, $rect)
    $pgb.Dispose()
    $path.Dispose()

    # 2. Scale Dish Image to fit inside 84% canvas size (generous padding so NOTHING is cropped off)
    $maxFillW = [int]($canvasW * 0.84)
    $maxFillH = [int]($canvasH * 0.84)

    $scaleW = $maxFillW / $srcW
    $scaleH = $maxFillH / $srcH
    $scale = [Math]::Min($scaleW, $scaleH)

    $drawW = [int]($srcW * $scale)
    $drawH = [int]($srcH * $scale)

    $destX = [int](($canvasW - $drawW) / 2)
    $destY = [int](($canvasH - $drawH) / 2)

    # Color matrix (+12% warm red/gold, +8% green vibrance)
    $colorMatrix = New-Object System.Drawing.Imaging.ColorMatrix
    $colorMatrix.Matrix00 = 1.12 # Red
    $colorMatrix.Matrix11 = 1.08 # Green
    $colorMatrix.Matrix22 = 0.94 # Blue
    $colorMatrix.Matrix33 = 1.00 # Alpha
    $colorMatrix.Matrix44 = 1.00

    $imgAttrs = New-Object System.Drawing.Imaging.ImageAttributes
    $imgAttrs.SetColorMatrix($colorMatrix, [System.Drawing.Imaging.ColorMatrixFlag]::Default, [System.Drawing.Imaging.ColorAdjustType]::Bitmap)

    # Draw centered food dish
    $destRect = New-Object System.Drawing.Rectangle($destX, $destY, $drawW, $drawH)
    $g.DrawImage($srcBmp, $destRect, 0, 0, $srcW, $srcH, [System.Drawing.GraphicsUnit]::Pixel, $imgAttrs)

    # Soft radial edge shadow over dish perimeter to remove room distractions and blend dish onto Oak Slab
    $vignettePath = New-Object System.Drawing.Drawing2D.GraphicsPath
    $vignettePath.AddEllipse($destX - 15, $destY - 15, $drawW + 30, $drawH + 30)
    $vignettePgb = New-Object System.Drawing.Drawing2D.PathGradientBrush($vignettePath)
    $vignettePgb.CenterColor = [System.Drawing.Color]::FromArgb(0, 0, 0, 0)
    $vignettePgb.SurroundColors = @([System.Drawing.Color]::FromArgb(150, 32, 20, 14))
    $g.FillRectangle($vignettePgb, $rect)

    $vignettePgb.Dispose()
    $vignettePath.Dispose()
    $imgAttrs.Dispose()
    $g.Dispose()
    $srcBmp.Dispose()
    $ms.Dispose()

    # Save processed image file
    if ($file.Extension -eq ".jpg") {
        $canvas.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Jpeg)
    } else {
        $canvas.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)
    }
    $canvas.Dispose()
}

Write-Host "Successfully processed all $($files.Count) gallery photos onto American Oak Slab background with highlight centering."
