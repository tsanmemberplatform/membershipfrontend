import { useEffect, useState } from "react";
import { adminAPI } from "@/services/api";

// interface AuditLogEntry {
//   id: string;
//   user: string;
//   action: string;
//   timestamp: string;
// }

interface AuditLogInfo {
  _id: string;
  changedBy: string;
  field: string;
  timestamp: string;
}

// const mockAuditLogs: AuditLogEntry[] = [
//   {
//     id: "1",
//     user: "Chiroma Bisi Adamu",
//     action: "Exported report",
//     timestamp: "09/09/2025 13:45pm",
//   },
//   {
//     id: "2",
//     user: "Chiroma Bisi Adamu",
//     action: "Created an event",
//     timestamp: "09/09/2025 13:45pm",
//   },
//   {
//     id: "3",
//     user: "Samira Zainab",
//     action: "Approved a scout event",
//     timestamp: "09/09/2025 13:45pm",
//   },
//   {
//     id: "4",
//     user: "Omar Abdul",
//     action: "Rejected a scout activity log",
//     timestamp: "09/09/2025 13:45pm",
//   },
//   {
//     id: "5",
//     user: "Fatima Junaid",
//     action: "Update a scout profile",
//     timestamp: "09/09/2025 13:45pm",
//   },
//   {
//     id: "6",
//     user: "David Okoro",
//     action: "Suspended a scout account",
//     timestamp: "09/09/2025 13:45pm",
//   },
//   {
//     id: "7",
//     user: "Nina Kaur",
//     action: "Rejected a scout certificate",
//     timestamp: "09/09/2025 13:45pm",
//   },
//   {
//     id: "8",
//     user: "Liam Chen",
//     action: "Rejected a scout event",
//     timestamp: "09/09/2025 13:45pm",
//   },
//   {
//     id: "9",
//     user: "Sofia Rodriguez",
//     action: "Rejected a scout award",
//     timestamp: "09/09/2025 13:45pm",
//   },
//   {
//     id: "10",
//     user: "Jamal Khan",
//     action: "Approved a scout award",
//     timestamp: "09/09/2025 13:45pm",
//   },
//   {
//     id: "11",
//     user: "Emily Smith",
//     action: "Added a user",
//     timestamp: "09/09/2025 13:45pm",
//   },
//   {
//     id: "12",
//     user: "Mark Johnson",
//     action: "Deleted a user",
//     timestamp: "09/09/2025 13:45pm",
//   },
//   {
//     id: "13",
//     user: "Aisha Patel",
//     action: "Exported attendees",
//     timestamp: "09/09/2025 13:45pm",
//   },
// ];

// Format timestamp to `DD/MM/YYYY HH:MMam/pm` (example: 09/09/2025 13:45pm)
const formatTimestamp = (input: string) => {
  if (!input) return "";
  const s = String(input).trim();

  // If it already matches DD/MM/YYYY HH:MM with optional am/pm, normalize and return
  const desiredRe =
    /^(\d{2})\/(\d{2})\/(\d{4})\s+(\d{1,2}):(\d{2})(?:\s*(am|pm))?$/i;
  const m = s.match(desiredRe);
  if (m) {
    const dd = m[1];
    const mm = m[2];
    const yyyy = m[3];
    const hhNum = parseInt(m[4], 10);
    const mins = m[5];
    const ampm = m[6] ? m[6].toLowerCase() : hhNum >= 12 ? "pm" : "am";
    const hh = String(hhNum).padStart(2, "0");
    return `${dd}/${mm}/${yyyy} ${hh}:${mins}${ampm}`;
  }

  // Try to parse as Date (ISO or other parseable strings)
  const d = new Date(s);
  if (!isNaN(d.getTime())) {
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    const hhNum = d.getHours();
    const hh = String(hhNum).padStart(2, "0");
    const mins = String(d.getMinutes()).padStart(2, "0");
    const ampm = hhNum >= 12 ? "pm" : "am";
    return `${dd}/${mm}/${yyyy} ${hh}:${mins}${ampm}`;
  }

  // Fallback: return original string
  return s;
};

