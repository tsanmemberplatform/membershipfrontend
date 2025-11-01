import { useState, useEffect } from "react";
import { ArrowUpRight } from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";
import { adminAPI } from "@/services/api";

interface ApiResponse {
  data: {
    ageDistribution: Record<string, number>;
    genderDistribution: Array<{ _id: string; total: number }>;
    membershipGrowth: Record<
      string,
      {
        Cub: number;
        Scout: number;
        Venturer: number;
        Rover: number;
        Volunteers: number;
      }
    >;
    scoutingRoleDistribution: Array<{ _id: string | null; total: number }>;
  };
  filterRange: string;
  filtersApplied: {
    dateRange: {
      startDate: string;
      endDate: string;
    };
    stateScoutCouncil: string;
  };
  message: string;
  status: boolean;
}

// Color palettes for charts
const genderColors = ["#f87171", "#818cf8"];
const ageColors = ["#818cf8", "#6366f1", "#fb923c", "#38bdf8", "#f87171"];

// Helper functions to transform API data
const transformGenderData = (
  genderDistribution: Array<{ _id: string; total: number }>
) => {
  return genderDistribution.map((item, index) => ({
    name:
      item._id === "Male" ? "Boys" : item._id === "Female" ? "Girls" : item._id,
    value: item.total,
    color: genderColors[index % genderColors.length],
  }));
};

const transformAgeData = (ageDistribution: Record<string, number>) => {
  return Object.entries(ageDistribution).map(([key, value], index) => ({
    name: key,
    value: value,
    color: ageColors[index % ageColors.length],
  }));
};

const transformRoleData = (
  scoutingRoleDistribution: Array<{ _id: string | null; total: number }>
) => {
  return scoutingRoleDistribution.map((item) => ({
    role: item._id || "Unspecified",
    count: item.total,
  }));
};

