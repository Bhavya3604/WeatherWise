"""
WeatherWise ML Model Training Script
Trains an LSTM model for 7-day weather prediction
"""
import os
import sys
from pathlib import Path

import numpy as np
import pandas as pd
import torch
import torch.nn as nn
from sklearn.preprocessing import MinMaxScaler
from torch.utils.data import Dataset, DataLoader

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

# Set random seeds for reproducibility
torch.manual_seed(42)
np.random.seed(42)


class WeatherDataset(Dataset):
    """Dataset for weather time series"""

    def __init__(self, sequences, targets):
        self.sequences = torch.FloatTensor(sequences)
        self.targets = torch.FloatTensor(targets)

    def __len__(self):
        return len(self.sequences)

    def __getitem__(self, idx):
        return self.sequences[idx], self.targets[idx]


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
        # Take the last output
        last_output = lstm_out[:, -1, :]
        output = self.fc(last_output)
        return output


def load_and_preprocess_data(data_path: str, sequence_length: int = 14):
    """Load and preprocess weather data"""
    df = pd.read_csv(data_path)
    df["date"] = pd.to_datetime(df["date"])
    df = df.sort_values("date").reset_index(drop=True)

    # Select features: temp, humidity, precip
    features = df[["temp_c", "humidity", "precip_mm"]].values

    # Normalize features
    scaler = MinMaxScaler()
    features_scaled = scaler.fit_transform(features)

    # Create sequences
    X, y = [], []
    for i in range(len(features_scaled) - sequence_length - 6):
        X.append(features_scaled[i : i + sequence_length])
        # Target: next 7 days (21 values: 7 days * 3 features)
        y.append(features_scaled[i + sequence_length : i + sequence_length + 7].flatten())

    return np.array(X), np.array(y), scaler


def train_model(
    model, train_loader, criterion, optimizer, num_epochs=50, device="cpu"
):
    """Train the LSTM model"""
    model.train()
    for epoch in range(num_epochs):
        total_loss = 0
        for sequences, targets in train_loader:
            sequences, targets = sequences.to(device), targets.to(device)

            optimizer.zero_grad()
            outputs = model(sequences)
            loss = criterion(outputs, targets)
            loss.backward()
            torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)
            optimizer.step()

            total_loss += loss.item()

        if (epoch + 1) % 10 == 0:
            avg_loss = total_loss / len(train_loader)
            print(f"Epoch [{epoch+1}/{num_epochs}], Loss: {avg_loss:.6f}")


def main():
    """Main training function"""
    # Paths
    data_path = Path(__file__).parent / "data" / "sample_weather.csv"
    models_dir = Path(__file__).parent / "models"
    models_dir.mkdir(exist_ok=True)

    model_path = models_dir / "weather_lstm.pt"
    scaler_path = models_dir / "scaler.pkl"

    print("Loading and preprocessing data...")
    X, y, scaler = load_and_preprocess_data(str(data_path), sequence_length=14)

    print(f"Dataset shape: X={X.shape}, y={y.shape}")

    # Split data (80% train, 20% validation)
    split_idx = int(len(X) * 0.8)
    X_train, X_val = X[:split_idx], X[split_idx:]
    y_train, y_val = y[:split_idx], y[split_idx:]

    # Create datasets
    train_dataset = WeatherDataset(X_train, y_train)
    val_dataset = WeatherDataset(X_val, y_val)

    train_loader = DataLoader(train_dataset, batch_size=32, shuffle=True)
    val_loader = DataLoader(val_dataset, batch_size=32, shuffle=False)

    # Initialize model
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"Using device: {device}")

    model = WeatherLSTM(input_size=3, hidden_size=64, num_layers=2, output_size=21)
    model = model.to(device)

    # Training setup
    criterion = nn.MSELoss()
    optimizer = torch.optim.Adam(model.parameters(), lr=0.001)

    print("Training model...")
    train_model(model, train_loader, criterion, optimizer, num_epochs=100, device=device)

    # Validation
    model.eval()
    val_loss = 0
    with torch.no_grad():
        for sequences, targets in val_loader:
            sequences, targets = sequences.to(device), targets.to(device)
            outputs = model(sequences)
            loss = criterion(outputs, targets)
            val_loss += loss.item()

    avg_val_loss = val_loss / len(val_loader)
    print(f"Validation Loss: {avg_val_loss:.6f}")

    # Save model and scaler
    torch.save(model.state_dict(), model_path)
    import pickle

    with open(scaler_path, "wb") as f:
        pickle.dump(scaler, f)

    print(f"Model saved to {model_path}")
    print(f"Scaler saved to {scaler_path}")
    print("Training complete!")


if __name__ == "__main__":
    main()

