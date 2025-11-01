import { NavLink } from "react-router-dom";
import {
  Home,
  Users,
  Calendar,
  FileText,
  MessageSquare,
  UserCog,
  Shield,
  ChevronRight,
} from "lucide-react";
import { Link } from "react-router-dom";

const navItems = [
  { path: "/admin", label: "Home", icon: Home },
  { path: "/admin/roster", label: "Roster", icon: Users },
  { path: "/admin/event", label: "Event", icon: Calendar },
  { path: "/admin/reports", label: "Reports", icon: FileText },
  { path: "/admin/message", label: "Message", icon: MessageSquare },
  { path: "/admin/users", label: "Users", icon: UserCog },
  { path: "/admin/audit-log", label: "Audit log", icon: Shield },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  return (
    <aside
      className={`
        fixed lg:fixed inset-y-0 left-0 top-18 z-50
        w-64 bg-white border-r border-gray-200 flex flex-col pb-[20px]
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        h-[calc(100vh-4.5rem)] overflow-y-auto
      `}
    >
      <nav className="flex-1 p-4 overflow-y-auto">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                end={item.path === "/admin"}
                onClick={() => onClose()}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? "bg-green-50 text-primary font-medium"
                      : "text-gray-700 hover:bg-gray-50"
                  }`
                }
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <div className="px-4 py-4 text-green-900">
        <Link
          to="/dashboard"
          className="bg-gray-100 flex justify-between px-3 py-2 rounded-lg text-left text-sm font-medium hover:bg-gray-4200 transition-colors"
        >
          Switch to Member{" "}
          <span>
            {" "}
            <ChevronRight />
          </span>
        </Link>
      </div>
    </aside>
  );
}
