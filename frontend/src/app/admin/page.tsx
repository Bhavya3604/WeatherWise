"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Users, Shield, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ProtectedRoute } from "@/components/protected-route"
import { adminApi, authApi } from "@/lib/api"
import { useRouter } from "next/navigation"

interface User {
    id: number
    email: string
    full_name: string
    is_admin: boolean
    created_at: string
}

export default function AdminPage() {
    const [users, setUsers] = useState<User[]>([])
    const [currentUser, setCurrentUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()

    useEffect(() => {
        const checkAdminAndFetchUsers = async () => {
            try {
                const me = await authApi.getMe()
                if (!me.is_admin) {
                    router.push("/forecast")
                    return
                }
                setCurrentUser(me)

                const data = await adminApi.getUsers()
                setUsers(data)
            } catch (err: any) {
                setError("Failed to fetch users")
                if (err.response?.status === 403) {
                    router.push("/forecast")
                }
            } finally {
                setLoading(false)
            }
        }

        checkAdminAndFetchUsers()
    }, [router])

    const handleDeleteUser = async (userId: number) => {
        if (!confirm("Are you sure you want to delete this user?")) return
        try {
            await adminApi.deleteUser(userId)
            setUsers(users.filter(u => u.id !== userId))
        } catch (err) {
            console.error("Failed to delete user", err)
            alert("Failed to delete user")
        }
    }

    if (loading) {
        return <div className="flex h-screen items-center justify-center">Loading...</div>
    }

    return (
        <ProtectedRoute>
            <div className="container mx-auto px-4 py-12">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="mx-auto max-w-6xl"
                >
                    <div className="mb-8 flex items-center gap-4">
                        <Shield className="h-10 w-10 text-blue-600" />
                        <div>
                            <h1 className="text-4xl font-bold text-gray-900">Admin Dashboard</h1>
                            <p className="text-lg text-gray-600">Manage users and system settings</p>
                        </div>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Users className="h-5 w-5" />
                                Registered Users
                            </CardTitle>
                            <CardDescription>List of all users in the system</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {error ? (
                                <div className="text-red-600">{error}</div>
                            ) : (
                                <div className="relative overflow-x-auto">
                                    <table className="w-full text-left text-sm text-gray-500">
                                        <thead className="bg-gray-50 text-xs uppercase text-gray-700">
                                            <tr>
                                                <th scope="col" className="px-6 py-3">ID</th>
                                                <th scope="col" className="px-6 py-3">Email</th>
                                                <th scope="col" className="px-6 py-3">Full Name</th>
                                                <th scope="col" className="px-6 py-3">Role</th>
                                                <th scope="col" className="px-6 py-3">Joined</th>
                                                <th scope="col" className="px-6 py-3">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {users.map((user) => (
                                                <tr key={user.id} className="border-b bg-white">
                                                    <td className="px-6 py-4">{user.id}</td>
                                                    <td className="px-6 py-4 font-medium text-gray-900">{user.email}</td>
                                                    <td className="px-6 py-4">{user.full_name || "-"}</td>
                                                    <td className="px-6 py-4">
                                                        {user.is_admin ? (
                                                            <span className="rounded bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                                                                Admin
                                                            </span>
                                                        ) : (
                                                            <span className="rounded bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
                                                                User
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        {new Date(user.created_at).toLocaleDateString()}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        {currentUser && currentUser.id !== user.id && (
                                                            <Button
                                                                variant="destructive"
                                                                size="sm"
                                                                onClick={() => handleDeleteUser(user.id)}
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </ProtectedRoute>
    )
}
