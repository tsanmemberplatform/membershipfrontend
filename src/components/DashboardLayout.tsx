import type React from "react";
import { useState } from "react";
import { Link, useLocation, Outlet, useNavigate } from "react-router-dom";
import Logo from "./Logo";
import { House } from "lucide-react";
import { CircleStar, ChevronRight } from "lucide-react";
import { BookOpen } from "lucide-react";
import { Calendar } from "lucide-react";
import { useDispatch } from "react-redux";
import { logout } from "../store/slices/authSlice";
import { useAppSelector } from "../hooks/useAppSelector";

export const DashboardLayout: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const { user } = useAppSelector((state) => state.auth);
  // console.log(user);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const navigationItems = [
    { id: "home", label: "Home", icon: <House />, path: "/dashboard" },
    {
      id: "achievements",
      label: "Achievements",
      icon: <CircleStar />,
      path: "/dashboard/achievements",
    },
    {
      id: "logbook",
      label: "Logbook",
      icon: <BookOpen />,
      path: "/dashboard/logbook",
    },
    {
      id: "events",
      label: "Events",
      icon: <Calendar />,
      path: "/dashboard/events",
    },
  ];

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    dispatch(logout());
    navigate("/login");
  };

  const isActiveRoute = (path: string) => {
    if (path === "/dashboard") {
      return location.pathname === "/dashboard";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gray-800 text-white fixed top-0 left-0 right-0 z-30 h-[70px] items-center">
        <div className="flex items-center justify-between px-4 py-3 ">
          {/* Mobile menu button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-md hover:bg-gray-700"
          >
            <div className="w-6 h-6 flex flex-col justify-center space-y-1">
              <div className="w-full h-0.5 bg-white"></div>
              <div className="w-full h-0.5 bg-white"></div>
              <div className="w-full h-0.5 bg-white"></div>
            </div>
          </button>

          {/* Logo */}
          <div className="flex items-center h-[70px]">
            <Logo />
          </div>

          {/* User dropdown */}
          <div className="relative h-[70px]">
            <button
              onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
              className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-700"
            >
              <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                <img
                  src={user?.profilePic}
                  alt="Profile"
                  className="w-8 h-8 rounded-full object-cover"
                />
              </div>
              <div className="hidden md:block text-left">
                <div className="text-sm font-medium">{user?.fullName}</div>
                <div className="text-xs text-gray-300">
                  ID: {user?.membershipId}
                </div>
              </div>
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>

            {/* User dropdown menu */}
            {isUserDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                <Link
                  to="/dashboard/profile"
                  onClick={() => setIsUserDropdownOpen(false)}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <svg
                    className="w-4 h-4 mr-3"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                      clipRule="evenodd"
                    />
                  </svg>
                  My Account
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <svg
                    className="w-4 h-4 mr-3"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="flex pt-16">
        {/* Sidebar - Desktop */}
        <aside className="hidden md:flex md:flex-col md:w-64 bg-white shadow-sm fixed left-0 top-16 bottom-0 overflow-y-auto">
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigationItems.map((item) => (
              <Link
                key={item.id}
                to={item.path}
                className={`flex items-center w-full px-3 py-2 text-sm font-medium rounded-md ${
                  isActiveRoute(item.path)
                    ? "bg-green-100 text-green-700"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <span className="mr-3">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </nav>
          {user.role === "superAdmin" ||
          user.role === "nsAdmin" ||
          user.role === "ssAdmin" ? (
            <div className="px-4 py-4 text-green-900">
              <Link
                to="/admin"
                className="bg-gray-100 flex justify-between px-3 py-2 rounded-lg text-left text-sm font-medium hover:bg-gray-200 transition-colors"
              >
                Switch to Admin{" "}
                <span>
                  {" "}
                  <ChevronRight />
                </span>
              </Link>
            </div>
          ) : null}
        </aside>

        {/* Mobile sidebar */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-40 md:hidden">
            <div
              className="fixed inset-0 bg-gray-600 bg-opacity-75"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <div className="relative flex flex-col w-64 bg-white shadow-xl h-full pb-[20px]">
              <nav className="flex-1 px-4 py-6 space-y-2">
                {navigationItems.map((item) => (
                  <Link
                    key={item.id}
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center w-full px-3 py-2 text-sm font-medium rounded-md ${
                      isActiveRoute(item.path)
                        ? "bg-green-100 text-green-700"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    <span className="mr-3">{item.icon}</span>
                    {item.label}
                  </Link>
                ))}
              </nav>
              {user.role === "superAdmin" ||
              user.role === "nsAdmin" ||
              user.role === "ssAdmin" ? (
                <div className="px-4 py-4 text-green-900">
                  <Link
                    to="/admin"
                    className="bg-gray-100 flex justify-between px-3 py-2 rounded-lg text-left text-sm font-medium hover:bg-gray-200 transition-colors"
                  >
                    Switch to Admin{" "}
                    <span>
                      {" "}
                      <ChevronRight />
                    </span>
                  </Link>
                </div>
              ) : null}
            </div>
          </div>
        )}

        {/* Main content */}
        <main className="flex-1 p-6 md:ml-64 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
