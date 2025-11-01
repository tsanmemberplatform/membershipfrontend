import type React from "react"
// import Logo from "./Logo"
import Header from "./Header"

interface AuthLayoutProps {
  children: React.ReactNode
  title?: string
  subtitle?: string | React.ReactNode // Allow React nodes for subtitle
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children, title, subtitle }) => {
  return (
    <div className="auth-container">
      <Header/>
      <div className="auth-card">
        

        <div className="text-center">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">{title}</h1>
          {subtitle && (
            <div className="text-sm text-gray-600 mb-6">
              {" "}
              {/* Changed from p to div to support React nodes */}
              {subtitle}
            </div>
          )}
        </div>

        {children}
      </div>
    </div>
  )
}

export { AuthLayout }
export default AuthLayout
