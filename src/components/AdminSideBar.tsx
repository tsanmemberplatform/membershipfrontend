import { NavLink } from "react-router-dom"
import { Home, Users, Calendar, FileText, User, Shield } from "lucide-react"

const navigation = [
  { name: "Home", href: "/", icon: Home },
  { name: "Roster", href: "/admin/roster", icon: Users },
  { name: "Event", href: "/admin/event", icon: Calendar },
  { name: "Reports", href: "/admin/reports", icon: FileText },
  { name: "Users", href: "/admin/users", icon: User },
  { name: "Audit log", href: "/admin/audit-log", icon: Shield },
]

export default function AdminSidebar() {
  return (
    <aside className="hidden md:flex md:flex-col md:w-64 bg-white shadow-sm fixed left-0 top-16 bottom-0 overflow-y-auto">
      <nav className="mt-6">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }) =>
              `flex items-center px-6 py-3 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-green-50 text-green-700 border-r-2 border-green-600"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`
            }
          >
            <item.icon className="w-5 h-5 mr-3" />
            {item.name}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
