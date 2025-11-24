# WeatherWise Quick Start Guide

Get WeatherWise running in 5 minutes!

## Prerequisites

- Python 3.11+
- Node.js 20+
- **OpenWeather API key** (free tier)

## Step 1: Train the ML Model

```bash
cd ml
pip install -r requirements.txt
python train_model.py
```

This creates:
- `ml/models/weather_lstm.pt`
- `ml/models/scaler.pkl`

## Step 2: Backend Setup

```bash
cd ../backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cat > .env << EOF
SECRET_KEY=dev-secret-key-change-in-production
DATABASE_URL=sqlite+aiosqlite:///./weatherwise.db
ALLOWED_ORIGINS=["http://localhost:3000"]
ML_MODEL_PATH=../ml/models/weather_lstm.pt
ML_SCALER_PATH=../ml/models/scaler.pkl
OPENWEATHER_API_KEY=your-openweather-api-key
EOF

# Start backend
uvicorn app.main:app --reload
```

Backend runs at: http://localhost:8000

## Step 3: Frontend Setup

```bash
cd ../frontend

# Install dependencies
npm install

# Create .env.local
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local

# Start frontend
npm run dev
```

Frontend runs at: http://localhost:3000

## Step 4: Test It Out!

1. Open http://localhost:3000
2. Search for a city (e.g., "London") - works without login
3. Sign up for an account
4. Login and access the Forecast page
5. Get AI-powered 7-day predictions!

## Using Docker (Alternative)

```bash
# From project root
docker-compose up --build
```

This starts both frontend and backend automatically.

## Troubleshooting

**Model not found error:**
- Make sure you trained the model first (Step 1)
- Check that model files exist in `ml/models/`

**Weather API error:**
- Ensure `OPENWEATHER_API_KEY` is set in `backend/.env`
- Check your internet connection
- Verify city name spelling

**CORS errors:**
- Ensure `ALLOWED_ORIGINS` includes `http://localhost:3000`
- Check that frontend `.env.local` has correct `NEXT_PUBLIC_API_URL`

**Database errors:**
- Delete `weatherwise.db` and restart backend (tables auto-create)

## Next Steps

- Read the full [README.md](README.md) for detailed documentation
- Check [DEPLOYMENT.md](DEPLOYMENT.md) for production deployment
- Explore the codebase and customize as needed!

Happy forecasting! 🌤️

