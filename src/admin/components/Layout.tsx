import { useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { Outlet, Navigate, Link } from "react-router-dom";
import { useAppSelector } from "@/hooks/useAppSelector";

export default function Layout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user } = useAppSelector((state) => state.auth);

  const allowedRoles = ["superAdmin", "nsAdmin", "ssAdmin"];

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If user is authenticated but not in an allowed admin role, show access denied
  if (!allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="max-w-lg w-full bg-white rounded-lg shadow-md p-8 text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Access denied
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            You do not have permission to view this admin area.
          </p>
          <div className="flex justify-center">
            <Link to="/" className="px-4 py-2 bg-primary text-white rounded">
              Go home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={closeSidebar}
        />
      )}
      <Header onMenuClick={toggleSidebar} />
      <div className="flex flex-1">
        <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />

        <div className="flex-1 flex flex-col overflow-hidden">
          <main className="flex-1 overflow-y-auto mt-18 lg:ml-64">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
