import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
// import { Search } from "lucide-react";
import StatCard from "../components/StatCard";
import Pagination from "../components/Pagination";
import { adminAPI } from "@/services/api";
import { Search, X } from "lucide-react";
import Swal from "sweetalert2";

interface pendingStats {
  events: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
  };
  trainings: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
  };
  awards: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
  };
  combined: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
  };
}

export default function RosterPending() {
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [rows, setRows] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All status");
  const [typeFilter, setTypeFilter] = useState("All type");
  const [loading, setLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);
  const [pendingStats, setPendingStats] = useState<pendingStats>({
    events: {
      total: 0,
      pending: 0,
      approved: 0,
      rejected: 0,
    },
    trainings: {
      total: 0,
      pending: 0,
      approved: 0,
      rejected: 0,
    },
    awards: {
      total: 0,
      pending: 0,
      approved: 0,
      rejected: 0,
    },
    combined: {
      total: 0,
      pending: 0,
      approved: 0,
      rejected: 0,
    },
  });
  const [selectedSubmission, setSelectedSubmission] = useState<any | null>(
    null
  );

  const handleSubmissionClick = (submission: any) => {
    setSelectedSubmission(submission);
  };

  const handleCloseModal = () => {
    setSelectedSubmission(null);
  };

  const getPendiningSubmissions = async (page = 1, lim = 10) => {
    try {
      setLoading(true);
      const response = await adminAPI.getPendingInfo(
        `&page=${page}&limit=${lim}`
      );

      if (response && response.status) {
        const p = response.pagination || {};
        const data = response.data || {};

        // Build unified rows array from events, trainings, awards, activityLogs
        const unified: any[] = [];

        const formatDate = (iso?: string | null) => {
          if (!iso) return "-";
          try {
            const d = new Date(iso);
            const day = d.getDate();
            const month = String(d.getMonth() + 1).padStart(2, "0");
            const year = d.getFullYear();
            return `${day}/${month}/${year}`;
          } catch {
            return "-";
          }
        };

        (data.events || []).forEach((e: any) =>
          unified.push({
            id: e._id,
            title: e.title,
            type: "Event",
            submittedBy: e.createdBy?.fullName || "",
            status: e.approved ? "Approved" : "Pending",
            dateSubmitted: formatDate(e.createdAt),
            // Preserve original data for modal
            originalData: e,
            image: e.image,
            description: e.description,
            location: e.location,
            startDate: e.startDate,
            endDate: e.endDate,
          })
        );

        (data.trainings || []).forEach((t: any) =>
          unified.push({
            id: t._id,
            title: t.trainingType,
            type: "Training",
            submittedBy: t.scout?.fullName || "",
            status: t.status || "Pending",
            dateSubmitted: formatDate(t.createdAt),
            // Preserve original data for modal
            originalData: t,
            image: t.certificateUrl,
            certificateUrl: t.certificateUrl,
            trainingDate: t.trainingDate,
            description: t.description,
          })
        );

        (data.awards || []).forEach((a: any) =>
          unified.push({
            id: a._id,
            title: a.awardName,
            type: "Award",
            submittedBy: a.scout?.fullName || "",
            status: a.status || "Pending",
            dateSubmitted: formatDate(a.createdAt),
            // Preserve original data for modal
            originalData: a,
            image: a.certificateUrl,
            certificateUrl: a.certificateUrl,
            awardDate: a.awardDate,
            description: a.description,
          })
        );

        (data.activityLogs || []).forEach((l: any) =>
          unified.push({
            id: l._id,
            title: l.logType,
            type: "Log",
            submittedBy: l.scout?.fullName || "",
            status: l.status || "Pending",
            dateSubmitted: formatDate(l.createdAt),
            // Preserve original data for modal
            originalData: l,
            image: l.image,
            description: l.description,
            logDate: l.logDate,
          })
        );

        setRows(unified);
        setLimit(p.limit ?? lim);
        // totalItems: sum of counts provided (eventsCount, trainingsCount, awardsCount, logsCount) fallback to unified length
        const totalCount =
          (p.eventsCount || 0) +
          (p.trainingsCount || 0) +
          (p.awardsCount || 0) +
          (p.logsCount || 0);
        setTotalItems(totalCount || unified.length);
        setCurrentPage(p.currentPage ?? page);
      }
    } catch (error) {
      console.error("Error fetching pending submissions:", error);
    } finally {
      setLoading(false);
    }
  };

  const getPendingStats = async () => {
    setStatsLoading(true);
    try {
      const response = await adminAPI.getPendingStats();
      if (response.status) {
        console.log("Roster stats response:", response?.data);
        setPendingStats(response?.data);
      }
      // console.log(response);
    } catch (err) {
      console.log("Error fetching roster stats:", err);
    } finally {
      setStatsLoading(false);
    }
  };
  useEffect(() => {
    getPendiningSubmissions(currentPage, limit);
    getPendingStats();
  }, [currentPage, limit]);

  const handleApprove = async (id: string) => {
    try {
      const response = await adminAPI.acceptPendingItems(id);
      console.log("Approve submission:", id);
      if (response?.status === true) {
        Swal.fire({
          icon: "success",
          title: "Success",
          text: "Approved",
        });
      }
    } catch (err: any) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Error Approving",
      });
    }
  };

  const handleReject = async (id: string) => {
    try {
      const response = await adminAPI.declinePendingItems(id);
      console.log("Approve submission:", id);
      if (response?.status === true) {
        Swal.fire({
          icon: "success",
          title: "Success",
          text: "Approved",
        });
      }
    } catch (err: any) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Error Approving",
      });
    }
  };

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Roster</h1>
        <p className="text-gray-600">
          Here you can view and manage all scout members
        </p>
      </div>

      <div className="mb-6 border-b border-gray-200">
        <div className="flex gap-8">
          <Link
            to="/admin/roster"
            className="pb-3 px-1 font-medium text-gray-500 hover:text-gray-700 transition-colors"
          >
            Members
          </Link>
          <button className="pb-3 px-1 font-medium text-gray-900 transition-colors relative flex items-center gap-2">
            Pending items
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatCard
          label="Total Submissions"
          value={pendingStats?.combined?.total}
          loading={statsLoading}
        />
        <StatCard
          label="Pending"
          value={pendingStats?.combined?.pending}
          loading={statsLoading}
        />
        <StatCard
          label="Approved"
          value={pendingStats?.combined?.approved}
          loading={statsLoading}
        />
        <StatCard
          label="Rejected"
          value={pendingStats?.combined?.rejected}
          loading={statsLoading}
        />
      </div>

      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">2000 Submissions</h3>
          </div>
          <div className="flex gap-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option>All status</option>
              <option>Pending</option>
              {/* <option>Approved</option>
              <option>Rejected</option> */}
            </select>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option>All type</option>
              <option>Event</option>
              <option>Training</option>
              <option>Award</option>
              {/* <option>Log</option> */}
            </select>
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Submission
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Scout's name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Section
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Date submitted
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading
                ? Array.from({ length: limit }).map((_, i) => (
                    <tr key={`skeleton-${i}`} className="animate-pulse">
                      <td className="px-6 py-4">
                        <div className="h-4 bg-gray-200 rounded w-3/4" />
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-4 bg-gray-200 rounded w-1/2" />
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-4 bg-gray-200 rounded w-1/3" />
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-4 bg-gray-200 rounded w-1/4" />
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-4 bg-gray-200 rounded w-1/6" />
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-4 bg-gray-200 rounded w-1/6" />
                      </td>
                    </tr>
                  ))
                : rows
                    .filter((r) => {
                      if (
                        statusFilter !== "All status" &&
                        r.status !== statusFilter
                      )
                        return false;
                      if (typeFilter !== "All type" && r.type !== typeFilter)
                        return false;
                      if (
                        search &&
                        !r.title.toLowerCase().includes(search.toLowerCase()) &&
                        !r.submittedBy
                          .toLowerCase()
                          .includes(search.toLowerCase())
                      )
                        return false;
                      return true;
                    })
                    .map((submission) => (
                      <tr key={submission.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-primary font-medium">
                            {submission.title}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {submission.type}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {submission.submittedBy}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          -
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => handleSubmissionClick(submission)}
                            className={`inline-flex items-center gap-1.5 text-sm hover:opacity-80 transition-opacity cursor-pointer ${
                              submission.status === "Approved"
                                ? "text-green-600"
                                : submission.status === "Pending"
                                ? "text-orange-600"
                                : "text-red-600"
                            }`}
                          >
                            <span
                              className={`w-2 h-2 rounded-full ${
                                submission.status === "Approved"
                                  ? "bg-green-600"
                                  : submission.status === "Pending"
                                  ? "bg-orange-600"
                                  : "bg-red-600"
                              }`}
                            />
                            {submission.status}
                          </button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {submission.dateSubmitted}
                        </td>
                      </tr>
                    ))}
            </tbody>
          </table>
        </div>

        <Pagination
          currentPage={currentPage}
          totalPages={Math.max(1, Math.ceil(totalItems / limit))}
          onPageChange={(p) => setCurrentPage(p)}
          totalItems={totalItems}
          itemsPerPage={limit}
        />
      </div>

      <SubmissionModal
        submission={selectedSubmission}
        onClose={handleCloseModal}
        onApprove={handleApprove}
        onReject={handleReject}
      />
    </div>
  );
}

