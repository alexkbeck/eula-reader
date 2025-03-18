# PowerShell script to create simple colored square icons for the EULA Reader extension

# Function to create a simple colored square icon
function Create-ColoredSquareIcon {
    param (
        [int]$size,
        [string]$outputPath
    )
    
    # Create a new bitmap with the specified size
    $bitmap = New-Object System.Drawing.Bitmap($size, $size)
    
    # Create a graphics object from the bitmap
    $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
    
    # Fill the bitmap with the theme color (#1976d2)
    $themeColor = [System.Drawing.Color]::FromArgb(255, 25, 118, 210)
    $brush = New-Object System.Drawing.SolidBrush($themeColor)
    $graphics.FillRectangle($brush, 0, 0, $size, $size)
    
    # Save the bitmap to a file
    $bitmap.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)
    
    # Dispose of the graphics and bitmap objects
    $graphics.Dispose()
    $bitmap.Dispose()
    
    Write-Host "Created icon: $outputPath"
}

# Load the System.Drawing assembly
Add-Type -AssemblyName System.Drawing

# Create icons for each required size
$sizes = @(16, 24, 32, 48, 128)

foreach ($size in $sizes) {
    $outputPath = "$PSScriptRoot\icon$size.png"
    Create-ColoredSquareIcon -size $size -outputPath $outputPath
}

Write-Host "All icons created successfully!" 