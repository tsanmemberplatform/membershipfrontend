import type React from "react";
import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { validateEmailOrPhone } from "../utils/validation";
import Swal from "sweetalert2";
import AuthLayout from "../components/AuthLayout";
import { apiUtils } from "../services/api";

const Login: React.FC = () => {
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [password, setPassword] = useState("");
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const navigate = useNavigate();
  const location = useLocation();

  const {
    login,
    loading: authLoading,
    error: authError,
    clearError,
  } = useAuth();

  // Clear any previous errors when component mounts or inputs change
  useEffect(() => {
    clearError();
  }, [emailOrPhone, password, clearError]);

  useEffect(() => {
    const token = localStorage.getItem("TSANActivate");
    if (token === "true") {
      navigate("/signup/activate");
    }
  }, [navigate]);

  // Handle cross-tab logout messages
  useEffect(() => {
    const state = location.state as { message?: string; type?: string } | null;
    if (state?.message) {
      Swal.fire({
        position: "top-end",
        icon: state.type === "warning" ? "warning" : "info",
        title: state.message,
        showConfirmButton: false,
        timer: 4000,
      });

      // Clear the state to prevent showing the message again
      navigate(location.pathname, { replace: true });
    }
  }, [location.state, location.pathname, navigate]);

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

    if (!password.trim()) {
      errors.push("Password is required");
    }

    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }

    try {
      const response = await login({ email: emailOrPhone, password });
      localStorage.setItem("verifyemail", emailOrPhone);
      // console.log(response);
      if (response?.status) {
        // Persist tokens globally for subsequent authenticated requests
        const authToken =
          (response as any)?.token ?? (response as any)?.data?.token;
        const refreshToken =
          (response as any)?.refreshToken ??
          (response as any)?.data?.refreshToken;
        if (authToken) {
          apiUtils.setAuthTokens(authToken, refreshToken);
        }
        Swal.fire({
          position: "top-end",
          icon: "success",
          title: "Login successful!",
          showConfirmButton: false,
          timer: 1500,
        });
      } else {
        Swal.fire({
          position: "top-end",
          icon: "error",
          title: response?.message || "Login failed. Please try again.",
          showConfirmButton: false,
          timer: 1500,
        });
      }
      // Show success message
      // Swal.fire({
      //   position: "top-end",
      //   icon: "success",
      //   title: "Login successful!",
      //   showConfirmButton: false,
      //   timer: 1500
      // })
    } catch (err: any) {
      console.error("Login error:", err);
      Swal.fire({
        position: "top-end",
        icon: "error",
        title: err?.message || "Login failed. Please try again.",
        showConfirmButton: false,
        timer: 3000,
      });
    }
  };

  return (
    <AuthLayout
      title="Welcome Back"
      subtitle={
        <span>
          First time here?{" "}
          <Link to="/signup" className="auth-link">
            Sign up
          </Link>
        </span>
      }
    >
      {/* Error Messages */}
      {validationErrors.length > 0 && (
        <div className="alert alert-error mb-4">
          {validationErrors.join(". ")}
        </div>
      )}

      {authError && <div className="alert alert-error mb-4">{authError}</div>}

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
            placeholder="Enter email"
            value={emailOrPhone}
            onChange={(e) => setEmailOrPhone(e.target.value)}
            disabled={authLoading}
          />
        </div>

        <div>
          <label htmlFor="password" className="sr-only">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className="auth-input"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={authLoading}
          />
        </div>

        <div className="flex justify-end">
          <Link to="/forgot-password" className="auth-link">
            Forgot Password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={authLoading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {authLoading ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </AuthLayout>
  );
};

export default Login;
