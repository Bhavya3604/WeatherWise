"use client"

import { motion } from "framer-motion"
import { Brain, Database, Cloud, Server, Shield, Zap } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mx-auto max-w-4xl"
      >
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold text-gray-900">About WeatherWise</h1>
          <p className="text-lg text-gray-600">
            AI-powered weather forecasting using advanced machine learning
          </p>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Brain className="mr-2 h-6 w-6 text-blue-600" />
              How Our ML Model Works
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-700">
              WeatherWise uses a Long Short-Term Memory (LSTM) neural network to predict weather
              conditions for the next 7 days. Our model has been trained on historical weather data
              to learn patterns and trends in temperature, humidity, and precipitation.
            </p>
            <div className="space-y-2">
              <h3 className="font-semibold text-gray-900">Model Architecture:</h3>
              <ul className="list-disc space-y-1 pl-6 text-gray-700">
                <li>
                  <strong>LSTM Layers:</strong> 2 layers with 64 hidden units each, using dropout
                  for regularization
                </li>
                <li>
                  <strong>Input Features:</strong> Temperature, humidity, and precipitation from the
                  past 14 days
                </li>
                <li>
                  <strong>Output:</strong> Predictions for temperature, humidity, and precipitation
                  for the next 7 days (21 values total)
                </li>
                <li>
                  <strong>Training:</strong> Model trained on 365 days of historical weather data
                  with 80/20 train/validation split
                </li>
              </ul>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-gray-900">Prediction Process:</h3>
              <ol className="list-decimal space-y-1 pl-6 text-gray-700">
                <li>Fetch current weather data for the requested city</li>
                <li>Use current conditions as input to the trained LSTM model</li>
                <li>Generate predictions for the next 7 days</li>
                <li>Return formatted results with temperature, humidity, and precipitation</li>
              </ol>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Server className="mr-2 h-6 w-6 text-green-600" />
              System Architecture
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                <h3 className="mb-2 font-semibold text-gray-900">Frontend</h3>
                <ul className="space-y-1 text-sm text-gray-700">
                  <li>• Next.js 16 with React 19</li>
                  <li>• TypeScript for type safety</li>
                  <li>• Tailwind CSS for styling</li>
                  <li>• Framer Motion for animations</li>
                  <li>• Recharts for data visualization</li>
                </ul>
              </div>
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                <h3 className="mb-2 font-semibold text-gray-900">Backend</h3>
                <ul className="space-y-1 text-sm text-gray-700">
                  <li>• FastAPI with async/await</li>
                  <li>• SQLAlchemy for database</li>
                  <li>• JWT authentication</li>
                  <li>• OpenWeatherMap API integration</li>
                  <li>• PyTorch for ML inference</li>
                </ul>
              </div>
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                <h3 className="mb-2 font-semibold text-gray-900">Machine Learning</h3>
                <ul className="space-y-1 text-sm text-gray-700">
                  <li>• PyTorch LSTM model</li>
                  <li>• Scikit-learn for preprocessing</li>
                  <li>• Trained on historical data</li>
                  <li>• Real-time inference</li>
                </ul>
              </div>
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                <h3 className="mb-2 font-semibold text-gray-900">Deployment</h3>
                <ul className="space-y-1 text-sm text-gray-700">
                  <li>• Docker containerization</li>
                  <li>• CI/CD with GitHub Actions</li>
                  <li>• Cloud-ready (AWS/GCP)</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <Shield className="mb-2 h-8 w-8 text-blue-600" />
              <CardTitle>Secure</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                JWT-based authentication with password hashing ensures your data is protected
              </CardDescription>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Zap className="mb-2 h-8 w-8 text-yellow-600" />
              <CardTitle>Fast</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Optimized API endpoints and efficient ML inference for quick responses
              </CardDescription>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Cloud className="mb-2 h-8 w-8 text-indigo-600" />
              <CardTitle>Accurate</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                ML model trained on real weather patterns for reliable predictions
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </div>
  )
}

