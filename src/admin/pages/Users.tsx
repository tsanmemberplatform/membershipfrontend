import { useState, useEffect, useMemo } from "react";
import { Search, Plus, X, CheckCircle2 } from "lucide-react";
import Pagination from "../components/Pagination";
import { adminAPI } from "@/services/api";
import Swal from "sweetalert2";
import { debounce } from "lodash";

interface Scout {
  _id: number;
  fullName: string;
  membershipId: string;
  scoutingRole: string;
  section: string;
  stateScoutCouncil: string;
  email: string;
  role: string;
  status: "active" | "suspended";
  displayRole: string;
  lastSignedIn: string;
}

const nigerianStates = [
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
  "FCT",
];

// const users = [
//   {
//     id: 1,
//     name: "Edet Adamu",
//     email: "admin@example.com",
//     role: "Super admin",
//     stateCouncil: "All state council",
//     status: "Active",
//     lastActive: "03/03/2025",
//   },
//   {
//     id: 2,
//     name: "Edet Adamu",
//     email: "admin@example.com",
//     role: "State admin",
//     stateCouncil: "Akwa Ibom",
//     status: "Active",
//     lastActive: "03/03/2025",
//   },
//   {
//     id: 3,
//     name: "Edet Adamu",
//     email: "admin@example.com",
//     role: "National admin",
//     stateCouncil: "All state council",
//     status: "Active",
//     lastActive: "03/03/2025",
//   },
//   {
//     id: 4,
//     name: "Edet Adamu",
//     email: "admin@example.com",
//     role: "State admin",
//     stateCouncil: "Akwa Ibom",
//     status: "Pending",
//     lastActive: "-",
//   },
// ];

