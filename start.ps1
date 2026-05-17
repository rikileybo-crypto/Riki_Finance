$root = $PSScriptRoot

# Check SUPABASE_JWT_SECRET is filled in
$envContent = Get-Content "$root\backend\.env" -Raw
if ($envContent -match 'SUPABASE_JWT_SECRET=FILL_IN_FROM_SUPABASE_DASHBOARD') {
    Write-Host ""
    Write-Host "!! חסר SUPABASE_JWT_SECRET !!" -ForegroundColor Red
    Write-Host "פתח את backend\.env ומלא את הערך מ:" -ForegroundColor Yellow
    Write-Host "Supabase Dashboard -> Settings -> API -> JWT Settings -> JWT Secret" -ForegroundColor Cyan
    Write-Host ""
    Read-Host "לחץ Enter לאחר שמילאת את הערך"
}

# Install backend deps if needed
if (-not (Test-Path "$root\backend\node_modules")) {
    Write-Host "מתקין backend dependencies..." -ForegroundColor Cyan
    Push-Location "$root\backend"
    npm install
    Write-Host "מתקין Playwright Chromium..." -ForegroundColor Cyan
    npx playwright install chromium
    Pop-Location
}

# Install frontend deps if needed
if (-not (Test-Path "$root\frontend\node_modules")) {
    Write-Host "מתקין frontend dependencies..." -ForegroundColor Cyan
    Push-Location "$root\frontend"
    npm install
    Pop-Location
}

Write-Host ""
Write-Host "מפעיל Backend (port 3001)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit -Command `"cd '$root\backend'; node src/index.js`""

Start-Sleep -Seconds 2

Write-Host "מפעיל Frontend (port 5173)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit -Command `"cd '$root\frontend'; npm run dev`""

Start-Sleep -Seconds 3

Write-Host ""
Write-Host "פותח דפדפן..." -ForegroundColor Green
Start-Process "http://localhost:5173"
