# WeatherWise 🌤️

A production-grade, cloud-ready web application providing real-time weather data and AI-powered 7-day weather forecasts using machine learning.

## Features

- 🌍 **Real-time Weather**: Search and view current weather for any city (public access)
- 🤖 **AI Predictions**: 7-day weather forecasts powered by LSTM neural networks (authenticated users only)
- 🔐 **User Authentication**: Secure JWT-based authentication system
- 📊 **Data Visualization**: Interactive charts and modern UI with Tailwind CSS
- 🚀 **Cloud Ready**: Dockerized with CI/CD pipeline for AWS/GCP deployment

## Tech Stack

### Frontend
- **Next.js 16** with React 19
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **Recharts** for data visualization
- **ShadCN UI** components

### Backend
- **FastAPI** with async/await
- **SQLAlchemy** for database ORM
- **JWT** authentication
- **OpenWeather API** integration (requires free API key)
- **PyTorch** for ML inference

### Machine Learning
- **PyTorch LSTM** model
- **Scikit-learn** for preprocessing
- Trained on historical weather data

## Project Structure

```
WeatherWise/
├── backend/              # FastAPI backend
│   ├── app/
│   │   ├── api/         # API routes
│   │   ├── core/        # Configuration and security
│   │   ├── db/          # Database models and schemas
│   │   ├── ml/          # ML prediction service
│   │   └── services/    # External service clients
│   └── requirements.txt
├── frontend/            # Next.js frontend
│   ├── src/
│   │   ├── app/         # Next.js app router pages
│   │   ├── components/  # React components
│   │   └── lib/         # Utilities and API clients
│   └── package.json
├── ml/                  # Machine learning pipeline
│   ├── data/            # Training dataset
│   ├── models/          # Trained model artifacts
│   └── train_model.py   # Training script
├── docker-compose.yml   # Local development setup
└── README.md
```

## Prerequisites

- Python 3.11+
- Node.js 20+
- npm or yarn
- **OpenWeather API key** (free tier available at https://openweathermap.org/api)

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd WeatherWise
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env
# Edit .env and set OPENWEATHER_API_KEY from your OpenWeather account

# Run database migrations (creates tables automatically on first run)
# No manual migration needed - tables are created on startup
```

### 3. Machine Learning Model Training

```bash
cd ../ml

# Install ML dependencies
pip install -r requirements.txt

# Train the model
python train_model.py

# This will create:
# - ml/models/weather_lstm.pt (trained model)
# - ml/models/scaler.pkl (preprocessing scaler)
```

**Note**: The model must be trained before the backend can serve predictions.

### 4. Frontend Setup

```bash
cd ../frontend

# Install dependencies
npm install

# Create .env.local file
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local
```

### 5. Run Locally

#### Option A: Docker Compose (Recommended)

```bash
# From project root
docker-compose up --build
```

This will start:
- Backend at `http://localhost:8000`
- Frontend at `http://localhost:3000`

#### Option B: Manual Start

**Terminal 1 - Backend:**
```bash
cd backend
source venv/bin/activate  # On Windows: venv\Scripts\activate
uvicorn app.main:app --reload
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

## API Endpoints

### Public Endpoints

- `GET /api/current?city={city}` - Get current weather for a city

### Authentication Endpoints

- `POST /auth/signup` - Create new user account
- `POST /auth/login` - Login and get JWT token
- `GET /auth/me` - Get current user profile (requires auth)

### Protected Endpoints

- `GET /api/predict?city={city}` - Get 7-day AI weather prediction (requires auth)

## Environment Variables

### Backend (.env)

```env
APP_NAME=WeatherWise API
ENVIRONMENT=development
SECRET_KEY=your-secret-key-here
DATABASE_URL=sqlite+aiosqlite:///./weatherwise.db
OPENWEATHER_API_KEY=your-openweather-api-key
ALLOWED_ORIGINS=["http://localhost:3000"]
ML_MODEL_PATH=ml/models/weather_lstm.pt
ML_SCALER_PATH=ml/models/scaler.pkl
```

### Frontend (.env.local)

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Machine Learning Model

### Model Architecture

- **Type**: LSTM (Long Short-Term Memory) Neural Network
- **Layers**: 2 LSTM layers with 64 hidden units each
- **Input**: 14 days of historical weather data (temperature, humidity, precipitation)
- **Output**: 7-day predictions (21 values: 7 days × 3 features)
- **Training**: 365 days of historical data, 80/20 train/validation split

### Training the Model

```bash
cd ml
python train_model.py
```

The training script will:
1. Load and preprocess the dataset
2. Create sequences for time-series learning
3. Train the LSTM model
4. Save the model and scaler to `ml/models/`

### Prediction Process

1. Fetch current weather from OpenWeatherMap API
2. Use current conditions as input to the trained model
3. Generate 7-day predictions
4. Return formatted JSON response

## Deployment

### AWS Deployment

#### Frontend (S3 + CloudFront)

1. Build the frontend:
```bash
cd frontend
npm run build
```

2. Upload `out/` directory to S3 bucket
3. Configure CloudFront distribution
4. Set environment variables in CloudFront

#### Backend (Lambda/EC2)

**Option 1: Lambda + API Gateway**
- Package backend as Lambda function
- Configure API Gateway
- Set environment variables

**Option 2: EC2**
- Deploy Docker container to EC2
- Use Application Load Balancer
- Configure security groups

### GCP Deployment

#### Frontend (Cloud Storage)

1. Build and export:
```bash
cd frontend
npm run build
```

2. Upload to Cloud Storage bucket
3. Configure load balancer

#### Backend (Cloud Run)

1. Build and push Docker image:
```bash
docker build -t gcr.io/PROJECT_ID/weatherwise-backend ./backend
docker push gcr.io/PROJECT_ID/weatherwise-backend
```

2. Deploy to Cloud Run:
```bash
gcloud run deploy weatherwise-backend \
  --image gcr.io/PROJECT_ID/weatherwise-backend \
  --platform managed \
  --region us-central1
```

## CI/CD Pipeline

The project includes a GitHub Actions workflow (`.github/workflows/ci.yml`) that:

- Runs backend linting and tests
- Runs frontend linting and build
- Trains ML model (optional)
- Builds Docker images on main branch

## Development

### Running Tests

```bash
# Backend tests
cd backend
pytest tests/ -v

# Frontend linting
cd frontend
npm run lint
```

### Database

The application uses SQLite by default (development). For production, update `DATABASE_URL` to use PostgreSQL or another database.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License

## Support

For issues and questions, please open an issue on GitHub.

---

Built with ❤️ using Next.js, FastAPI, and PyTorch

