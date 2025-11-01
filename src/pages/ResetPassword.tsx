import type React from "react";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import { useAuth } from "../hooks/useAuth";
import { validatePassword, validateConfirmPassword } from "../utils/validation";
import Swal from "sweetalert2";
import { authAPI } from "../services/api";

// interface ResetPasswordState {
//   token: string
//   emailOrPhone: string
// }

const ResetPassword: React.FC = () => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [passwordValidation, setPasswordValidation] = useState({
    hasMinLength: false,
    hasUppercaseAndNumber: false,
  });

  const { resetPassword, loading, error, clearError } = useAuth();
  const [otp, setOtp] = useState("");
  const emailOrPhone = localStorage.getItem("emailOrPhone") || "";
  // const location = useLocation()
  const navigate = useNavigate();
  // Persistent resend cooldown (in seconds)
  const [resendRemaining, setResendRemaining] = useState<number>(0);

  const COOLDOWN_SECONDS = 300; // 5 minutes
  const EXPIRY_KEY = "resendCodeExpiry";

  // Initialize cooldown on page entry if not already running, and keep it in sync with localStorage
  useEffect(() => {
    const initOrLoadExpiry = () => {
      const stored = localStorage.getItem(EXPIRY_KEY);
      const now = Date.now();
      let expiry = stored ? parseInt(stored, 10) : NaN;
      if (!stored || Number.isNaN(expiry) || expiry <= now) {
        // Start a new 5-minute window on first entry or if expired
        expiry = now + COOLDOWN_SECONDS * 1000;
        localStorage.setItem(EXPIRY_KEY, String(expiry));
      }
      const remaining = Math.max(0, Math.ceil((expiry - now) / 1000));
      setResendRemaining(remaining);
    };
    initOrLoadExpiry();

    const interval = setInterval(() => {
      const stored = localStorage.getItem(EXPIRY_KEY);
      const now = Date.now();
      const expiry = stored ? parseInt(stored, 10) : 0;
      const remaining = Math.max(0, Math.ceil((expiry - now) / 1000));
      setResendRemaining(remaining);
      if (remaining <= 0) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (totalSeconds: number) => {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const handleResendCode = async () => {
    if (resendRemaining > 0) return;

    try {
      const res = await authAPI.forgotPassword({ email: emailOrPhone });
      if (res?.status) {
        Swal.fire({
          position: "top-end",
          icon: "success",
          title: res?.message,
          showConfirmButton: false,
          timer: 1500,
        });
      } else {
        Swal.fire({
          position: "top-end",
          icon: "error",
          title: res?.message,
          showConfirmButton: false,
          timer: 1500,
        });
      }
      // Start a fresh 5-minute cooldown after any resend attempt
      const newExpiry = Date.now() + COOLDOWN_SECONDS * 1000;
      localStorage.setItem(EXPIRY_KEY, String(newExpiry));
      setResendRemaining(COOLDOWN_SECONDS);
    } catch (err: any) {
      console.error("Resend code error:", err);
      Swal.fire({
        position: "top-end",
        icon: "error",
        title: "Failed to resend code. Please try again.",
        showConfirmButton: false,
        timer: 1500,
      });
    }
  };

  // const state = location.state as ResetPasswordState
  // const token = state?.token
  //   const emailOrPhone = state?.emailOrPhone

  // Redirect if no token in state
  // useEffect(() => {
  //   if (!token) {
  //     navigate("/forgot-password")
  //   }
  // }, [token, navigate])

  // Clear any previous errors when component mounts or inputs change
  useEffect(() => {
    clearError();
  }, [newPassword, confirmPassword, clearError]);

  // Update password validation in real-time
  useEffect(() => {
    const validation = validatePassword(newPassword);
    setPasswordValidation({
      hasMinLength: validation.hasMinLength,
      hasUppercaseAndNumber: validation.hasUppercaseAndNumber,
    });
  }, [newPassword]);

  // UI helper: do the two password fields match?
  const passwordsMatch =
    newPassword.length > 0 &&
    confirmPassword.length > 0 &&
    newPassword === confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationErrors([]);

    // Client-side validation
    const errors: string[] = [];

    if (!newPassword.trim()) {
      errors.push("New password is required");
    } else {
      const validation = validatePassword(newPassword);
      if (!validation.isValid) {
        if (!validation.hasMinLength) {
          errors.push("Password must be at least 8 characters long");
        }
        if (!validation.hasUppercaseAndNumber) {
          errors.push(
            "Password must contain at least one uppercase letter and one number"
          );
        }
      }
    }

    if (!confirmPassword.trim()) {
      errors.push("Please confirm your password");
    } else if (!validateConfirmPassword(newPassword, confirmPassword)) {
      errors.push("Passwords do not match");
    }

    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }

    try {
      const response = await resetPassword({
        newPassword,
        confirmPassword,
        otp,
        email: localStorage.getItem("emailOrPhone") || "",
      });

      if (response.status) {
        Swal.fire({
          position: "top-end",
          icon: "success",
          title: "Password reset successfully",
          showConfirmButton: false,
          timer: 1500,
        });
        navigate("/login");
      }
    } catch (err: any) {
      console.error("Reset password error:", err);
      // Error is handled by useAuth hook
    }
  };

  // if (!token) {
  //   return null // Will redirect
  // }

  return (
    <AuthLayout
      title="Reset Your Password"
      subtitle="Enter a new password to change your password."
    >
      {/* Error Messages */}
      {(error || validationErrors.length > 0) && (
        <div className="alert alert-error mb-4">
          {error || validationErrors.join(". ")}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="token" className="sr-only">
            Token
          </label>
          <input
            id="token"
            name="token"
            type="text"
            autoComplete="new-password"
            required
            className="auth-input"
            placeholder="Token"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            disabled={loading}
          />
        </div>
        <div>
          <label htmlFor="newPassword" className="sr-only">
            New password
          </label>
          <input
            id="newPassword"
            name="newPassword"
            type="password"
            autoComplete="new-password"
            required
            className="auth-input"
            placeholder="New password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            disabled={loading}
          />
        </div>

        <div>
          <label htmlFor="confirmPassword" className="sr-only">
            Confirm password
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            required
            className="auth-input"
            placeholder="Confirm password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={loading}
          />
        </div>

        {/* Password Requirements */}
        <div className="space-y-2">
          <p className="text-sm text-gray-600 font-medium">
            Your password should have
          </p>

          <div className="flex items-center space-x-2">
            <div
              className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                passwordValidation.hasMinLength
                  ? "bg-green-500 border-green-500"
                  : "border-gray-300"
              }`}
            >
              {passwordValidation.hasMinLength && (
                <svg
                  className="w-2.5 h-2.5 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </div>
            <span
              className={`text-sm ${
                passwordValidation.hasMinLength
                  ? "text-green-600"
                  : "text-gray-600"
              }`}
            >
              Min. 8 characters
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <div
              className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                passwordsMatch
                  ? "bg-green-500 border-green-500"
                  : "border-gray-300"
              }`}
            >
              {passwordsMatch && (
                <svg
                  className="w-2.5 h-2.5 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </div>
            <span
              className={`text-sm ${
                passwordsMatch ? "text-green-600" : "text-gray-600"
              }`}
            >
              Passwords match
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <div
              className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                passwordValidation.hasUppercaseAndNumber
                  ? "bg-green-500 border-green-500"
                  : "border-gray-300"
              }`}
            >
              {passwordValidation.hasUppercaseAndNumber && (
                <svg
                  className="w-2.5 h-2.5 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </div>
            <span
              className={`text-sm ${
                passwordValidation.hasUppercaseAndNumber
                  ? "text-green-600"
                  : "text-gray-600"
              }`}
            >
              An uppercase and a number
            </span>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !passwordsMatch}
          className="auth-button mt-6"
        >
          {loading ? "Saving..." : "Save new password"}
        </button>
      </form>
      {resendRemaining > 0 && (
        <div className="text-center mt-4 text-sm text-gray-600">
          You can request a new code in {formatTime(resendRemaining)}.
        </div>
      )}

      <div className="text-center mt-6">
        <Link to="/login" className="auth-link">
          Back to sign in
        </Link>
        <div>
          Didn't get the code?{" "}
          <button
            className="auth-link disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleResendCode}
            disabled={resendRemaining > 0}
          >
            {resendRemaining > 0 ? `Resend` : "Resend"}
          </button>
        </div>
      </div>

      {/* Demo Instructions */}
      {/* <div className="mt-8 p-4 bg-blue-50 rounded-md border border-blue-200">
        <h3 className="text-sm font-medium text-blue-800 mb-2">Demo Instructions:</h3>
        <p className="text-xs text-blue-700">
          Enter a password that meets both requirements to see the checkmarks turn green, then submit to complete the
          flow.
        </p>
      </div> */}
    </AuthLayout>
  );
};

export default ResetPassword;
