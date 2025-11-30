import axios from "axios"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

// Add auth token to requests
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
  }
  return config
})

// Auth API
export const authApi = {
  signup: async (email: string, password: string, fullName?: string) => {
    const response = await api.post("/auth/signup", {
      email,
      password,
      full_name: fullName,
    })
    return response.data
  },
  login: async (email: string, password: string) => {
    const formData = new URLSearchParams()
    formData.append("username", email)
    formData.append("password", password)
    const response = await api.post("/auth/login", formData, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    })
    return response.data
  },
  getMe: async () => {
    const response = await api.get("/auth/me")
    return response.data
  },
}

// Admin API
export const adminApi = {
  getUsers: async () => {
    const response = await api.get("/admin/users")
    return response.data
  },
  deleteUser: async (userId: number) => {
    await api.delete(`/admin/users/${userId}`)
  },
}

// Weather API
export const weatherApi = {
  getCurrent: async (city: string) => {
    const response = await api.get(`/api/current?city=${encodeURIComponent(city)}`)
    return response.data
  },
  getPrediction: async (city: string) => {
    const response = await api.get(`/api/predict?city=${encodeURIComponent(city)}`)
    return response.data
  },
}

