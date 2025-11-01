import type React from "react"
import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import Logo from "../assets/TSAN.png"

export const LoadingScreen: React.FC = () => {
  const navigate = useNavigate()

  useEffect(() => {
    // Simulate loading time before redirecting to photo upload
    const timer = setTimeout(() => {
      navigate("/upload-photo")
    }, 3000)

    return () => clearTimeout(timer)
  }, [navigate])

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
      <div className="text-center">
        <div className="mb-8">
          <img src={Logo} alt="Logo" className="w-48 h-48" />
        </div>
        <p className="text-gray-600 text-lg">Loading dashboard</p>
        <div className="mt-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
        </div>
      </div>
    </div>
  )
}
