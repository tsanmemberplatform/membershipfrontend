import type React from "react"
import { useState, useEffect } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import AuthLayout from "../components/AuthLayout"
import { useAuth } from "../hooks/useAuth"
import { authAPI } from "../services/api"
import Swal from 'sweetalert2'

interface VerifyCodeState {
  emailOrPhone: string
}

const VerifyCode: React.FC = () => {
  const [code, setCode] = useState("")
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const [resendCooldown, setResendCooldown] = useState(0)
  const [email] = useState(() => {
    const savedData = localStorage.getItem('emailOrPhone');
    return savedData ? JSON.parse(savedData) : ""
  })

  const { loading, error, clearError } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const state = location.state as VerifyCodeState
  const emailOrPhone = state?.emailOrPhone

  // Redirect if no email/phone in state
  useEffect(() => {
    if (!emailOrPhone) {
      navigate("/forgot-password")
    }
  }, [emailOrPhone, navigate])

  // Clear any previous errors when component mounts or input changes
  useEffect(() => {
    clearError()
  }, [code, clearError])

  // Handle resend cooldown
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown((prev) => prev - 1)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [resendCooldown])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setValidationErrors([])

    // Client-side validation
    const errors: string[] = []
    if (!code.trim()) {
      errors.push("Verification code is required")
    } else if (code.length !== 6) {
      errors.push("Verification code must be 6 digits")
    } else if (!/^\d{6}$/.test(code)) {
      errors.push("Verification code must contain only numbers")
    }

    if (errors.length > 0) {
      setValidationErrors(errors)
      return
    }

    try {
      const res = await authAPI.verifyCode({ otp: code, email })

      if (res?.status) {
        Swal.fire({
          position: "top-end",
          icon: "success",
          title: res?.message,
          showConfirmButton: false,
          timer: 1500
        });
        localStorage.setItem("TSANActivate", "false")
        navigate("/login")
      } else {
        Swal.fire({
          position: "top-end",
          icon: "error",
          title: res?.message,
          showConfirmButton: false,
          timer: 1500
        });
      }

    } catch (err: any) {
      console.error("Verify code error:", err)
      Swal.fire({
        position: "top-end",
        icon: "error",
        title: err?.message,
        showConfirmButton: false,
        timer: 1500
      });
    }
  }

  const handleResendCode = async () => {
    if (resendCooldown > 0) return

    try {
      const res = await authAPI.resendCode(emailOrPhone)
      if (res?.status) {
        Swal.fire({
          position: "top-end",
          icon: "success",
          title: res?.message,
          showConfirmButton: false,
          timer: 1500
        });
      } else {
        Swal.fire({
          position: "top-end",
          icon: "error",
          title: res?.message,
          showConfirmButton: false,
          timer: 1500
        });
      }
      setResendCooldown(60) // 60 second cooldown
    } catch (err: any) {
      console.error("Resend code error:", err)
      Swal.fire({
        position: "top-end",
        icon: "error",
        title: err?.message,
        showConfirmButton: false,
        timer: 1500
      });
    }
  }

  const formatPhoneNumber = (phone: string) => {
    // Simple phone number formatting for display
    if (phone.length === 11 && phone.startsWith("0")) {
      return phone.replace(/(\d{4})(\d{3})(\d{4})/, "$1$2$3")
    }
    return phone
  }

  const getDisplayContact = () => {
    if (!emailOrPhone) return ""

    // Check if it's an email
    if (emailOrPhone.includes("@")) {
      return emailOrPhone
    }

    // Format as phone number
    return formatPhoneNumber(emailOrPhone)
  }

  if (!emailOrPhone) {
    return null // Will redirect
  }

  return (
    <AuthLayout title="Check Your Inbox" subtitle={`We sent a confirmation code to ${getDisplayContact()}`}>
      {/* Error Messages */}
      {(error || validationErrors.length > 0) && (
        <div className="alert alert-error mb-4">{error || validationErrors.join(". ")}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="code" className="sr-only">
            Verification code
          </label>
          <input
            id="code"
            name="code"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={6}
            required
            className="auth-input text-center text-lg tracking-widest"
            placeholder="Enter code"
            value={code}
            onChange={(e) => {
              // Only allow numbers
              const value = e.target.value.replace(/\D/g, "")
              setCode(value)
            }}
            disabled={loading}
          />
        </div>

        <div className="text-center text-sm text-gray-600">
          <span>Didn't receive the code? </span>
          <button
            type="button"
            onClick={handleResendCode}
            disabled={resendCooldown > 0 || loading}
            className={`font-medium ${resendCooldown > 0 || loading
                ? "text-gray-400 cursor-not-allowed"
                : "text-primary-600 hover:text-primary-500"
              }`}
          >
            {resendCooldown > 0 ? `Resend (${resendCooldown}s)` : "Resend"}
          </button>
        </div>

        <button type="submit" disabled={loading} className="auth-button">
          {loading ? "Verifying..." : "Continue"}
        </button>
      </form>

      <div className="text-center mt-6">
        <Link to="/login" className="auth-link">
          Back to sign in
        </Link>
      </div>

      {/* Demo Instructions */}
      <div className="mt-8 p-4 bg-blue-50 rounded-md border border-blue-200">
        <h3 className="text-sm font-medium text-blue-800 mb-2">Demo Instructions:</h3>
        <p className="text-xs text-blue-700">Enter "123456" as the verification code to proceed to password reset.</p>
      </div>
    </AuthLayout>
  )
}

export default VerifyCode
