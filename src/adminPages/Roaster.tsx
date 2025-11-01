import { useState } from "react"
import { Search, ChevronDown, ChevronRight } from "lucide-react"
import { mockScouts } from "../data/mockData"
import type { Scout } from "../types"
import { useNavigate } from "react-router-dom"

export default function Roster() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<"members" | "pending">("members")
  const [statusFilter, setStatusFilter] = useState("All status")
  const [sectionFilter, setSectionFilter] = useState("All section")
  const [stateFilter, setStateFilter] = useState("All states")
  const [searchTerm, setSearchTerm] = useState("")

  const stats = {
    totalScouts: 2000,
    activeScouts: 1800,
    suspendedScouts: 200,
  }

  const filteredScouts = mockScouts.filter((scout) => {
    const matchesStatus = statusFilter === "All status" || scout.status === statusFilter
    const matchesSection = sectionFilter === "All section" || scout.section === sectionFilter
    const matchesSearch =
      scout.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      scout.memberId.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesStatus && matchesSection && matchesSearch
  })

  const handleScoutClick = (scout: Scout) => {
    navigate(`/admin/roster/member/${scout.id}`)
  }

  const getStatusBadge = (status: string) => {
    const baseClasses = "status-badge flex items-center"
    switch (status) {
      case "Active":
        return `${baseClasses} status-active`
      case "Suspended":
        return `${baseClasses} status-suspended`
      default:
        return baseClasses
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Roster</h1>
        <p className="text-gray-600 mt-1">Here you can view and manage all scout members</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab("members")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "members"
                ? "border-success-600 text-success-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Members
          </button>
          <button
            onClick={() => setActiveTab("pending")}
            className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center ${
              activeTab === "pending"
                ? "border-success-600 text-success-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Pending Items
            <span className="ml-2 bg-warning-100 text-warning-800 text-xs font-medium px-2 py-0.5 rounded-full">•</span>
          </button>
        </nav>
      </div>

      {activeTab === "members" && (
        <>
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Total scouts</h3>
              <p className="text-3xl font-bold text-gray-900">{stats.totalScouts.toLocaleString()}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Active scouts</h3>
              <p className="text-3xl font-bold text-gray-900">{stats.activeScouts.toLocaleString()}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Suspended scouts</h3>
              <p className="text-3xl font-bold text-gray-900">{stats.suspendedScouts.toLocaleString()}</p>
            </div>
          </div>

          {/* Scouts Table */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">2000 Scouts</h2>

              {/* Filters and Search */}
              <div className="flex flex-wrap gap-4 items-center">
                <div className="relative">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option>All status</option>
                    <option>Active</option>
                    <option>Suspended</option>
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>

                <div className="relative">
                  <select
                    value={sectionFilter}
                    onChange={(e) => setSectionFilter(e.target.value)}
                    className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option>All section</option>
                    <option>Scout</option>
                    <option>Cub</option>
                    <option>Rover</option>
                    <option>Adults/Volunteers</option>
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>

                <div className="relative">
                  <select
                    value={stateFilter}
                    onChange={(e) => setStateFilter(e.target.value)}
                    className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option>All states</option>
                    <option>Akwa Ibom</option>
                    <option>Lagos</option>
                    <option>Abuja</option>
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>

                <div className="flex-1 max-w-md relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by name, ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                <button className="bg-success-600 text-white p-2 rounded-lg hover:bg-success-700 transition-colors">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Member ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Scouting Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Section
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      State
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredScouts.map((scout) => (
                    <tr
                      key={scout.id}
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => handleScoutClick(scout)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-success-600 font-medium">{scout.name}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{scout.memberId}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{scout.scoutingRole}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{scout.section}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{scout.state}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={getStatusBadge(scout.status)}>
                          <div
                            className={`w-2 h-2 rounded-full mr-2 ${
                              scout.status === "Active" ? "bg-success-500" : "bg-danger-500"
                            }`}
                          ></div>
                          {scout.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-700">Showing 1 to 20 of 2000 scouts</div>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-700">1 / 10</span>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-700">Go to:</span>
                  <input
                    type="number"
                    className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
                    defaultValue={1}
                  />
                  <button className="btn btn-primary text-sm">Go</button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {activeTab === "pending" && (
        <div className="bg-white p-8 rounded-lg shadow-sm text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Pending Items</h2>
          <p className="text-gray-600">No pending items at the moment.</p>
        </div>
      )}
    </div>
  )
}
