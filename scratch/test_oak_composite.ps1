Add-Type -AssemblyName System.Drawing

function Process-GalleryPhoto {
    param (
        [string]$inputPath,
        [string]$outputPath
    )

    $srcBmp = [System.Drawing.Bitmap]::FromFile($inputPath)
    $srcW = $srcBmp.Width
    $srcH = $srcBmp.Height

    # Target canvas dimensions (1200 x 1000 - perfect 6:5 gallery card aspect ratio)
    $canvasW = 1200
    $canvasH = 1000

    # 1. Create American Oak Slab Background Bitmap
    $canvas = New-Object System.Drawing.Bitmap($canvasW, $canvasH)
    $g = [System.Drawing.Graphics]::FromImage($canvas)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality

    # Rich American Oak Background Gradient
    $rect = New-Object System.Drawing.Rectangle(0, 0, $canvasW, $canvasH)
    $cTop = [System.Drawing.Color]::FromArgb(255, 42, 28, 19)       # Warm dark oak shadow top
    $cMid = [System.Drawing.Color]::FromArgb(255, 62, 42, 28)       # Golden oak slab center
    $cBot = [System.Drawing.Color]::FromArgb(255, 30, 20, 14)       # Deep rich oak edge bottom

    $bgBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush($rect, $cTop, $cBot, 65.0)
    $g.FillRectangle($bgBrush, $rect)
    $bgBrush.Dispose()

    # Subtle Oak Wood Grain Texture Lines
    $rand = New-Object System.Random(1234)
    for ($y = 0; $y -lt $canvasH; $y += 5) {
        $alpha = $rand.Next(8, 22)
        $grainPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb($alpha, 185, 135, 90), $rand.Next(1, 3))
        $g.DrawLine($grainPen, 0, $y, $canvasW, $y + $rand.Next(-8, 8))
        $grainPen.Dispose()
    }

    # Soft Central Lighting Radial Spotlight
    $path = New-Object System.Drawing.Drawing2D.GraphicsPath
    $path.AddEllipse(-100, -100, $canvasW + 200, $canvasH + 200)
    $pgb = New-Object System.Drawing.Drawing2D.PathGradientBrush($path)
    $pgb.CenterColor = [System.Drawing.Color]::FromArgb(55, 212, 168, 70)  # Amber gold warm spotlight
    $pgb.SurroundColors = @([System.Drawing.Color]::FromArgb(220, 18, 12, 8)) # Warm dark vignette edge
    $g.FillRectangle($pgb, $rect)
    $pgb.Dispose()
    $path.Dispose()

    # 2. Fit food image cleanly inside canvas with 12% padding (86% max fill)
    $maxFillW = [int]($canvasW * 0.86)
    $maxFillH = [int]($canvasH * 0.86)

    $scaleW = $maxFillW / $srcW
    $scaleH = $maxFillH / $srcH
    $scale = [Math]::Min($scaleW, $scaleH)

    $drawW = [int]($srcW * $scale)
    $drawH = [int]($srcH * $scale)

    $destX = [int](($canvasW - $drawW) / 2)
    $destY = [int](($canvasH - $drawH) / 2)

    # Apply slight color enrichment matrix (+10% warm red/gold, +10% contrast)
    $colorMatrix = New-Object System.Drawing.Imaging.ColorMatrix
    $colorMatrix.Matrix00 = 1.10 # Red
    $colorMatrix.Matrix11 = 1.05 # Green
    $colorMatrix.Matrix22 = 0.95 # Blue
    $colorMatrix.Matrix33 = 1.00 # Alpha
    $colorMatrix.Matrix44 = 1.00

    $imgAttrs = New-Object System.Drawing.Imaging.ImageAttributes
    $imgAttrs.SetColorMatrix($colorMatrix, [System.Drawing.Imaging.ColorMatrixFlag]::Default, [System.Drawing.Imaging.ColorAdjustType]::Bitmap)

    # Draw scaled food dish centered on Oak Slab
    $destRect = New-Object System.Drawing.Rectangle($destX, $destY, $drawW, $drawH)
    $g.DrawImage($srcBmp, $destRect, 0, 0, $srcW, $srcH, [System.Drawing.GraphicsUnit]::Pixel, $imgAttrs)

    # Soft edge feathering vignette over the dish edges to seamlessly merge into Oak Slab
    $vignettePath = New-Object System.Drawing.Drawing2D.GraphicsPath
    # Inner oval matching dish dimensions
    $vignettePath.AddEllipse($destX - 10, $destY - 10, $drawW + 20, $drawH + 20)
    $vignettePgb = New-Object System.Drawing.Drawing2D.PathGradientBrush($vignettePath)
    $vignettePgb.CenterColor = [System.Drawing.Color]::FromArgb(0, 0, 0, 0)
    $vignettePgb.SurroundColors = @([System.Drawing.Color]::FromArgb(160, 32, 20, 14)) # Soft warm oak shadow blend
    $g.FillRectangle($vignettePgb, $rect)

    $vignettePgb.Dispose()
    $vignettePath.Dispose()
    $imgAttrs.Dispose()
    $g.Dispose()
    $srcBmp.Dispose()

    # Save output bitmap
    if ($outputPath.EndsWith(".jpg", [System.StringComparison]::OrdinalIgnoreCase)) {
        $canvas.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Jpeg)
    } else {
        $canvas.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)
    }
    $canvas.Dispose()
    Write-Host "Processed: $outputPath"
}

Process-GalleryPhoto "public/gallery/orig/gallery_01.png" "public/gallery/gallery_01.png"
Process-GalleryPhoto "public/gallery/orig/gallery_06.jpg" "public/gallery/gallery_06.jpg"
