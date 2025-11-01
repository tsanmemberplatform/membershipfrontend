

import type React from "react"
import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { AuthLayout } from "../components/AuthLayout"
import { authAPI } from "../services/api"
import Swal from 'sweetalert2'

export const ActivateAccount: React.FC = () => {
  const [code, setCode] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate();
  const [email] = useState(()=>{
      const savedData = localStorage.getItem('signupInfo');
      return savedData ? JSON.parse(savedData).email : ""
    })

    const [resendCooldown, setResendCooldown] = useState(0)

    useEffect(() => {
        if (resendCooldown > 0) {
          const timer = setTimeout(() => {
            setResendCooldown((prev) => prev - 1)
          }, 1000)
          return () => clearTimeout(timer)
        }
      }, [resendCooldown])
  // console.log(JSON.parse(localStorage.getItem("signupInfo") || "{}"))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (code.length === 6) {
        setIsLoading(true)
        // Simulate API call
        const res = await authAPI.verifyCode({ otp: code, email })
    
          if(res?.status){
            Swal.fire({
              position: "top-end",
              icon: "success",
              title: res?.message,
              showConfirmButton: false,
              timer: 1500
            });
            localStorage.setItem("TSANActivate", "false")
            navigate("/signup/upload-photo")
          }else{
            Swal.fire({
              position: "top-end",
              icon: "error",
              title: res?.message,
              showConfirmButton: false,
              timer: 1500
            });
          }
      }
    } catch (err: any) {
      console.error("Verify code error:", err)
      setIsLoading(false)
      Swal.fire({
        position: "top-end",
        icon: "error",
            title: err?.message,
            showConfirmButton: false,
            timer: 1500
          });
        }
    
  }

  const handleResend = async () => {
    // Simulate resend functionality
    if (resendCooldown > 0) return
    try {
          const res = await authAPI.resendCode(email)
          if(res?.status){
            Swal.fire({
              position: "top-end",
              icon: "success",
              title: res?.message,
              showConfirmButton: false,
              timer: 1500
            });
          }else{
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

  return (
    <AuthLayout>
      <div className="text-center mb-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">Activate your account</h1>
        <p className="text-sm text-gray-600 mb-4">We sent a confirmation code to you email and phone number</p>
        <p className="text-sm text-gray-600">
          Didn't receive the code?{" "}
          <button onClick={handleResend} className="text-green-600 hover:text-green-700">
            Resend
          </button>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mb-8">
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Enter code</label>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
            placeholder="000000"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-center text-lg tracking-widest"
            maxLength={6}
          />
        </div>

        <button
          type="submit"
          disabled={code.length !== 6 || isLoading}
          className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors mb-4"
        >
          {isLoading ? "Activating..." : "Complete sign up"}
        </button>
      </form>

      <div className="text-center">
        <Link to="/login" className="text-green-600 hover:text-green-700 text-sm">
          Back to sign in
        </Link>
      </div>
    </AuthLayout>
  )
}
