# WeatherWise Run Script for Windows
# This script helps you run WeatherWise step by step

Write-Host "=== WeatherWise Setup ===" -ForegroundColor Cyan
Write-Host ""

# Check if model files exist
if (-not (Test-Path "ml\models\weather_lstm.pt")) {
    Write-Host "Step 1: Training ML Model..." -ForegroundColor Yellow
    Write-Host "Installing ML dependencies..." -ForegroundColor Gray
    cd ml
    pip install -r requirements.txt
    Write-Host "Training model (this may take a few minutes)..." -ForegroundColor Gray
    python train_model.py
    cd ..
    Write-Host "✓ Model trained successfully!" -ForegroundColor Green
    Write-Host ""
} else {
    Write-Host "✓ ML model already exists, skipping training" -ForegroundColor Green
    Write-Host ""
}

# Check backend .env
if (-not (Test-Path "backend\.env")) {
    Write-Host "Step 2: Backend Setup..." -ForegroundColor Yellow
    Write-Host "Creating backend .env file..." -ForegroundColor Gray
    $apiKey = Read-Host -Prompt "Enter your OpenWeather API key (required)"
    if ([string]::IsNullOrWhiteSpace($apiKey)) {
        Write-Host "OpenWeather API key is required. Please rerun the script when you have it." -ForegroundColor Red
        exit 1
    }
    
    $envContent = @"
SECRET_KEY=dev-secret-key-change-in-production
DATABASE_URL=sqlite+aiosqlite:///./weatherwise.db
OPENWEATHER_API_KEY=$apiKey
ALLOWED_ORIGINS=["http://localhost:3000"]
ML_MODEL_PATH=../ml/models/weather_lstm.pt
ML_SCALER_PATH=../ml/models/scaler.pkl
"@
    Set-Content -Path "backend\.env" -Value $envContent
    Write-Host "✓ Backend .env created!" -ForegroundColor Green
    Write-Host ""
}

# Check frontend .env.local
if (-not (Test-Path "frontend\.env.local")) {
    Write-Host "Step 3: Frontend Setup..." -ForegroundColor Yellow
    Set-Content -Path "frontend\.env.local" -Value "NEXT_PUBLIC_API_URL=http://localhost:8000"
    Write-Host "✓ Frontend .env.local created!" -ForegroundColor Green
    Write-Host ""
}

Write-Host "=== Setup Complete! ===" -ForegroundColor Green
Write-Host ""
Write-Host "To run the application:" -ForegroundColor Cyan
Write-Host "1. Terminal 1 - Backend:  cd backend && python -m venv venv && venv\Scripts\activate && pip install -r requirements.txt && uvicorn app.main:app --reload" -ForegroundColor White
Write-Host "2. Terminal 2 - Frontend: cd frontend && npm install && npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "Or use Docker: docker-compose up --build" -ForegroundColor Cyan