// function SubmissionModal({
//   submission,
//   onClose,
//   onApprove,
//   onReject,
// }: {
//   submission: any | null;
//   onClose: () => void;
//   onApprove: (id: number) => void;
//   onReject: (id: number) => void;
// }) {
//   if (!submission) return null;

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//       <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
//         <div className="flex items-center justify-between p-6 border-b border-gray-200">
//           <h2 className="text-lg font-semibold text-gray-900">
//             {submission.type} View
//           </h2>
//           <button
//             onClick={onClose}
//             className="text-gray-400 hover:text-gray-600 transition-colors"
//           >
//             <X className="w-6 h-6" />
//           </button>
//         </div>
//         <div className="p-6 space-y-4">
//           <div>
//             <p className="text-sm text-gray-600 mb-1">Submission name</p>
//             <p className="text-gray-900 font-medium">{submission.title}</p>
//           </div>
//           <div>
//             <p className="text-sm text-gray-600 mb-1">ID</p>
//             <p className="text-gray-900 font-medium">2021lbE</p>
//           </div>
//           <div>
//             <p className="text-sm text-gray-600 mb-1">Submitted by</p>
//             <p className="text-primary font-medium">{submission.submittedBy}</p>
//           </div>
//           <div className="mt-4">
//             <img
//               src={submission.image || "/placeholder.svg"}
//               alt={submission.title}
//               className="w-full h-40 object-cover rounded-lg"
//             />
//           </div>
//         </div>
//         <div className="flex gap-3 p-6 border-t border-gray-200">
//           <button
//             onClick={() => {
//               onReject(submission.id);
//               onClose();
//             }}
//             className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
//           >
//             Reject
//           </button>
//           <button
//             onClick={() => {
//               onApprove(submission.id);
//               onClose();
//             }}
//             className="flex-1 px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors"
//           >
//             Approve
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

