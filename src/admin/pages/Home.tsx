import { useAppSelector } from "../../hooks/useAppSelector";
import { useEffect, useState } from "react";
import { adminAPI } from "@/services/api";

import StatCard from "../components/StatCard";

interface Stats {
  leader: number;
  member: number;
  nsAdmin: number;
  ssAdmin: number;
  superAdmin: number;
  totalUsers: number;
}

export default function Home() {
  console.log("Home component is rendering");
  const { user } = useAppSelector((state) => state.auth);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<Stats>({
    leader: 0,
    member: 0,
    nsAdmin: 0,
    ssAdmin: 0,
    superAdmin: 0,
    totalUsers: 0,
  });

  const getStats = async () => {
    setLoading(true);
    try {
      const response = await adminAPI.getScoutStats();
      console.log(response);
      if (response.status) {
        setStats(response.data);
      }
    } catch (err: any) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getStats();
  }, []);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
            Welcome
          </h1>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">
            to your back office, {user?.fullName?.split(" ")[0] || "Member"}
          </h2>
          <p className="text-sm sm:text-base text-gray-600 px-4">
            Your secure board to manage all scout members and other users
          </p>
        </div>

        <div>
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6">
            Insights
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            <>
              <StatCard
                label="Total Scouts"
                value={stats?.totalUsers}
                loading={loading}
              />
              <StatCard
                label="Total State Admins"
                value={stats?.ssAdmin}
                loading={loading}
              />
              <StatCard
                label="Total National Admins"
                value={stats?.nsAdmin}
                loading={loading}
              />
            </>
          </div>
        </div>
      </div>
    </div>
  );
}
