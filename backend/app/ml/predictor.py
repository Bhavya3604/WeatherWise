"""
ML Weather Prediction Service
Loads trained model and generates 7-day forecasts
"""
import pickle
from pathlib import Path
from typing import List

import numpy as np
import torch
import torch.nn as nn

from app.core.config import settings


class WeatherLSTM(nn.Module):
    """LSTM model for weather prediction"""

    def __init__(self, input_size=3, hidden_size=64, num_layers=2, output_size=21):
        super(WeatherLSTM, self).__init__()
        self.hidden_size = hidden_size
        self.num_layers = num_layers

        self.lstm = nn.LSTM(
            input_size, hidden_size, num_layers, batch_first=True, dropout=0.2
        )
        self.fc = nn.Linear(hidden_size, output_size)

    def forward(self, x):
        lstm_out, _ = self.lstm(x)
        last_output = lstm_out[:, -1, :]
        output = self.fc(last_output)
        return output


class WeatherPredictor:
    """Weather prediction service"""

    def __init__(self):
        self.model = None
        self.scaler = None
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self._load_model()

    def _load_model(self):
        """Load trained model and scaler"""
        # Resolve paths - try relative to backend, then absolute
        base_path = Path(__file__).parent.parent.parent  # Go to project root
        model_path = (base_path / settings.ml_model_path.lstrip("../")).resolve()
        scaler_path = (base_path / settings.ml_scaler_path.lstrip("../")).resolve()
        
        # Fallback to direct path if not found
        if not model_path.exists():
            model_path = Path(settings.ml_model_path).resolve()
        if not scaler_path.exists():
            scaler_path = Path(settings.ml_scaler_path).resolve()

        if not model_path.exists() or not scaler_path.exists():
            raise FileNotFoundError(
                f"Model files not found. Train the model first: {model_path}, {scaler_path}"
            )

        # Load scaler
        with open(scaler_path, "rb") as f:
            self.scaler = pickle.load(f)

        # Load model
        self.model = WeatherLSTM(input_size=3, hidden_size=64, num_layers=2, output_size=21)
        self.model.load_state_dict(torch.load(model_path, map_location=self.device))
        self.model.eval()
        self.model = self.model.to(self.device)

    def predict(
        self, current_temp: float, current_humidity: float, current_precip: float
    ) -> List[dict]:
        """
        Predict next 7 days of weather

        Args:
            current_temp: Current temperature in Celsius
            current_humidity: Current humidity percentage
            current_precip: Current precipitation in mm

        Returns:
            List of 7 day predictions with temp, humidity, precip
        """
        # Create a simple sequence from current values (repeat for sequence length)
        sequence_length = 14
        sequence = np.array([[current_temp, current_humidity, current_precip]] * sequence_length)

        # Normalize
        sequence_scaled = self.scaler.transform(sequence)

        # Convert to tensor
        sequence_tensor = torch.FloatTensor(sequence_scaled).unsqueeze(0).to(self.device)

        # Predict
        with torch.no_grad():
            prediction = self.model(sequence_tensor)
            prediction = prediction.cpu().numpy()[0]

        # Reshape: 21 values -> 7 days * 3 features
        prediction_reshaped = prediction.reshape(7, 3)

        # Denormalize
        prediction_denorm = self.scaler.inverse_transform(prediction_reshaped)

        # Format results
        results = []
        for day in range(7):
            results.append(
                {
                    "day": day + 1,
                    "temperature_c": round(float(prediction_denorm[day][0]), 2),
                    "humidity": round(float(prediction_denorm[day][1]), 2),
                    "precipitation_mm": round(float(max(0, prediction_denorm[day][2])), 2),
                }
            )

        return results


# Global predictor instance
_predictor_instance = None


def get_predictor() -> WeatherPredictor:
    """Get or create predictor instance"""
    global _predictor_instance
    if _predictor_instance is None:
        _predictor_instance = WeatherPredictor()
    return _predictor_instance

