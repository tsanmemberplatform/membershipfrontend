import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { ArrowLeft, ChevronDown } from "lucide-react"
import { mockScoutProfile, mockActivityLogs } from "../data/mockData"
import ProfileModal from "../components/ProfileModal"
import Swal from "sweetalert2"

export default function MemberDetail() {
  // const { id } = useParams()
  const navigate = useNavigate()
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [showManageDropdown, setShowManageDropdown] = useState(false)

  // In a real app, you'd fetch the scout data based on the ID
  const scout = mockScoutProfile

  const handleGoBack = () => {
    navigate("/roster")
  }

  const handleSuspend = async () => {
    const result = await Swal.fire({
      title: "Suspend Scout",
      text: "Are you sure you want to suspend this scout member? This action can be reversed later.",
      showCancelButton: true,
      confirmButtonText: "Yes, suspend",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      customClass: {
        popup: "rounded-lg",
        confirmButton: "btn btn-danger",
        cancelButton: "btn btn-secondary",
      },
    })

    if (result.isConfirmed) {
      await Swal.fire({
        title: "Scout Suspended",
        text: "The scout member has been suspended successfully.",
        icon: "success",
        confirmButtonText: "OK",
        confirmButtonColor: "#16a34a",
        customClass: {
          popup: "rounded-lg",
          confirmButton: "btn btn-success",
        },
      })
      setShowManageDropdown(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const baseClasses = "status-badge flex items-center"
    switch (status) {
      case "Verified":
        return `${baseClasses} status-verified`
      case "Pending":
        return `${baseClasses} status-pending`
      case "Rejected":
        return `${baseClasses} status-rejected`
      default:
        return baseClasses
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <button onClick={handleGoBack} className="flex items-center text-success-600 hover:text-success-700 mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Go Back
        </button>

        <h1 className="text-2xl font-bold text-gray-900">Roster</h1>
        <p className="text-gray-600 mt-1">Here you can view and manage all scout members</p>
      </div>

      {/* Scout Profile Card */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-success-600 rounded-full flex items-center justify-center">
              <div className="w-12 h-12 bg-success-700 rounded-full"></div>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {scout.fullName}
              </h2>
              <div className="flex items-center space-x-4 mt-1">
                <span className="text-sm text-gray-600">ID: {scout.membershipId}</span>
                <span className="status-badge status-active">
                  <div className="w-2 h-2 rounded-full bg-success-500 mr-2"></div>
                  {scout.status}
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-1">{scout.scoutingRole}</p>
            </div>
          </div>

          <div className="relative">
            <button
              onClick={() => setShowManageDropdown(!showManageDropdown)}
              className="flex items-center space-x-2 text-success-600 hover:text-success-700 font-medium"
            >
              <span>Manage scout</span>
              <ChevronDown className="w-4 h-4" />
            </button>

            {showManageDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                <button
                  onClick={() => {
                    setShowProfileModal(true)
                    setShowManageDropdown(false)
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-t-lg"
                >
                  Profile
                </button>
                <button
                  onClick={handleSuspend}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-b-lg"
                >
                  Suspend
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Activity Logs */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Activity logs (20)</h3>
          <button className="text-success-600 hover:text-success-700 font-medium">View more</button>
        </div>

        <div className="divide-y divide-gray-200">
          {mockActivityLogs.map((log) => (
            <div key={log.id} className="p-6 flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900">{log.activity}</h4>
                <p className="text-sm text-gray-600 mt-1">{log.date}</p>
              </div>
              <span className={getStatusBadge(log.status)}>
                <div
                  className={`w-2 h-2 rounded-full mr-2 ${
                    log.status === "Verified"
                      ? "bg-success-500"
                      : log.status === "Pending"
                        ? "bg-warning-500"
                        : "bg-danger-500"
                  }`}
                ></div>
                {log.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Profile Modal */}
      {showProfileModal && <ProfileModal scout={scout} onClose={() => setShowProfileModal(false)} />}
    </div>
  )
}