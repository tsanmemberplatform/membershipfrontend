import type React from "react"
import { useLocation, useNavigate } from "react-router-dom"
import LogImage from "../assets/LogBookImage.png"

interface Activity {
  id: string
  title: string
  date: string
  location: string
  description: string
  image: string
  status: "Verified" | "Pending" | "Rejected"
}

export const ActivityDetail: React.FC = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const activity = location.state?.activity as Activity

  if (!activity) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Activity not found</p>
        <button onClick={() => navigate("/dashboard/logbook")} className="mt-4 text-green-600 hover:text-green-700">
          Go back to logbook
        </button>
      </div>
    )
  }

  const getStatusBadge = (status: Activity["status"]) => {
    const baseClasses = "px-3 py-1 rounded-full text-sm font-medium"
    switch (status) {
      case "Verified":
        return `${baseClasses} bg-green-100 text-green-800`
      case "Pending":
        return `${baseClasses} bg-yellow-100 text-yellow-800`
      case "Rejected":
        return `${baseClasses} bg-red-100 text-red-800`
      default:
        return baseClasses
    }
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center space-x-2 text-sm text-gray-600">
        <span>Logbook</span>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <span>{activity.title}</span>
      </div>

      {/* Go Back Button */}
      <button
        onClick={() => navigate("/dashboard/logbook")}
        className="flex items-center text-green-600 hover:text-green-700 font-medium"
      >
        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Go Back
      </button>

      {/* Activity Detail */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="flex justify-center p-6">
          <img
            src={activity.image || LogImage}
            alt={activity.title}
            className="max-w-md w-full h-64 object-cover rounded-lg"
          />
        </div>

        <div className="px-6 pb-6">
          <h1 className="text-2xl font-semibold text-gray-900 mb-4">{activity.title}</h1>

          <div className="flex items-center space-x-4 mb-6">
            <div className="flex items-center text-gray-600">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              {activity.date}
            </div>
            <span className={getStatusBadge(activity.status)}>{activity.status}</span>
          </div>

          <div className="prose max-w-none">
            <p className="text-gray-700 leading-relaxed">{activity.description}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