function InviteUserModal({
  isOpen,
  onClose,
  onSuccess,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (email: string) => void;
}) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [selectedStates, setSelectedStates] = useState<string>("");
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [sending, setSending] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    setSending(true);
    try {
      const response = await adminAPI.inviteUser({
        fullName: firstName + " " + lastName,
        email,
        role:
          role === "Super Admin"
            ? "superAdmin"
            : role === "National Admin"
            ? "nsAdmin"
            : "ssAdmin",
        council:
          role === "State Admin"
            ? `${selectedStates} State Scout Council`
            : "All state council",
      });
      if (response.status === true) {
        onSuccess(email);
      }
    } catch (err: any) {
      console.error("Failed to invite user:", err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.message
          ? err.message
          : "Failed to invite user. Please try again.",
      });
      return;
    } finally {
      // Reset form
      setFirstName("");
      setLastName("");
      setEmail("");
      setRole("");
      setSelectedStates("");
      setSending(false);
    }
  };

  const selectState = (state: string) => {
    setSelectedStates(state);
  };

  const getRoleDescription = () => {
    switch (role) {
      case "Super Admin":
        return "This type of user will have full access to all features on the platform";
      case "National Admin":
        return "This type of user will have full access to all features across all states";
      case "State Admin":
        return "This type of user will have full access to features within assigned state(s)";
      default:
        return "";
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Add user</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                First name
              </label>
              <input
                type="text"
                placeholder="Enter first name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Last name
              </label>
              <input
                type="text"
                placeholder="Enter last name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                placeholder="Enter email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Role
              </label>
              <button
                type="button"
                onClick={() => setShowRoleDropdown(!showRoleDropdown)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-left flex items-center justify-between hover:border-gray-400 focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <span className={role ? "text-gray-900" : "text-gray-400"}>
                  {role || "Select role"}
                </span>
                <svg
                  className="w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              {showRoleDropdown && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg">
                  {["Super Admin", "National Admin", "State Admin"].map(
                    (roleOption) => (
                      <button
                        key={roleOption}
                        type="button"
                        onClick={() => {
                          setRole(roleOption);
                          setShowRoleDropdown(false);
                          if (roleOption !== "State Admin") {
                            setSelectedStates("");
                          }
                        }}
                        className="w-full px-4 py-2 text-left hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg"
                      >
                        {roleOption}
                      </button>
                    )
                  )}
                </div>
              )}
            </div>
          </div>

          {role && (
            <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm text-gray-700">{getRoleDescription()}</p>
            </div>
          )}

          {role === "State Admin" && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Assign State Council
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-h-64 overflow-y-auto p-4 border border-gray-200 rounded-lg">
                {nigerianStates.map((state) => (
                  <label
                    key={state}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="stateSelection"
                      checked={selectedStates === state}
                      onChange={() => selectState(state)}
                      className="w-4 h-4 text-primary border-gray-300 focus:ring-primary"
                    />
                    <span className="text-sm text-gray-700">{state}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={
              !firstName ||
              !lastName ||
              !email ||
              !role ||
              (role === "State Admin" && selectedStates === "") ||
              sending === true
            }
            className="px-6 py-2 bg-[#006400] text-white rounded-lg hover:bg-[#234623] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {sending ? "Sending..." : "Invite User"}
          </button>
        </div>
      </div>
    </div>
  );
}

function SuccessBanner({
  email,
  onClose,
}: {
  email: string;
  onClose: () => void;
}) {
  return (
    <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <CheckCircle2 className="w-5 h-5 text-green-600" />
        <p className="text-sm text-gray-700">
          Invitation sent to <span className="font-medium">{email}</span>
        </p>
      </div>
      <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
        <X className="w-5 h-5" />
      </button>
    </div>
  );
}

export default function Users() {
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [successEmail, setSuccessEmail] = useState<string | null>(null);
  // const [totalPages, setTotalPages] = useState(1);
  // const [totalUsers, setTotalUsers] = useState(0);
  const perPage = 20;
  const [loading, setLoading] = useState(false);
  const [allUsers, setAllUsers] = useState<Scout[]>([]);

  // Filter states
  const [roleFilter, setRoleFilter] = useState("");
  const [stateCouncilFilter, setStateCouncilFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");

  // Get unique state councils from users data
  const uniqueStateCouncils = useMemo(() => {
    const councils = allUsers
      .map((user) => user.stateScoutCouncil)
      .filter((council) => council && council.trim() !== "");
    return [...new Set(councils)].sort();
  }, [allUsers]);

  // Get unique roles from users data
  const uniqueRoles = useMemo(() => {
    const roles = allUsers
      .map((user) => user.role)
      .filter((role) => role && role.trim() !== "");
    return [...new Set(roles)].sort();
  }, [allUsers]);

  // Client-side filtered users
  const filteredUsers = useMemo(() => {
    let filtered = [...allUsers];

    // Apply role filter
    if (roleFilter) {
      filtered = filtered.filter((user) => user.role === roleFilter);
    }

    // Apply state council filter
    if (stateCouncilFilter) {
      filtered = filtered.filter(
        (user) => user.stateScoutCouncil === stateCouncilFilter
      );
    }

    // Apply search filter
    if (debouncedSearchQuery.trim()) {
      const searchTerm = debouncedSearchQuery.toLowerCase().trim();
      filtered = filtered.filter(
        (user) =>
          user.fullName?.toLowerCase().includes(searchTerm) ||
          user.email?.toLowerCase().includes(searchTerm) ||
          user.role?.toLowerCase().includes(searchTerm) ||
          user.stateScoutCouncil?.toLowerCase().includes(searchTerm)
      );
    }

    return filtered;
  }, [allUsers, roleFilter, stateCouncilFilter, debouncedSearchQuery]);

  // Debounce search input
  useEffect(() => {
    const handler = debounce(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);

    handler();
    return () => {
      handler.cancel();
    };
  }, [searchQuery]);

  const getAllUsers = async (page = 1) => {
    setLoading(true);
    try {
      const response = await adminAPI.getAllUsers(
        `?page=${page}&limit=1000&sort=-createdAt` // Fetch all users for client-side filtering
      );
      if (response.status) {
        setAllUsers(response.data);
        // Update pagination based on filtered results
        // const filteredCount = filteredUsers.length;
        // setTotalUsers(filteredCount);
        // setTotalPages(Math.ceil(filteredCount / perPage));
      }
      // console.log(response);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Fetch all users when component mounts
    getAllUsers(1);
  }, []);

  // Update pagination when filters change
  useEffect(() => {
    setCurrentPage(1); // Reset to first page when filters change
  }, [roleFilter, stateCouncilFilter, debouncedSearchQuery]);

  const handleInviteSuccess = (email: string) => {
    setSuccessEmail(email);
    setIsModalOpen(false);
    // Auto-hide success banner after 5 seconds
    setTimeout(() => setSuccessEmail(null), 5000);
  };

  return (
    <div className="p-4 md:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Users</h1>
        <p className="text-gray-600">
          Manage user accounts, roles, and permissions
        </p>
      </div>

      {successEmail && (
        <SuccessBanner
          email={successEmail}
          onClose={() => setSuccessEmail(null)}
        />
      )}

      <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 md:p-6 mb-6 flex items-center justify-between flex-wrap gap-4">
        <p className="text-gray-700">
          Add user to manage and control scouts activities across states
          council.
        </p>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#006400] hover:bg-[#234623] text-white rounded-lg transition-colors"
        >
          <Plus className="w-5 h-5" />
          Invite User
        </button>
      </div>

      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-4 md:p-6 border-b border-gray-200">
          <div className="flex flex-col md:flex-row gap-4 w-full">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm min-w-[180px]"
            >
              <option value="">All Roles</option>
              {uniqueRoles.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>

            <select
              value={stateCouncilFilter}
              onChange={(e) => setStateCouncilFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm min-w-[200px]"
            >
              <option value="">All State Councils</option>
              {uniqueStateCouncils.map((council) => (
                <option key={council} value={council}>
                  {council}
                </option>
              ))}
            </select>

            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, email, role, or state..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  State council
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Last active
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                // Loading skeleton rows
                Array.from({ length: 5 }).map((_, index) => (
                  <tr key={index} className="animate-pulse">
                    <td className="px-6 py-4">
                      <div>
                        <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-48"></div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="h-4 bg-gray-200 rounded w-24"></div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="h-4 bg-gray-200 rounded w-36"></div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 bg-gray-200 rounded-full"></div>
                        <div className="h-4 bg-gray-200 rounded w-16"></div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="h-4 bg-gray-200 rounded w-20"></div>
                    </td>
                  </tr>
                ))
              ) : filteredUsers.length > 0 ? (
                filteredUsers
                  .slice((currentPage - 1) * perPage, currentPage * perPage)
                  .map((user) => (
                    <tr key={user._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium text-primary">
                            {user.fullName}
                          </div>
                          <div className="text-sm text-gray-600">
                            {user.email}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {user.displayRole}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {user.stateScoutCouncil}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 text-sm ${
                            user.status === "active"
                              ? "text-green-600"
                              : "text-amber-600"
                          }`}
                        >
                          <span
                            className={`w-2 h-2 rounded-full ${
                              user.status === "active"
                                ? "bg-green-600"
                                : "bg-amber-600"
                            }`}
                          />
                          {user.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {user.lastSignedIn ? new Date(user.lastSignedIn).toLocaleDateString('en-GB') : 'N/A'}
                      </td>
                    </tr>
                  ))
              ) : (
                // Empty state
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="text-gray-500">
                      <p className="text-lg font-medium">No users found</p>
                      <p className="text-sm">
                        Try adjusting your search criteria
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-4 border-t border-gray-200">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-sm text-gray-600">
              Showing{" "}
              <span className="font-medium">
                {(currentPage - 1) * perPage + 1}
              </span>{" "}
              to{" "}
              <span className="font-medium">
                {Math.min(currentPage * perPage, filteredUsers.length)}
              </span>{" "}
              of <span className="font-medium">{filteredUsers.length}</span>{" "}
              users
            </div>
            <Pagination
              currentPage={currentPage}
              totalPages={Math.ceil(filteredUsers.length / perPage)}
              onPageChange={(page) => setCurrentPage(page)}
              totalItems={filteredUsers.length}
              itemsPerPage={perPage}
            />
          </div>
        </div>
      </div>

      <InviteUserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleInviteSuccess}
      />
    </div>
  );
}
