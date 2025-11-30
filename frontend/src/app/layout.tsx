import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Navbar } from "@/components/navbar"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "WeatherWise - AI-Powered Weather Forecasting",
  description: "Get real-time weather and AI-powered 7-day forecasts",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="fixed inset-0 -z-20 bg-gradient-to-br from-blue-50 to-indigo-100" />
        <Navbar />
        <main className="min-h-screen relative">
          {children}
        </main>
      </body>
    </html>
  )
}
