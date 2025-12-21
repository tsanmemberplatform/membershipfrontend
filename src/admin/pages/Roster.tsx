import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Search } from "lucide-react";
import StatCard from "../components/StatCard";
import Pagination from "../components/Pagination";
import { adminAPI } from "@/services/api";

interface Scout {
  _id: number;
  fullName: string;
  membershipId: string;
  scoutingRole: string;
  section: string;
  stateScoutCouncil: string;
  status: "active" | "suspended";
}

interface Stats {
  active: number;
  inactive: number;
  suspended: number;
  total: number;
}

// const scouts = Array.from({ length: 20 }, (_, i) => ({
//   id: i + 1,
//   name: "Chiroma Bisi Adamu",
//   memberId: "TSAN-AKS-10225",
//   scoutingRole: i % 5 === 0 ? "Scout Leader" : "Member",
//   section: ["Volunteers", "Scout", "Cub", "Rover"][i % 4],
//   stateCouncil: "Akwa Ibom",
//   status: i % 5 === 4 ? "suspended" : "active",
// }));

export default function Roster() {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [activeTab, setActiveTab] = useState<"members" | "pending">("members");
  const [loading, setLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);
  const [users, setUsers] = useState<Scout[]>([]);
  const [rosterStats, setRosterStats] = useState<Stats>({
    active: 0,
    inactive: 0,
    suspended: 0,
    total: 0,
  });

  // Filter states
  const [statusFilter, setStatusFilter] = useState("");
  const [sectionFilter, setSectionFilter] = useState("");
  const [stateCouncilFilter, setStateCouncilFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");

  const getAllUsers = async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("page", page.toString());
      params.append("limit", "20"); // 20 scouts per page
      params.append("sort", "-createdAt");

      // Add filters to API call
      if (statusFilter) params.append("status", statusFilter);
      if (sectionFilter) params.append("section", sectionFilter);
      if (stateCouncilFilter)
        params.append(
          "stateScoutCouncil",
          stateCouncilFilter + " State Scout Council"
        );
      if (debouncedSearchQuery.trim())
        params.append("search", debouncedSearchQuery.trim());

      const response = await adminAPI.getAllUsers(`?${params.toString()}`);
      if (response.status) {
        setUsers(response.data);
        // Set pagination info from server response
        if (response.pagination) {
          setTotalUsers(response.pagination.totalUsers || 0);
          setTotalPages(response.pagination.totalPages || 1);
          console.log("from roster", response.pagination);
        }
      }
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  // Get unique state councils - we'll need to fetch this separately or from stats
  const [uniqueStateCouncils, setUniqueStateCouncils] = useState<string[]>([]);

  const getStateCouncils = async () => {
    try {
      // You might need to create a separate API endpoint for this
      // For now, we'll use a basic set of common state councils
      const councils = [
        "Abia",
        "Adamawa",
        "Akwa Ibom",
        "Anambra",
        "Bauchi",
        "Bayelsa",
        "Benue",
        "Borno",
        "Cross River",
        "Delta",
        "Ebonyi",
        "Edo",
        "Ekiti",
        "Enugu",
        "FCT",
        "Gombe",
        "Imo",
        "Jigawa",
        "Kaduna",
        "Kano",
        "Katsina",
        "Kebbi",
        "Kogi",
        "Kwara",
        "Lagos",
        "Nasarawa",
        "Niger",
        "Ogun",
        "Ondo",
        "Osun",
        "Oyo",
        "Plateau",
        "Rivers",
        "Sokoto",
        "Taraba",
        "Yobe",
        "Zamfara",
      ];
      setUniqueStateCouncils(councils);
    } catch (err) {
      console.log("Error fetching state councils:", err);
    }
  };

  // Remove client-side filtering since we're doing server-side pagination
  // const filteredUsers = useMemo(() => {
  //   // Server-side filtering is now handled in getAllUsers
  // }, []);

  // Remove client-side pagination since we're doing server-side pagination
  // const paginatedUsers = useMemo(() => {
  //   // Server-side pagination is now handled in getAllUsers
  // }, []);

  // Remove client-side pagination calculations
  // const totalFilteredUsers = filteredUsers.length;
  // const calculatedTotalPages = Math.ceil(totalFilteredUsers / 20);

  // Clear all filters
  const clearFilters = () => {
    setStatusFilter("");
    setSectionFilter("");
    setStateCouncilFilter("");
    setSearchQuery("");
    setDebouncedSearchQuery("");
  };

  const getRosterStats = async () => {
    setStatsLoading(true);
    try {
      const response = await adminAPI.getRosterStats();
      if (response.status) {
        console.log("Roster stats response:", response?.data);
        setRosterStats(response?.data);
      }
      // console.log(response);
    } catch (err) {
      console.log("Error fetching roster stats:", err);
    } finally {
      setStatsLoading(false);
    }
  };

  useEffect(() => {
    getAllUsers(1); // Start with page 1
    getRosterStats();
    getStateCouncils();
  }, []);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Reset to page 1 and fetch new data when filters change
  useEffect(() => {
    setCurrentPage(1);
    getAllUsers(1);
  }, [statusFilter, sectionFilter, stateCouncilFilter, debouncedSearchQuery]);

  // Handle page changes
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    getAllUsers(page);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">
          Roster
        </h1>
        <p className="text-sm sm:text-base text-gray-600">
          Here you can view and manage all scout members
        </p>
      </div>

      <div className="mb-6 border-b border-gray-200">
        <div className="flex gap-4 sm:gap-8">
          <button
            onClick={() => setActiveTab("members")}
            className={`pb-3 px-1 font-medium text-sm sm:text-base transition-colors relative ${
              activeTab === "members"
                ? "text-gray-900"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Members
            {activeTab === "members" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
            )}
          </button>
          <Link
            to="/admin/roster/pending"
            className="pb-3 px-1 font-medium text-sm sm:text-base text-gray-500 hover:text-gray-700 transition-colors flex items-center gap-2"
          >
            Pending items
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <StatCard
          label="Total scouts"
          value={rosterStats?.total ?? 0}
          loading={statsLoading}
        />
        <StatCard
          label="Active scouts"
          value={rosterStats?.active ?? 0}
          loading={statsLoading}
        />
        <StatCard
          label="Suspended scouts"
          value={rosterStats?.suspended ?? 0}
          loading={statsLoading}
        />
      </div>

      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-4 sm:p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-sm sm:text-base text-gray-900">
              {/* {totalUsers} Scouts */}
            </h3>
            {(statusFilter ||
              sectionFilter ||
              stateCouncilFilter ||
              searchQuery) && (
              <button
                onClick={clearFilters}
                className="text-sm text-primary hover:text-primary-dark transition-colors"
              >
                Clear filters
              </button>
            )}
          </div>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={`px-3 sm:px-4 py-2 border rounded-lg text-sm w-full sm:w-auto focus:ring-2 focus:ring-primary focus:border-primary ${
                statusFilter ? "border-primary bg-primary/5" : "border-gray-300"
              }`}
            >
              <option value="">All status</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
            </select>
            <select
              value={sectionFilter}
              onChange={(e) => setSectionFilter(e.target.value)}
              className={`px-3 sm:px-4 py-2 border rounded-lg text-sm w-full sm:w-auto focus:ring-2 focus:ring-primary focus:border-primary ${
                sectionFilter
                  ? "border-primary bg-primary/5"
                  : "border-gray-300"
              }`}
            >
              <option value="">All section</option>
              <option value="Cub">Cub</option>
              <option value="Scout">Scout</option>
              <option value="Venturers">Venturers</option>
              <option value="Rover">Rover</option>
              <option value="Volunteers">Volunteers</option>
            </select>
            <select
              value={stateCouncilFilter}
              onChange={(e) => setStateCouncilFilter(e.target.value)}
              className={`px-3 sm:px-4 py-2 border rounded-lg text-sm w-full sm:w-auto focus:ring-2 focus:ring-primary focus:border-primary ${
                stateCouncilFilter
                  ? "border-primary bg-primary/5"
                  : "border-gray-300"
              }`}
            >
              <option value="">All state councils</option>
              {uniqueStateCouncils.map((council) => (
                <option key={council} value={council}>
                  {council}
                </option>
              ))}
            </select>
            {/* <select className="px-3 sm:px-4 py-2 border border-gray-300 rounded-lg text-sm w-full sm:w-auto">
              <option>All local government</option>
            </select> */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, membership ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Scout's name
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Member ID
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Scouting role
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Section
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  State council
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={`skeleton-${i}`} className="hover:bg-gray-50">
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                      <div className="h-4 bg-gray-200 rounded w-40 animate-pulse" />
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-600">
                      <div className="h-3 bg-gray-200 rounded w-28 animate-pulse" />
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                      <div className="h-3 bg-gray-200 rounded w-32 animate-pulse" />
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                      <div className="h-3 bg-gray-200 rounded w-20 animate-pulse" />
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                      <div className="h-3 bg-gray-200 rounded w-28 animate-pulse" />
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5 text-xs sm:text-sm">
                        <div className="w-3 h-3 rounded-full bg-gray-200 animate-pulse" />
                        <div className="h-3 bg-gray-200 rounded w-12 animate-pulse" />
                      </div>
                    </td>
                  </tr>
                ))
              ) : users?.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-3 sm:px-6 py-8 text-center text-gray-500"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <Search className="w-8 h-8 text-gray-300" />
                      <p>No scouts found matching your criteria</p>
                      <button
                        onClick={clearFilters}
                        className="text-primary hover:text-primary-dark text-sm"
                      >
                        Clear filters to see all scouts
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                users?.map((scout) => (
                  <tr key={scout._id} className="hover:bg-gray-50">
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                      <Link
                        to={`/admin/roster/${scout._id}`}
                        className="text-primary hover:underline font-medium text-sm"
                      >
                        {scout.fullName}
                      </Link>
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-600">
                      {scout.membershipId}
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                      {scout.scoutingRole}
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                      {scout.section}
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                      {scout.stateScoutCouncil}
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1.5 text-xs sm:text-sm ${
                          scout.status === "active"
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        <span
                          className={`w-2 h-2 rounded-full ${
                            scout.status === "active"
                              ? "bg-green-600"
                              : "bg-red-600"
                          }`}
                        />
                        {scout.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          totalItems={totalUsers}
          itemsPerPage={20}
        />
      </div>
    </div>
  );
}
