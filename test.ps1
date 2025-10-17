# Project Test Script
# Run this to test the complete application

Write-Host "Starting E-Commerce Recommender Test..." -ForegroundColor Green

# Check if dev server is running
$serverRunning = Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object {$_.MainWindowTitle -like "*localhost:3000*"}

if (-not $serverRunning) {
    Write-Host "Starting development server..." -ForegroundColor Yellow
    Start-Process -FilePath "powershell" -ArgumentList "-Command cd '$PSScriptRoot'; npm run dev"
    Start-Sleep -Seconds 10
}

Write-Host "`nTesting API Endpoints..." -ForegroundColor Cyan

# Test Products API
Write-Host "Testing /api/products..." -ForegroundColor Yellow
$products = Invoke-RestMethod -Uri "http://localhost:3000/api/products" -Method Get
Write-Host "✓ Products count: $($products.count)" -ForegroundColor Green

# Test Single Product API
Write-Host "Testing /api/products/1..." -ForegroundColor Yellow
$product = Invoke-RestMethod -Uri "http://localhost:3000/api/products/1" -Method Get
Write-Host "✓ Product: $($product.product.title)" -ForegroundColor Green

# Test Recommendations API
Write-Host "Testing /api/recommendations..." -ForegroundColor Yellow
$recommendations = Invoke-RestMethod -Uri "http://localhost:3000/api/recommendations?limit=3" -Method Get
Write-Host "✓ Recommendations count: $($recommendations.count)" -ForegroundColor Green

# Test Behavior Tracking
Write-Host "Testing /api/behavior/track..." -ForegroundColor Yellow
$behaviorBody = @{
    productId = 1
    action = "view"
    sessionId = "test-session-$(Get-Date -Format 'yyyyMMddHHmmss')"
} | ConvertTo-Json

$behavior = Invoke-RestMethod -Uri "http://localhost:3000/api/behavior/track" -Method Post -Body $behaviorBody -ContentType "application/json"
Write-Host "✓ Behavior tracked: $($behavior.behaviorId)" -ForegroundColor Green

Write-Host "`n✅ All API tests passed!" -ForegroundColor Green
Write-Host "`nPages to test manually:" -ForegroundColor Cyan
Write-Host "  - Home: http://localhost:3000" -ForegroundColor White
Write-Host "  - Products: http://localhost:3000/products" -ForegroundColor White
Write-Host "  - Product Detail: http://localhost:3000/products/1" -ForegroundColor White
Write-Host "  - Dashboard: http://localhost:3000/dashboard" -ForegroundColor White
Write-Host "  - Admin Test: http://localhost:3000/admin/test" -ForegroundColor White

Write-Host "`nPress any key to open browser..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
Start-Process "http://localhost:3000"
