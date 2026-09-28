Add-Type -AssemblyName System.Drawing

$srcPath = "C:\Users\aditi\.gemini\antigravity\brain\2785bab3-0a13-401c-a595-8c322f8a219d\bbw_3d_logo_hd_1790535095235.jpg"
$bmp = [System.Drawing.Bitmap]::FromFile($srcPath)

$w = $bmp.Width
$h = $bmp.Height

Write-Host "Original Image Dimensions: $w x $h"

# Create new ARGB bitmap
$outBmp = New-Object System.Drawing.Bitmap($w, $h, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)

for ($y = 0; $y -lt $h; $y++) {
    for ($x = 0; $x -lt $w; $x++) {
        $c = $bmp.GetPixel($x, $y)
        $r = $c.R
        $g = $c.G
        $b = $c.B

        # Calculate luminance / brightness
        $brightness = [Math]::Max($r, [Math]::Max($g, $b))

        if ($brightness -lt 30) {
            # Black background -> 100% pure transparent
            $outBmp.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(0, 0, 0, 0))
        } else {
            # Logo pixel -> preserve exact color and full opacity
            $alpha = [Math]::Min(255, [int]($brightness * 4))
            if ($brightness -gt 45) { $alpha = 255 }
            $newC = [System.Drawing.Color]::FromArgb($alpha, $r, $g, $b)
            $outBmp.SetPixel($x, $y, $newC)
        }
    }
}

# Crop tight bounding box around the main 3D logo text element
$minX = 85
$maxX = 1285
$minY = 105
$maxY = 674

$cropW = $maxX - $minX + 1
$cropH = $maxY - $minY + 1

$cropRect = New-Object System.Drawing.Rectangle($minX, $minY, $cropW, $cropH)
$croppedBmp = $outBmp.Clone($cropRect, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)

$target1 = "c:\Users\aditi\Downloads\stitch_bluebonnet_whisk_digital_experience\src\assets\images\brand_logo_transparent.png"
$target2 = "c:\Users\aditi\Downloads\stitch_bluebonnet_whisk_digital_experience\public\brand_logo_transparent.png"

$croppedBmp.Save($target1, [System.Drawing.Imaging.ImageFormat]::Png)
$croppedBmp.Save($target2, [System.Drawing.Imaging.ImageFormat]::Png)

Write-Host "Successfully generated clean transparent logo to $target1 and $target2 ($cropW x $cropH)"

$bmp.Dispose()
$outBmp.Dispose()
$croppedBmp.Dispose()
