# PowerShell script to replace dark text colors with #efdede
# This script updates all TypeScript/React files in the src directory

Write-Host "Starting text color replacement..." -ForegroundColor Green

# Define the source directory
$srcDir = "src"

# Define color mappings (old color -> new color)
$colorMappings = @{
    'text-gray-800' = 'text-[#efdede]'
    'text-gray-900' = 'text-[#efdede]'
    'text-gray-700' = 'text-[#efdede]'
    'text-gray-600' = 'text-[#efdede]'
    'text-black' = 'text-[#efdede]'
    'text-slate-800' = 'text-[#efdede]'
    'text-slate-900' = 'text-[#efdede]'
    'text-slate-700' = 'text-[#efdede]'
    'text-slate-600' = 'text-[#efdede]'
    'text-zinc-800' = 'text-[#efdede]'
    'text-zinc-900' = 'text-[#efdede]'
    'text-zinc-700' = 'text-[#efdede]'
    'text-zinc-600' = 'text-[#efdede]'
    'hover:text-gray-800' = 'hover:text-[#efdede]'
    'hover:text-gray-900' = 'hover:text-[#efdede]'
    'hover:text-gray-700' = 'hover:text-[#efdede]'
    'hover:text-gray-600' = 'hover:text-[#efdede]'
    'hover:text-black' = 'hover:text-[#efdede]'
}

# Get all TypeScript and React files
$files = Get-ChildItem -Path $srcDir -Recurse -Include "*.tsx", "*.ts" -File

Write-Host "Found $($files.Count) files to process..." -ForegroundColor Yellow

$processedFiles = 0
$totalReplacements = 0

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    $originalContent = $content
    $fileReplacements = 0
    
    # Apply each color mapping
    foreach ($mapping in $colorMappings.GetEnumerator()) {
        $oldColor = $mapping.Key
        $newColor = $mapping.Value
        
        # Count occurrences before replacement
        $matches = [regex]::Matches($content, [regex]::Escape($oldColor))
        if ($matches.Count -gt 0) {
            $content = $content -replace [regex]::Escape($oldColor), $newColor
            $fileReplacements += $matches.Count
            Write-Host "  Replaced $($matches.Count) instances of '$oldColor' with '$newColor' in $($file.Name)" -ForegroundColor Cyan
        }
    }
    
    # Write back to file if changes were made
    if ($content -ne $originalContent) {
        try {
            Set-Content -Path $file.FullName -Value $content -NoNewline
            $processedFiles++
            $totalReplacements += $fileReplacements
            Write-Host "Updated: $($file.Name) ($fileReplacements replacements)" -ForegroundColor Green
        }
        catch {
            Write-Host "Error updating $($file.Name): $($_.Exception.Message)" -ForegroundColor Red
        }
    }
}

Write-Host "`nText color replacement completed!" -ForegroundColor Green
Write-Host "Files processed: $processedFiles" -ForegroundColor Yellow
Write-Host "Total replacements: $totalReplacements" -ForegroundColor Yellow

# Additional specific replacements for complex patterns
Write-Host "`nApplying additional pattern replacements..." -ForegroundColor Green

$additionalPatterns = @{
    # Specific className patterns that might have been missed
    'className="([^"]*?)text-gray-([6-9]00)([^"]*?)"' = 'className="$1text-[#efdede]$3"'
    'className={[^}]*text-gray-([6-9]00)[^}]*}' = { param($match) $match.Value -replace 'text-gray-[6-9]00', 'text-[#efdede]' }
}

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    $originalContent = $content
    
    # Apply regex patterns for more complex cases
    $content = $content -replace 'className="([^"]*?)text-gray-([6-9]00)([^"]*?)"', 'className="$1text-[#efdede]$3"'
    $content = $content -replace 'className=\{[^}]*text-gray-([6-9]00)[^}]*\}', { param($match) $match.Value -replace 'text-gray-[6-9]00', 'text-[#efdede]' }
    
    if ($content -ne $originalContent) {
        try {
            Set-Content -Path $file.FullName -Value $content -NoNewline
            Write-Host "Applied additional patterns to: $($file.Name)" -ForegroundColor Cyan
        }
        catch {
            Write-Host "Error applying additional patterns to $($file.Name): $($_.Exception.Message)" -ForegroundColor Red
        }
    }
}

Write-Host "`nAll text color replacements completed successfully!" -ForegroundColor Green
Write-Host "The color #efdede has been applied to all dark text colors." -ForegroundColor Yellow
Write-Host "`nNote: Please review the changes and test the application to ensure everything looks correct." -ForegroundColor Magenta