function SubmissionModal({
  submission,
  onClose,
  onApprove,
  onReject,
}: {
  submission: any | null;
  onClose: () => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}) {
  if (!submission) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            {submission.type} View
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="flex items-center gap-8">
            <span className="text-gray-500 font-medium min-w-fit">
              Submission name
            </span>
            <span className="text-gray-900 font-medium">
              {submission.title}
            </span>
          </div>

          <div className="flex items-center gap-8">
            <span className="text-gray-500 font-medium min-w-fit">ID</span>
            <span className="text-gray-900 font-medium">{submission.id}</span>
          </div>

          <div className="flex items-center gap-8">
            <span className="text-gray-500 font-medium min-w-fit">
              Submitted by
            </span>
            <span className="text-[#006400] font-medium">
              {submission.submittedBy}
            </span>
          </div>

          {/* Type-specific information */}
          {submission.type === "Training" && submission.trainingDate && (
            <div className="flex items-center gap-8">
              <span className="text-gray-500 font-medium min-w-fit">
                Training Date
              </span>
              <span className="text-gray-900 font-medium">
                {new Date(submission.trainingDate).toLocaleDateString()}
              </span>
            </div>
          )}

          {submission.type === "Award" && submission.awardDate && (
            <div className="flex items-center gap-8">
              <span className="text-gray-500 font-medium min-w-fit">
                Award Date
              </span>
              <span className="text-gray-900 font-medium">
                {new Date(submission.awardDate).toLocaleDateString()}
              </span>
            </div>
          )}

          {submission.type === "Event" && (
            <>
              {submission.location && (
                <div className="flex items-center gap-8">
                  <span className="text-gray-500 font-medium min-w-fit">
                    Location
                  </span>
                  <span className="text-gray-900 font-medium">
                    {submission.location}
                  </span>
                </div>
              )}
              {submission.startDate && (
                <div className="flex items-center gap-8">
                  <span className="text-gray-500 font-medium min-w-fit">
                    Event Date
                  </span>
                  <span className="text-gray-900 font-medium">
                    {new Date(submission.startDate).toLocaleDateString()}
                    {submission.endDate &&
                      submission.startDate !== submission.endDate &&
                      ` - ${new Date(submission.endDate).toLocaleDateString()}`}
                  </span>
                </div>
              )}
            </>
          )}

          {submission.type === "Log" && submission.logDate && (
            <div className="flex items-center gap-8">
              <span className="text-gray-500 font-medium min-w-fit">
                Log Date
              </span>
              <span className="text-gray-900 font-medium">
                {new Date(submission.logDate).toLocaleDateString()}
              </span>
            </div>
          )}

          {/* Description */}
          {submission.description && (
            <div className="space-y-2">
              <span className="text-gray-500 font-medium">Description</span>
              <p className="text-gray-900">{submission.description}</p>
            </div>
          )}

          {/* Image/Certificate */}
          {(submission.image || submission.certificateUrl) && (
            <div className="mt-6">
              <span className="text-gray-500 font-medium block mb-2">
                {submission.type === "Training" || submission.type === "Award"
                  ? "Certificate"
                  : "Image"}
              </span>
              <img
                src={
                  submission.image ||
                  submission.certificateUrl ||
                  "/placeholder.svg"
                }
                alt={submission.title}
                className="w-full h-64 object-cover rounded-lg"
              />
            </div>
          )}
        </div>

        <div className="flex gap-4 p-6 border-t border-gray-200 justify-end">
          <button
            onClick={() => {
              onReject(submission.id);
              onClose();
            }}
            className="px-12 py-3 bg-[#E7EFE6] text-[#006400] font-semibold rounded-lg hover:bg-gray-200 transition-colors"
          >
            Reject
          </button>
          <button
            onClick={() => {
              onApprove(submission.id);
              onClose();
            }}
            className="px-12 py-3 bg-[#E7EFE6] text-[#006400] font-semibold rounded-lg hover:bg-gray-200 transition-colors"
          >
            Approve
          </button>
        </div>
      </div>
    </div>
  );
}
