# PowerShell script to package TermWise extension for Chrome Web Store submission
# This script creates a ZIP file containing only the necessary files for the extension

# Stop on first error
$ErrorActionPreference = "Stop"

Write-Host "[*] Starting TermWise extension packaging..." -ForegroundColor Blue

# Required files and directories
$requiredFiles = @(
    "manifest.json",
    "background.js",
    "content.js",
    "sidepanel.js",
    "sidepanel.html",
    "options.js",
    "options.html",
    "styles.css",
    "overlay.css",
    "privacy-policy.md",
    "README.md",
    "LICENSE"
)

$requiredDirs = @(
    "icons"
)

$requiredIcons = @(
    "icons/icon16.png",
    "icons/icon24.png",
    "icons/icon32.png",
    "icons/icon48.png",
    "icons/icon128.png"
)

# Files/directories to exclude
$excludePatterns = @(
    "*.git*",
    "*.vscode*",
    "*.DS_Store",
    "node_modules",
    "test",
    "store-assets",
    "*.ps1",
    "*.zip"
)

# Create timestamp for ZIP file name
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$zipName = "TermWise_$timestamp.zip"

# Function to clean up temporary directory
function Cleanup-TempDir {
    param (
        [string]$tempDir
    )
    if (Test-Path $tempDir) {
        Remove-Item $tempDir -Recurse -Force
        Write-Host "[-] Cleaned up temporary directory" -ForegroundColor Gray
    }
}

# Verify required files exist
Write-Host "[*] Verifying required files..." -ForegroundColor Yellow
$missingFiles = @()

foreach ($file in $requiredFiles) {
    if (-not (Test-Path $file)) {
        $missingFiles += $file
    }
}

foreach ($dir in $requiredDirs) {
    if (-not (Test-Path $dir -PathType Container)) {
        $missingFiles += $dir
    }
}

foreach ($icon in $requiredIcons) {
    if (-not (Test-Path $icon)) {
        $missingFiles += $icon
    }
}

if ($missingFiles.Count -gt 0) {
    Write-Host "[!] Error: Missing required files:" -ForegroundColor Red
    $missingFiles | ForEach-Object { Write-Host "   - $_" -ForegroundColor Red }
    exit 1
}

# Verify manifest.json
Write-Host "[*] Verifying manifest.json..." -ForegroundColor Yellow
try {
    $manifest = Get-Content "manifest.json" -Raw | ConvertFrom-Json
    
    # Check required manifest fields
    $requiredFields = @("manifest_version", "name", "version", "description")
    $missingFields = $requiredFields | Where-Object { -not $manifest.$_ }
    
    if ($missingFields) {
        Write-Host "[!] Error: manifest.json is missing required fields:" -ForegroundColor Red
        $missingFields | ForEach-Object { Write-Host "   - $_" -ForegroundColor Red }
        exit 1
    }

    # Verify manifest version is 3
    if ($manifest.manifest_version -ne 3) {
        Write-Host "[!] Error: manifest_version must be 3" -ForegroundColor Red
        exit 1
    }

    Write-Host "[+] manifest.json verification passed" -ForegroundColor Green
} catch {
    Write-Host "[!] Error: Invalid manifest.json" -ForegroundColor Red
    Write-Host $_.Exception.Message
    exit 1
}

# Create temporary directory for packaging
$tempDir = "temp_package_$timestamp"
New-Item -ItemType Directory -Path $tempDir | Out-Null

try {
    # Copy required files
    Write-Host "[*] Copying files..." -ForegroundColor Yellow
    
    foreach ($file in $requiredFiles) {
        Copy-Item $file $tempDir -Force
        Write-Host "   Copied $file" -ForegroundColor Gray
    }
    
    foreach ($dir in $requiredDirs) {
        Copy-Item $dir $tempDir -Recurse -Force
        Write-Host "   Copied $dir/" -ForegroundColor Gray
    }

    # Create the ZIP file
    Write-Host "[*] Creating ZIP file..." -ForegroundColor Yellow
    
    if (Test-Path $zipName) {
        Remove-Item $zipName -Force
    }
    
    Add-Type -AssemblyName System.IO.Compression.FileSystem
    [System.IO.Compression.ZipFile]::CreateFromDirectory($tempDir, $zipName)

    # Verify ZIP file was created and has content
    if (Test-Path $zipName) {
        $zipSize = (Get-Item $zipName).Length
        if ($zipSize -gt 0) {
            Write-Host "[+] Successfully created $zipName ($([math]::Round($zipSize/1KB, 2)) KB)" -ForegroundColor Green
        } else {
            throw "ZIP file is empty"
        }
    } else {
        throw "Failed to create ZIP file"
    }

    Write-Host "`n[*] Next steps:" -ForegroundColor Cyan
    Write-Host "1. Verify the contents of $zipName" -ForegroundColor Cyan
    Write-Host "2. Upload to Chrome Web Store Developer Dashboard" -ForegroundColor Cyan
    Write-Host "3. Complete store listing information" -ForegroundColor Cyan
    Write-Host "`nFor detailed instructions, refer to CHROME_STORE_SUBMISSION_GUIDE.md" -ForegroundColor Cyan

} catch {
    Write-Host "`n[!] Error during packaging:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Cleanup-TempDir $tempDir
    exit 1
} finally {
    Cleanup-TempDir $tempDir
} 