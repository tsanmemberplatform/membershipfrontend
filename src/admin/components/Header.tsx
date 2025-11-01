import { Menu } from "lucide-react";
import Logo from "../../components/Logo";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { logout } from "../../store/slices/authSlice";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { useAppSelector } from "../../hooks/useAppSelector";

interface HeaderProps {
  onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem("authToken");
    dispatch(logout());
    navigate("/login");
  };
  return (
    <header className="bg-gray-800 text-white px-4 sm:px-6 py-3 flex items-center justify-between fixed top-0 left-0 right-0 z-100 h-[70px] pt-10">
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2 hover:bg-[#4a4a4a] rounded-lg transition-colors"
        aria-label="Toggle menu"
      >
        <Menu className="w-6 h-6" />
      </button>
      <div className="flex items-center h-[70px]">
        <Logo />
      </div>

      {/* <div className="flex-1" /> */}

      {/* <div
        className="relative flex items-center gap-2 sm:gap-3 cursor-pointer hover:bg-[#4a4a4a] px-2 sm:px-3 py-2 rounded-lg transition-colors"
        onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
      >

        <div className="text-right hidden sm:block">
          <div className="font-medium text-sm sm:text-base">Edet Adamu</div>
          <div className="text-xs sm:text-sm text-gray-300">National Admin</div>
        </div>
        <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5" />
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
      </div> */}

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
              to="/admin/personal-details"
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
            {/* <button className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        <svg className="w-4 h-4 mr-3" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-2 0c0 .993-.241 1.929-.668 2.754l-1.524-1.525a3.997 3.997 0 00.078-2.183l1.562-1.562C17.759 8.071 18 9.007 18 10z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Support
                      </button> */}
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
    </header>
  );
}
