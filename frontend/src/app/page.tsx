"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Search, Cloud, Droplets, Wind, Thermometer } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { weatherApi } from "@/lib/api"
import Link from "next/link"

interface WeatherData {
  city: string
  country: string
  fetched_at: string
  metrics: {
    temperature_c: number
    humidity: number
    wind_speed: number
    description: string
    icon: string
  }
}

export default function HomePage() {
  const [city, setCity] = useState("")
  const [loading, setLoading] = useState(false)
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSearch = async () => {
    if (!city.trim()) return

    setLoading(true)
    setError(null)
    try {
      const data = await weatherApi.getCurrent(city)
      setWeather(data)
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to fetch weather data")
      setWeather(null)
    } finally {
      setLoading(false)
    }
  }

  const getWeatherBackground = (icon: string) => {
    if (icon.startsWith('01')) return 'from-blue-400 to-blue-200'
    if (icon.startsWith('02') || icon.startsWith('03')) return 'from-blue-300 to-gray-200'
    if (icon.startsWith('04')) return 'from-gray-400 to-gray-200'
    if (icon.startsWith('09') || icon.startsWith('10')) return 'from-blue-700 to-gray-400'
    if (icon.startsWith('11')) return 'from-indigo-900 to-gray-800'
    if (icon.startsWith('13')) return 'from-blue-100 to-white'
    if (icon.startsWith('50')) return 'from-gray-400 to-gray-300'
    return 'from-blue-50 to-indigo-100'
  }

  const bgGradient = weather ? getWeatherBackground(weather.metrics.icon) : "from-blue-50 to-indigo-100"

  return (
    <>
      <div className={`fixed inset-0 -z-10 bg-gradient-to-br ${bgGradient} transition-all duration-1000`} />
      <div className="container mx-auto px-4 py-12 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-4xl"
        >
          <div className="mb-12 text-center">
            <h1 className="mb-4 text-5xl font-bold text-gray-900">
              WeatherWise
            </h1>
            <p className="text-xl text-gray-600">
              Real-time weather data and AI-powered 7-day forecasts
            </p>
          </div>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Search Current Weather</CardTitle>
              <CardDescription>Enter a city name to get real-time weather information</CardDescription>
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
                  {loading ? "Searching..." : "Search"}
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

          {weather && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>
                      {weather.city}, {weather.country}
                    </span>
                    <img
                      src={`https://openweathermap.org/img/w/${weather.metrics.icon}.png`}
                      alt={weather.metrics.description}
                      className="h-16 w-16"
                    />
                  </CardTitle>
                  <CardDescription className="text-lg capitalize">
                    {weather.metrics.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div className="flex items-center space-x-3 rounded-lg bg-blue-50 p-4">
                      <Thermometer className="h-8 w-8 text-blue-600" />
                      <div>
                        <p className="text-sm text-gray-600">Temperature</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {weather.metrics.temperature_c}°C
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 rounded-lg bg-green-50 p-4">
                      <Droplets className="h-8 w-8 text-green-600" />
                      <div>
                        <p className="text-sm text-gray-600">Humidity</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {weather.metrics.humidity}%
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 rounded-lg bg-purple-50 p-4">
                      <Wind className="h-8 w-8 text-purple-600" />
                      <div>
                        <p className="text-sm text-gray-600">Wind Speed</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {weather.metrics.wind_speed} m/s
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-12 text-center"
          >
            <Card className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
              <CardHeader>
                <CardTitle className="text-white">Unlock AI-Powered Forecasts</CardTitle>
                <CardDescription className="text-blue-100">
                  Sign up to access our advanced 7-day weather predictions powered by machine learning
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/signup">
                  <Button size="lg" variant="outline" className="bg-white text-blue-600 hover:bg-blue-50">
                    Get Started Free
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </>
  )
}
