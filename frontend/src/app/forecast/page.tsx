"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Search, Calendar, Droplets, Thermometer, CloudRain } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ProtectedRoute } from "@/components/protected-route"
import { weatherApi } from "@/lib/api"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"

interface PredictionDay {
  day: number
  temperature_c: number
  humidity: number
  precipitation_mm: number
}

interface PredictionData {
  city: string
  country: string
  predictions: PredictionDay[]
}

export default function ForecastPage() {
  const [city, setCity] = useState("")
  const [loading, setLoading] = useState(false)
  const [prediction, setPrediction] = useState<PredictionData | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSearch = async () => {
    if (!city.trim()) return

    setLoading(true)
    setError(null)
    try {
      const data = await weatherApi.getPrediction(city)
      setPrediction(data)
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to fetch prediction")
      setPrediction(null)
    } finally {
      setLoading(false)
    }
  }

  const chartData = prediction
    ? prediction.predictions.map((p) => ({
        day: `Day ${p.day}`,
        temperature: p.temperature_c,
        humidity: p.humidity,
        precipitation: p.precipitation_mm,
      }))
    : []

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-6xl"
        >
          <div className="mb-8 text-center">
            <h1 className="mb-2 text-4xl font-bold text-gray-900">AI Weather Forecast</h1>
            <p className="text-lg text-gray-600">
              Get 7-day predictions powered by machine learning
            </p>
          </div>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Search Forecast</CardTitle>
              <CardDescription>Enter a city name to get AI-powered 7-day weather predictions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter city name (e.g., London, New York)"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="flex-1"
                />
                <Button onClick={handleSearch} disabled={loading}>
                  <Search className="mr-2 h-4 w-4" />
                  {loading ? "Predicting..." : "Get Forecast"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-4 rounded-md bg-red-50 p-4 text-red-800"
            >
              {error}
            </motion.div>
          )}

          {prediction && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle>
                    {prediction.city}, {prediction.country}
                  </CardTitle>
                  <CardDescription>7-Day AI Weather Forecast</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip />
                      <Legend />
                      <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="temperature"
                        stroke="#3b82f6"
                        name="Temperature (°C)"
                        strokeWidth={2}
                      />
                      <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="humidity"
                        stroke="#10b981"
                        name="Humidity (%)"
                        strokeWidth={2}
                      />
                      <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="precipitation"
                        stroke="#8b5cf6"
                        name="Precipitation (mm)"
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {prediction.predictions.map((day, index) => (
                  <motion.div
                    key={day.day}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between text-lg">
                          <span className="flex items-center">
                            <Calendar className="mr-2 h-5 w-5" />
                            Day {day.day}
                          </span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <Thermometer className="h-5 w-5 text-blue-600" />
                          <span className="text-sm text-gray-600">Temperature:</span>
                          <span className="font-semibold">{day.temperature_c}°C</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Droplets className="h-5 w-5 text-green-600" />
                          <span className="text-sm text-gray-600">Humidity:</span>
                          <span className="font-semibold">{day.humidity}%</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <CloudRain className="h-5 w-5 text-purple-600" />
                          <span className="text-sm text-gray-600">Precipitation:</span>
                          <span className="font-semibold">{day.precipitation_mm}mm</span>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </ProtectedRoute>
  )
}

