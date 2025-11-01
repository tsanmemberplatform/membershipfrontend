import { useState } from "react"
import { Search, ChevronDown, ChevronRight } from "lucide-react"
import { mockSubmissions } from "../data/mockData"
import type { Submission } from "../types"
import SubmissionModal from "../components/SubmissionModal"

export default function Dashboard() {
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null)
  const [statusFilter, setStatusFilter] = useState("All status")
  const [typeFilter, setTypeFilter] = useState("All type")
  const [sectionFilter, setSectionFilter] = useState("All section")
  const [searchTerm, setSearchTerm] = useState("")
  // const [currentPage, setCurrentPage] = useState(1)

  const stats = {
    totalSubmissions: 2000,
    pending: 200,
    verified: 1600,
    rejected: 200,
  }

  const filteredSubmissions = mockSubmissions.filter((submission) => {
    const matchesStatus = statusFilter === "All status" || submission.status === statusFilter
    const matchesType = typeFilter === "All type" || submission.type === typeFilter
    const matchesSearch =
      submission.submittedBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
      submission.name.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesStatus && matchesType && matchesSearch
  })

  const handleSubmissionClick = (submission: Submission) => {
    setSelectedSubmission(submission)
  }

  const handleCloseModal = () => {
    setSelectedSubmission(null)
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
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Total Submissions</h3>
          <p className="text-3xl font-bold text-gray-900">{stats.totalSubmissions.toLocaleString()}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Pending</h3>
          <p className="text-3xl font-bold text-gray-900">{stats.pending.toLocaleString()}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Verified</h3>
          <p className="text-3xl font-bold text-gray-900">{stats.verified.toLocaleString()}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Rejected</h3>
          <p className="text-3xl font-bold text-gray-900">{stats.rejected.toLocaleString()}</p>
        </div>
      </div>

      {/* Submissions Table */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">2000 Submissions</h2>

          {/* Filters and Search */}
          <div className="flex flex-wrap gap-4 items-center">
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option>All status</option>
                <option>Verified</option>
                <option>Pending</option>
                <option>Rejected</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>

            <div className="relative">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option>All type</option>
                <option>Activity log</option>
                <option>Certificate</option>
                <option>Awards</option>
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
              </select>
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>

            <div className="flex-1 max-w-md relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name..."
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
                  Submission
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Scouting Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date submitted
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredSubmissions.map((submission) => (
                <tr
                  key={submission.id}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleSubmissionClick(submission)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-success-600 font-medium">{submission.name}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{submission.type}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-success-600 font-medium">{submission.submittedBy}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{submission.scoutingRole}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={getStatusBadge(submission.status)}>
                      <div
                        className={`w-2 h-2 rounded-full mr-2 ${
                          submission.status === "Verified"
                            ? "bg-success-500"
                            : submission.status === "Pending"
                              ? "bg-warning-500"
                              : "bg-danger-500"
                        }`}
                      ></div>
                      {submission.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{submission.dateSubmitted}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-700">Showing 1 to 20 of 2000 submission</div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-700">1 / 10</span>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-700">Go to:</span>
              <input type="number" className="w-16 px-2 py-1 border border-gray-300 rounded text-sm" defaultValue={1} />
              <button className="btn btn-primary text-sm">Go</button>
            </div>
          </div>
        </div>
      </div>

      {/* Submission Modal */}
      {selectedSubmission && <SubmissionModal submission={selectedSubmission} onClose={handleCloseModal} />}
    </div>
  )
}
