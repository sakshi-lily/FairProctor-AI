# ==============================================================================
# FairProctor-AI: Local Docker Stack Test Script (PowerShell)
# ==============================================================================
Write-Host "🐳 Testing FairProctor-AI Docker Compose Stack Locally..." -ForegroundColor Cyan

# 1. Check if Docker is running
try {
    docker info > $null 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Docker is not running. Please start Docker Desktop first." -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Docker command not found. Please install or start Docker Desktop." -ForegroundColor Red
    exit 1
}

# 2. Build and launch services using local compose.yaml
Write-Host "📦 Building and starting containers..." -ForegroundColor Yellow
docker compose -f compose.yaml up --build -d

# 3. Wait for backend healthcheck
Write-Host "⏳ Waiting for backend health check..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# 4. Check services status
docker compose -f compose.yaml ps

# 5. Test health endpoint via Nginx reverse proxy on port 80
try {
    $response = Invoke-RestMethod -Uri "http://localhost/health" -Method Get -TimeoutSec 5
    Write-Host "✅ Health Check Succeeded via Frontend Nginx Proxy!" -ForegroundColor Green
    Write-Host "   Service: $($response.service) - Status: $($response.status)" -ForegroundColor Green
} catch {
    Write-Host "⚠️ Direct proxy check on port 80 failed, checking backend on port 8000..." -ForegroundColor Yellow
    try {
        $response = Invoke-RestMethod -Uri "http://localhost:8000/health" -Method Get -TimeoutSec 5
        Write-Host "✅ Direct Backend on port 8000 is Healthy!" -ForegroundColor Green
    } catch {
        Write-Host "❌ Health check failed. Check logs with: docker compose logs" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "🌐 You can now access FairProctor-AI locally at: http://localhost" -ForegroundColor Cyan
Write-Host "👉 To view live logs: docker compose logs -f" -ForegroundColor Gray
Write-Host "👉 To stop containers: docker compose down" -ForegroundColor Gray