const transformMembershipData = (
  membershipGrowth: Record<
    string,
    {
      Cub: number;
      Scout: number;
      Venturer: number;
      Rover: number;
      Volunteers: number;
    }
  >
) => {
  return Object.entries(membershipGrowth)
    .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
    .map(([date, data]) => ({
      name: new Date(date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      Cubs: data.Cub,
      Scouts: data.Scout,
      Venturer: data.Venturer,
      Rovers: data.Rover,
      Volunteers: data.Volunteers,
    }));
};

const calculateMembershipTotals = (
  membershipGrowth: Record<
    string,
    {
      Cub: number;
      Scout: number;
      Venturer: number;
      Rover: number;
      Volunteers: number;
    }
  >
) => {
  const totals = { Cubs: 0, Scouts: 0, Venturer: 0, Rovers: 0, Volunteers: 0 };

  Object.values(membershipGrowth).forEach((data) => {
    totals.Cubs += data.Cub;
    totals.Scouts += data.Scout;
    totals.Venturer += data.Venturer;
    totals.Rovers += data.Rover;
    totals.Volunteers += data.Volunteers;
  });

  return [
    { name: "Cubs", value: totals.Cubs },
    { name: "Scouts", value: totals.Scouts },
    { name: "Venturer", value: totals.Venturer },
    { name: "Rovers", value: totals.Rovers },
    { name: "Volunteers", value: totals.Volunteers },
  ];
};

// const renderCustomLabel = () => null;

// Nigerian states for the filter
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

export default function Reports() {
  const [timeRange, setTimeRange] = useState("all");
  const [stateCouncil, setStateCouncil] = useState("All");
  const [apiData, setApiData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const getStats = async () => {
    try {
      setLoading(true);

      // Build query parameters
      const params = new URLSearchParams();

      if (timeRange !== "all") {
        if (timeRange === "month") {
          params.append("range", "thisMonth");
        } else if (timeRange === "year") {
          params.append("range", "thisYear");
        }
      }

      if (stateCouncil !== "All") {
        params.append("stateScoutCouncil", stateCouncil);
      }

      const queryString = params.toString();
      const response = await adminAPI.getStats(
        queryString ? `?${queryString}` : ""
      );

      if (response.status === true) {
        setApiData(response);
      }
    } catch (err: any) {
      console.log(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getStats();
  }, [timeRange, stateCouncil]);

  // Transform API data for charts
  const genderData = apiData
    ? transformGenderData(apiData.data.genderDistribution)
    : [];
  const ageData = apiData ? transformAgeData(apiData.data.ageDistribution) : [];
  const roleData = apiData
    ? transformRoleData(apiData.data.scoutingRoleDistribution)
    : [];
  const membershipData = apiData
    ? transformMembershipData(apiData.data.membershipGrowth)
    : [];
  const membershipLegend = apiData
    ? calculateMembershipTotals(apiData.data.membershipGrowth)
    : [];

  const hasData =
    apiData && Object.keys(apiData.data.membershipGrowth).length > 0;
  const totalMembers = membershipLegend.reduce(
    (sum, item) => sum + item.value,
    0
  );
  const totalGender = genderData.reduce((sum, item) => sum + item.value, 0);
  const totalAge = ageData.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Reports</h1>
          <p className="text-gray-600">
            Here you can view membership analytics
          </p>
        </div>
        <button className="flex items-center gap-2 text-primary hover:underline whitespace-nowrap">
          Export data
          <ArrowUpRight className="w-4 h-4" />
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <select
          className="px-4 py-2 border border-gray-300 rounded-lg text-sm"
          value={stateCouncil}
          onChange={(e) => setStateCouncil(e.target.value)}
        >
          <option value="All">All state council</option>
          {nigerianStates.map((state) => (
            <option key={state} value={state}>
              {state}
            </option>
          ))}
        </select>
        <select
          className="px-4 py-2 border border-gray-300 rounded-lg text-sm"
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
        >
          <option value="all">All time</option>
          <option value="year">This year</option>
          <option value="month">This month</option>
        </select>
      </div>

      {loading ? (
        <div className="space-y-6">
          {/* Membership Growth Skeleton */}
          <div className="bg-white rounded-lg border border-gray-200 p-4 md:p-6">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-6 bg-gray-200 rounded w-1/3 mb-6"></div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 h-64 md:h-80 bg-gray-100 rounded"></div>
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="h-4 bg-gray-200 rounded w-16"></div>
                      <div className="h-4 bg-gray-200 rounded w-12"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Gender and Age Distribution Skeletons */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[...Array(2)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-lg border border-gray-200 p-4 md:p-6"
              >
                <div className="animate-pulse">
                  <div className="h-6 bg-gray-200 rounded w-1/2 mb-6"></div>
                  <div className="flex flex-col sm:flex-row items-center gap-6">
                    <div className="relative w-full sm:w-48 h-64 bg-gray-100 rounded-full"></div>
                    <div className="space-y-2 w-full sm:w-auto">
                      {[...Array(3)].map((_, j) => (
                        <div key={j} className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-gray-200 rounded-full"></div>
                          <div className="h-4 bg-gray-200 rounded w-20"></div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Scouting Role Distribution Skeleton */}
          <div className="bg-white rounded-lg border border-gray-200 p-4 md:p-6">
            <div className="animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-1/2 mb-6"></div>
              <div className="space-y-3">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0"
                  >
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                    <div className="h-4 bg-gray-200 rounded w-16"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : hasData ? (
        <>
          <div className="bg-white rounded-lg border border-gray-200 p-4 md:p-6 mb-6">
            <p className="text-sm text-gray-600 mb-4">
              Showing report of {totalMembers.toLocaleString()} registered
              members for{" "}
              {timeRange === "all"
                ? "all time"
                : timeRange === "year"
                ? "this year"
                : "this month"}
              {stateCouncil !== "All" && ` in ${stateCouncil}`}.
            </p>
            <h3 className="font-semibold text-gray-900 mb-6">
              Membership Growth
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 h-64 md:h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={membershipData}
                    margin={{ top: 20, right: 30, left: 0, bottom: 20 }}
                  >
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Bar dataKey="Cubs" fill="#4a7c3e" />
                    <Bar dataKey="Scouts" fill="#6b8e23" />
                    <Bar dataKey="Venturer" fill="#8b9d6f" />
                    <Bar dataKey="Rovers" fill="#a8b89f" />
                    <Bar dataKey="Volunteers" fill="#c5d3bf" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-3 flex flex-col justify-center">
                {membershipLegend.map((item) => (
                  <div
                    key={item.name}
                    className="flex items-center justify-between"
                  >
                    <span className="text-gray-700 text-sm">{item.name}</span>
                    <span className="font-semibold text-gray-900">
                      {item.value.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="bg-white rounded-lg border border-gray-200 p-4 md:p-6">
              <h3 className="font-semibold text-gray-900 mb-6">
                Gender distribution
              </h3>
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="relative w-full sm:w-48 h-64 flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={genderData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={0}
                        dataKey="value"
                        label={false}
                      >
                        {genderData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute text-center">
                    <div className="text-xs text-gray-600">Total</div>
                    <div className="text-2xl font-bold text-gray-900">
                      {totalGender.toLocaleString()}
                    </div>
                  </div>
                </div>
                <div className="space-y-2 w-full sm:w-auto">
                  {genderData.map((item) => (
                    <div key={item.name} className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-sm text-gray-700">
                        {item.name} ({item.value.toLocaleString()})
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-4 md:p-6">
              <h3 className="font-semibold text-gray-900 mb-6">
                Age distribution
              </h3>
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="relative w-full sm:w-48 h-64 flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={ageData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={0}
                        dataKey="value"
                        label={false}
                      >
                        {ageData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute text-center">
                    <div className="text-xs text-gray-600">Total</div>
                    <div className="text-2xl font-bold text-gray-900">
                      {totalAge.toLocaleString()}
                    </div>
                  </div>
                </div>
                <div className="space-y-2 w-full sm:w-auto">
                  {ageData.map((item) => (
                    <div key={item.name} className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-sm text-gray-700">
                        {item.name} ({item.value})
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4 md:p-6">
            <h3 className="font-semibold text-gray-900 mb-6">
              Scouting role distribution
            </h3>
            <div className="space-y-3">
              {roleData.map((item, index) => (
                <div
                  key={`${item.role}-${index}`}
                  className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0"
                >
                  <span className="text-gray-700 capitalize">{item.role}</span>
                  <span className="font-semibold text-gray-900">
                    {item.count.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <div className="space-y-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-6">
              Membership Growth
            </h3>
            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
              <p className="text-sm">There are no data yet</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-6">
                Gender distribution
              </h3>
              <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                <p className="text-sm">There are no data yet</p>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-6">
                Age distribution
              </h3>
              <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                <p className="text-sm">There are no data yet</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-6">
              Scouting role distribution
            </h3>
            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
              <p className="text-sm">There are no data yet</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
