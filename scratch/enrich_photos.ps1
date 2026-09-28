Add-Type -AssemblyName System.Drawing

$galleryDir = "c:\Users\aditi\Downloads\stitch_bluebonnet_whisk_digital_experience\public\gallery"
$files = Get-ChildItem -Path $galleryDir -File

Write-Host "Enriching $($files.Count) food photos in $galleryDir..."

# Professional Food Photography Matrix:
# - Warm tone boost (+15% Red, +12% Green)
# - Rich contrast (+10% Vibrance)
# - Soft warm highlights

$cm = New-Object System.Drawing.Imaging.ColorMatrix
$cm.Matrix00 = 1.15
$cm.Matrix01 = 0.03
$cm.Matrix02 = 0.00
$cm.Matrix03 = 0.00
$cm.Matrix04 = 0.00

$cm.Matrix10 = 0.02
$cm.Matrix11 = 1.12
$cm.Matrix12 = 0.00
$cm.Matrix13 = 0.00
$cm.Matrix14 = 0.00

$cm.Matrix20 = 0.00
$cm.Matrix21 = 0.00
$cm.Matrix22 = 1.05
$cm.Matrix23 = 0.00
$cm.Matrix24 = 0.00

$cm.Matrix30 = 0.00
$cm.Matrix31 = 0.00
$cm.Matrix32 = 0.00
$cm.Matrix33 = 1.00
$cm.Matrix34 = 0.00

$cm.Matrix40 = 0.03
$cm.Matrix41 = 0.02
$cm.Matrix42 = -0.01
$cm.Matrix43 = 0.00
$cm.Matrix44 = 1.00

$imageAttr = New-Object System.Drawing.Imaging.ImageAttributes
$imageAttr.SetColorMatrix($cm, [System.Drawing.Imaging.ColorMatrixFlag]::Default, [System.Drawing.Imaging.ColorAdjustType]::Bitmap)

$processedCount = 0

foreach ($file in $files) {
    try {
        $filePath = $file.FullName
        
        # Read file bytes into memory stream to avoid file locking
        $bytes = [System.IO.File]::ReadAllBytes($filePath)
        $ms = New-Object System.IO.MemoryStream(,$bytes)
        $origBmp = [System.Drawing.Bitmap]::FromStream($ms)
        $w = $origBmp.Width
        $h = $origBmp.Height

        # Create target canvas
        $enhancedBmp = New-Object System.Drawing.Bitmap($w, $h, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
        $g = [System.Drawing.Graphics]::FromImage($enhancedBmp)

        # High quality rendering settings
        $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
        $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
        $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality

        # Draw image with color matrix transformation
        $rect = New-Object System.Drawing.Rectangle(0, 0, $w, $h)
        $g.DrawImage($origBmp, $rect, 0, 0, $w, $h, [System.Drawing.GraphicsUnit]::Pixel, $imageAttr)

        # Draw subtle professional vignette (radial warm dark edges)
        $path = New-Object System.Drawing.Drawing2D.GraphicsPath
        $path.AddEllipse(-[int]($w * 0.1), -[int]($h * 0.1), [int]($w * 1.2), [int]($h * 1.2))
        $pgb = New-Object System.Drawing.Drawing2D.PathGradientBrush($path)
        $pgb.CenterColor = [System.Drawing.Color]::FromArgb(0, 0, 0, 0)
        $pgb.SurroundColors = @([System.Drawing.Color]::FromArgb(65, 12, 10, 8))
        $g.FillRectangle($pgb, $rect)

        $origBmp.Dispose()
        $ms.Dispose()
        $g.Dispose()
        $path.Dispose()
        $pgb.Dispose()

        # Save back to file cleanly
        if ($file.Extension -eq ".png") {
            $enhancedBmp.Save($filePath, [System.Drawing.Imaging.ImageFormat]::Png)
        } else {
            $enhancedBmp.Save($filePath, [System.Drawing.Imaging.ImageFormat]::Jpeg)
        }
        $enhancedBmp.Dispose()

        $processedCount++
    } catch {
        Write-Host "Error processing $($file.Name): $_"
    }
}

Write-Host "Successfully enriched $processedCount food photos with professional color grading, warm lighting, and vignette!"
