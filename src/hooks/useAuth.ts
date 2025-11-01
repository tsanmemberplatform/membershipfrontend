import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import type {
  LoginCredentials,
  ForgotPasswordRequest,
  VerifyCodeRequest,
  ResetPasswordRequest,
} from "../types/auth";
import {
  loginFailure,
  loginStart,
  loginSuccess,
} from "../store/slices/authSlice";
import { authAPI } from "../services/api";
// import Swal from "sweetalert2"

export const useAuth = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const clearError = () => setError(null);

  const dispatch = useDispatch();

  const login = useCallback(
    async (credentials: LoginCredentials) => {
      dispatch(loginStart());
      setLoading(true);
      setError(null);

      try {
        const response = await authAPI.login(credentials);
        console.log(response);
        if (response.status) {
          const { token, userInfo, tempToken } = response;

          const theVal = token ? token : tempToken;
          if (theVal) {
            localStorage.setItem("authToken", theVal);
            dispatch(loginSuccess({ userInfo, token: theVal }));
            // Swal.fire({
            //   position: "top-end",
            //   icon: "success",
            //   title: "Login successful!",
            //   showConfirmButton: false,
            //   timer: 1500
            // })
            if (token === undefined) {
              navigate("/verify-login");
            } else {
              navigate("/dashboard");
            }
          }
          return response;
        } else {
          dispatch(loginFailure(response.message || "Login failed"));
          return response;
          // Swal.fire({
          //   position: "top-end",
          //   icon: "error",
          //   title: response.message || "Login failed",
          //   showConfirmButton: false,
          //   timer: 1500
          // })
        }
      } catch (err: any) {
        dispatch(loginFailure(err.message));
        throw new Error(err.message);
      } finally {
        setLoading(false);
      }
    },
    [dispatch, navigate]
  );

  const forgotPassword = async (request: ForgotPasswordRequest) => {
    setLoading(true);
    setError(null);

    try {
      // Simulate API call delay
      const response = await authAPI.forgotPassword({ email: request.email });

      // For demo purposes, simulate successful request
      // In production, this would be:

      // const mockResponse = {
      //   success: true,
      //   message: "Verification code sent successfully",
      // }

      // if (mockResponse.success) {
      //   navigate("/verify-code", {
      //     state: { email: request.email },
      //   })

      return response;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const verifyCode = async (request: VerifyCodeRequest) => {
    setLoading(true);
    setError(null);

    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // For demo purposes, accept "123456" as valid code
      if (request.otp === "123456") {
        const mockResponse = {
          success: true,
          message: "Code verified successfully",
          token: "mock-reset-token-" + Date.now(),
        };

        navigate("/reset-password", {
          state: {
            token: mockResponse.token,
            emailOrPhone: request.email,
          },
        });
        return mockResponse;
      } else {
        throw new Error("Invalid verification code. Please try again.");
      }

      // In production, this would be:
      // const response = await authAPI.verifyCode(request);
      // if (response.success) {
      //   navigate("/reset-password", {
      //     state: {
      //       token: response.token,
      //       emailOrPhone: request.emailOrPhone,
      //     },
      //   })
      //   return response
      // } else {
      //   throw new Error(response.message)
      // }
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (request: ResetPasswordRequest) => {
    console.log(request);
    setLoading(true);
    setError(null);

    try {
      // Simulate API call delay
      // await new Promise((resolve) => setTimeout(resolve, 1500))
      const response = await authAPI.resetPassword(request);

      // For demo purposes, simulate successful password reset

      if (response.status) {
        // navigate("/login", {
        //   state: {
        //     message: "Password has been changed successfully",
        //     type: "success",
        //   },
        // })
        return response;
      } else {
        throw new Error(response.message);
      }

      // In production, this would be:
      // const response = await authAPI.resetPassword(request);
      // if (response.success) {
      //   navigate("/login", {
      //     state: { message: "Password has been changed successfully" },
      //   })
      //   return response
      // } else {
      //   throw new Error(response.message)
      // }
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const resendCode = async (emailOrPhone: string) => {
    console.log(emailOrPhone);
    setLoading(true);
    setError(null);

    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // For demo purposes, simulate successful resend
      const mockResponse = {
        success: true,
        message: "Verification code resent successfully",
      };

      return mockResponse;

      // In production, this would be:
      // const response = await authAPI.resendCode(emailOrPhone)
      // return response
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    clearError,
    login,
    forgotPassword,
    verifyCode,
    resetPassword,
    resendCode,
  };
};