export default function AuditLog() {
  const [currentPage, setCurrentPage] = useState(1);
  const [goToPage, setGoToPage] = useState("");
  const [auditTrails, setAuditTrails] = useState<AuditLogInfo[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalLogs, setTotalLogs] = useState(0);
  const [perPage, setPerPage] = useState(20);
  const [isLoading, setIsLoading] = useState(true);

  const getAuditsTrails = async (page = 1, limit = 20) => {
    try {
      setIsLoading(true);
      // api expects query params ?page=1&limit=20
      const response = await adminAPI.auditTrails(
        `?page=${page}&limit=${limit}`
      );
      if (response && response.status) {
        // If API returns pagination metadata at response.pagination
        // Example response.pagination: { total: 41, currentPage: 1, totalPages: 3 }
        const data = response.data || [];
        setAuditTrails(data);

        const pagination =
          response.pagination || response.data?.pagination || null;
        if (pagination) {
          setTotalPages(pagination.totalPages ?? pagination.total ?? 1);
          setTotalLogs(pagination.total ?? pagination.totalItems ?? 0);
          setPerPage(pagination.perPage ?? limit);
          setCurrentPage(pagination.currentPage ?? page);
        } else if (response.total !== undefined) {
          // fallback if API returns top-level total/currentPage/totalPages
          setTotalLogs(response.total ?? 0);
          setTotalPages(response.totalPages ?? 1);
          setCurrentPage(response.currentPage ?? page);
          setPerPage(limit);
        }
      }
    } catch (err) {
      console.error("Error fetching audit logs:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getAuditsTrails(currentPage, perPage);
  }, []);

  const handleGoToPage = () => {
    const pageNum = Number.parseInt(goToPage);
    if (Number.isFinite(pageNum) && pageNum >= 1 && pageNum <= totalPages) {
      setCurrentPage(pageNum);
      setGoToPage("");
      getAuditsTrails(pageNum, perPage);
    }
  };

  // Skeleton component for loading state
  const TableSkeleton = () => (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
              User
            </th>
            <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
              Action
            </th>
            <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
              Timestamp
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {Array.from({ length: 10 }).map((_, index) => (
            <tr key={index} className="animate-pulse">
              <td className="px-6 py-4">
                <div className="h-4 bg-gray-200 rounded w-32"></div>
              </td>
              <td className="px-6 py-4">
                <div className="h-4 bg-gray-200 rounded w-48"></div>
              </td>
              <td className="px-6 py-4">
                <div className="h-4 bg-gray-200 rounded w-36"></div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const PaginationSkeleton = () => (
    <div className="mt-4 flex items-center justify-between animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-40"></div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded w-12"></div>
          <div className="w-8 h-8 bg-gray-200 rounded"></div>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-4 bg-gray-200 rounded w-12"></div>
          <div className="w-16 h-8 bg-gray-200 rounded"></div>
          <div className="w-8 h-8 bg-gray-200 rounded"></div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Audit Log</h1>
        <p className="text-gray-600">
          History of all the activities that have happened.
        </p>
      </div>

      {/* Audit Log Table */}
      {isLoading ? (
        <TableSkeleton />
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
          <div className="min-w-[600px] md:min-w-0">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs md:text-sm font-medium text-gray-700 whitespace-nowrap">
                    User
                  </th>
                  <th className="px-4 py-3 text-left text-xs md:text-sm font-medium text-gray-700 whitespace-nowrap">
                    Action
                  </th>
                  <th className="px-4 py-3 text-left text-xs md:text-sm font-medium text-gray-700 whitespace-nowrap">
                    Timestamp
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {auditTrails.map((log) => (
                  <tr key={log._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-xs md:text-sm text-[#2d5a2d] break-words max-w-[150px] md:max-w-none">
                      <div className="line-clamp-2">{log.changedBy}</div>
                    </td>
                    <td className="px-4 py-3 text-xs md:text-sm text-gray-900 break-words max-w-[200px] md:max-w-none">
                      <div className="line-clamp-2">{log.field}</div>
                    </td>
                    <td className="px-4 py-3 text-xs md:text-sm text-gray-900 whitespace-nowrap">
                      {formatTimestamp(log.timestamp)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      {isLoading ? (
        <PaginationSkeleton />
      ) : (
        <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <p className="text-xs sm:text-sm text-gray-600 whitespace-nowrap">
            Showing {((currentPage - 1) * perPage) + 1} to {Math.min(currentPage * perPage, totalLogs)} of {totalLogs} logs
          </p>
          <div className="w-full sm:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="flex items-center justify-between sm:justify-start gap-2">
              <button
                onClick={() => {
                  const next = Math.max(1, currentPage - 1);
                  setCurrentPage(next);
                  getAuditsTrails(next, perPage);
                }}
                disabled={currentPage === 1}
                className="p-1.5 sm:p-2 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Previous page"
              >
                <svg
                  className="w-4 h-4 sm:w-5 sm:h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
              <span className="text-xs sm:text-sm text-gray-600 px-2">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => {
                  const next = Math.min(totalPages, currentPage + 1);
                  setCurrentPage(next);
                  getAuditsTrails(next, perPage);
                }}
                disabled={currentPage === totalPages}
                className="p-1.5 sm:p-2 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Next page"
              >
                <svg
                  className="w-4 h-4 sm:w-5 sm:h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm text-gray-600 whitespace-nowrap">Go to:</span>
              <div className="flex-1 flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  max={totalPages}
                  value={goToPage}
                  onChange={(e) => setGoToPage(e.target.value)}
                  className="flex-1 min-w-0 w-12 sm:w-16 px-2 py-1 border border-gray-300 rounded text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#2d5a2d]"
                  aria-label="Page number"
                />
                <button
                  onClick={handleGoToPage}
                  className="px-2 sm:px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded text-xs sm:text-sm font-medium transition-colors whitespace-nowrap"
                >
                  Go
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
