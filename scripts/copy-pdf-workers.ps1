Write-Host "Copying PDF.js worker files to dist..."

# Ensure dist/assets directory exists
New-Item -ItemType Directory -Force -Path "dist/assets" | Out-Null

# Copy PDF worker files from public to dist/assets
Copy-Item "public/pdf.worker.min.*" -Destination "dist/assets/" -Force

Write-Host "PDF.js worker files copied successfully!"
