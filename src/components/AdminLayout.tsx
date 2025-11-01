import type { ReactNode } from "react"
import AdminHeader from "./AdminHeader"
import AdminSideBar from "./AdminSideBar"

interface AdminLayoutProps {
  children: ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader />
      <div className="flex pt-16">
        <AdminSideBar />
        <main className="flex-1 p-6 md:ml-64 overflow-y-auto pt-16">{children}</main>
      </div>
    </div>
  )
}
