import type React from "react";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import { useAuth } from "../hooks/useAuth";
import { validateEmailOrPhone } from "../utils/validation";
import Swal from "sweetalert2";

const ForgotPassword: React.FC = () => {
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const navigate = useNavigate();
  const { forgotPassword, loading, error, clearError } = useAuth();

  // Clear any previous errors when component mounts or input changes
  useEffect(() => {
    clearError();
  }, [emailOrPhone, clearError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationErrors([]);

    // Client-side validation
    const errors: string[] = [];
    if (!emailOrPhone.trim()) {
      errors.push("Email or phone number is required");
    } else if (!validateEmailOrPhone(emailOrPhone)) {
      errors.push("Please enter a valid email or phone number");
    }

    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }

    try {
      const response = await forgotPassword({ email: emailOrPhone });

      if (response.status) {
        Swal.fire({
          position: "top-end",
          icon: "success",
          title: "Reset code sent successfully",
          showConfirmButton: false,
          timer: 1500,
        });
        localStorage.setItem("emailOrPhone", emailOrPhone);
        navigate("/reset");
      }
    } catch (err: any) {
      console.error("Forgot password error:", err);
      Swal.fire({
        position: "top-end",
        icon: "error",
        title: err?.message || "Failed to send reset code. Please try again.",
        showConfirmButton: false,
        timer: 1500,
      });
    }
  };

  return (
    <AuthLayout
      title="Forgot Your Password"
      subtitle="Don't worry. Enter your email or phone number and we will send a code to change your password."
    >
      {/* Error Messages */}
      {(error || validationErrors.length > 0) && (
        <div className="alert alert-error mb-4">
          {error || validationErrors.join(". ")}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="emailOrPhone" className="sr-only">
            Email or phone number
          </label>
          <input
            id="emailOrPhone"
            name="emailOrPhone"
            type="text"
            autoComplete="username"
            required
            className="auth-input"
            placeholder="Enter email/phone number"
            value={emailOrPhone}
            onChange={(e) => setEmailOrPhone(e.target.value)}
            disabled={loading}
          />
        </div>

        <button type="submit" disabled={loading} className="auth-button">
          {loading ? "Sending..." : "Continue"}
        </button>
      </form>
      {/* <div></div> */}
      <div className="text-center mt-6">
        <Link to="/login" className="auth-link">
          Back to sign in
        </Link>
      </div>

      {/* Demo Instructions */}
      {/* <div className="mt-8 p-4 bg-blue-50 rounded-md border border-blue-200">
        <h3 className="text-sm font-medium text-blue-800 mb-2">Demo Instructions:</h3>
        <p className="text-xs text-blue-700">Enter any valid email or phone number to proceed to verification step.</p>
      </div> */}
    </AuthLayout>
  );
};

export default ForgotPassword;
