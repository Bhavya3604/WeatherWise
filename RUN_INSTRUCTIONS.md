# How to Run WeatherWise

## Quick Start (Windows PowerShell)

### Option 1: Automated Setup Script

```powershell
# Run the setup script
.\run.ps1
```

Then follow the instructions it prints.

### Option 2: Manual Setup

## Step-by-Step Instructions

### Step 1: Train the ML Model

```powershell
cd ml
pip install -r requirements.txt
python train_model.py
cd ..
```

**Expected output:** Creates `ml/models/weather_lstm.pt` and `ml/models/scaler.pkl`

### Step 2: Setup Backend

```powershell
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file (or edit manually)
# Copy the content below into backend\.env
```

**Create `backend\.env` file with:**
```env
SECRET_KEY=dev-secret-key-change-in-production
DATABASE_URL=sqlite+aiosqlite:///./weatherwise.db
ALLOWED_ORIGINS=["http://localhost:3000"]
ML_MODEL_PATH=../ml/models/weather_lstm.pt
ML_SCALER_PATH=../ml/models/scaler.pkl
OPENWEATHER_API_KEY=your-openweather-api-key
```

> Get a free API key at https://openweathermap.org/api and paste it into `OPENWEATHER_API_KEY`.

### Step 3: Setup Frontend

```powershell
cd frontend

# Install dependencies
npm install

# Create .env.local file
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local
```

### Step 4: Run the Application

**You need TWO terminal windows:**

#### Terminal 1 - Backend:
```powershell
cd backend
venv\Scripts\activate
uvicorn app.main:app --reload
```

Backend will run at: **http://localhost:8000**

#### Terminal 2 - Frontend:
```powershell
cd frontend
npm run dev
```

Frontend will run at: **http://localhost:3000**

### Step 5: Use the Application

1. Open your browser to **http://localhost:3000**
2. Search for a city (e.g., "London") - works without login!
3. Click "Sign Up" to create an account
4. Login and go to the "Forecast" page
5. Get AI-powered 7-day weather predictions!

---

## Alternative: Docker (Easier)

If you have Docker installed:

```powershell
# Make sure you have your OpenWeatherMap API key
$env:OPENWEATHER_API_KEY="your-api-key-here"

# Build and run everything
docker-compose up --build
```

This starts both frontend and backend automatically!

**Note:** You still need to train the ML model first:
```powershell
cd ml
pip install -r requirements.txt
python train_model.py
```

---

## Troubleshooting

### "Model not found" error
- Make sure you completed Step 1 (train the model)
- Check that `ml/models/weather_lstm.pt` exists

### Weather API errors
- Open-Meteo API is free and requires no API key
- Check your internet connection
- Verify the city name is spelled correctly

### "Cannot connect to API"
- Make sure backend is running on port 8000
- Check `frontend\.env.local` has `NEXT_PUBLIC_API_URL=http://localhost:8000`

### Port already in use
- Backend uses port 8000, frontend uses port 3000
- Make sure nothing else is using these ports
- Or change ports in the config files

### Database errors
- Delete `backend\weatherwise.db` if it exists
- Restart the backend (tables auto-create on startup)

---

## Verify Everything Works

1. **Backend API:** Open http://localhost:8000/docs - Should show FastAPI docs
2. **Backend Health:** Open http://localhost:8000/health - Should return `{"status":"healthy"}`
3. **Frontend:** Open http://localhost:3000 - Should show the WeatherWise homepage

---

## Need Help?

- Check the full [README.md](README.md) for detailed documentation
- See [QUICKSTART.md](QUICKSTART.md) for a condensed guide
- Review [DEPLOYMENT.md](DEPLOYMENT.md) for production setup

Happy forecasting! 🌤️

