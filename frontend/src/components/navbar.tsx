"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { Cloud, LogOut, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { isAuthenticated, removeToken } from "@/lib/auth"

export function Navbar() {
  const router = useRouter()
  const pathname = usePathname()
  const [authenticated, setAuthenticated] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    const isAuth = isAuthenticated()
    setAuthenticated(isAuth)

    const checkAdmin = async () => {
      if (isAuth) {
        try {
          const user = await import("@/lib/api").then(m => m.authApi.getMe())
          setIsAdmin(user.is_admin)
        } catch (e) {
          console.error("Failed to fetch user profile", e)
        }
      }
    }
    checkAdmin()
  }, [pathname])

  const handleLogout = () => {
    removeToken()
    router.push("/")
    router.refresh()
  }

  return (
    <nav className="border-b border-gray-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-8">
            <Link href="/" className="flex items-center space-x-2">
              <Cloud className="h-6 w-6 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">WeatherWise</span>
            </Link>
            <div className="hidden space-x-4 md:flex">
              <Link
                href="/"
                className="text-gray-700 hover:text-blue-600 transition-colors"
              >
                Home
              </Link>
              {authenticated && (
                <Link
                  href="/forecast"
                  className="text-gray-700 hover:text-blue-600 transition-colors"
                >
                  Forecast
                </Link>
              )}
              {isAdmin && (
                <Link
                  href="/admin"
                  className="text-gray-700 hover:text-blue-600 transition-colors"
                >
                  Admin
                </Link>
              )}
              <Link
                href="/about"
                className="text-gray-700 hover:text-blue-600 transition-colors"
              >
                About
              </Link>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {authenticated ? (
              <>
                <Link href="/forecast">
                  <Button variant="default" size="sm">
                    <User className="mr-2 h-4 w-4" />
                    Dashboard
                  </Button>
                </Link>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    Login
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button variant="default" size="sm">
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

