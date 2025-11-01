import axios, {
  type AxiosResponse,
  type AxiosError,
  type InternalAxiosRequestConfig,
} from "axios";
import type {
  SignUpCredentials,
  LoginCredentials,
  ForgotPasswordRequest,
  VerifyCodeRequest,
  ResetPasswordRequest,
  AuthResponse,
  UploadPhotoResponse,
  GetUserResponse,
  AddActivityResponse,
  GetEventResponse,
  GetTrainingResponse,
  GetAwardResponse,
  GetEvent,
} from "../types/auth";

// import { SignUp } from "../pages/SignUp"

interface ApiConfig {
  baseURL: string;
  timeout: number;
  retryAttempts: number;
  retryDelay: number;
}

const config: ApiConfig = {
  baseURL: import.meta.env.VITE_API_BASE_URL || "https://api.example.com",
  timeout: 30000, // Increased timeout for production
  retryAttempts: 3,
  retryDelay: 1000,
};

// Create axios instance with enhanced configuration
export const api = axios.create({
  baseURL: config.baseURL,
  timeout: config.timeout,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
    Authorization: `Bearer ${localStorage.getItem("authToken")}`,
  },
});

// Prevent multiple redirects when several requests fail with 401 at once
let isRedirectingToLogin = false;

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Add auth token if available
    const token = localStorage.getItem("authToken");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add request ID for tracking
    config.headers.set(
      "X-Request-ID",
      `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    );

    // Log request in development
    if (import.meta.env.DEV) {
      console.log(
        `[API Request] ${config.method?.toUpperCase()} ${config.url}`,
        {
          data: config.data,
          headers: config.headers,
        }
      );
    }

    return config;
  },
  (error) => {
    console.error("[API Request Error]", error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response: AxiosResponse) => {
    // Log response in development
    if (import.meta.env.DEV) {
      console.log(
        `[API Response] ${response.status} ${response.config.url}`,
        response.data
      );
    }
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
      _retryCount?: number;
    };

    // Log error in development
    if (import.meta.env.DEV) {
      console.error("[API Response Error]", {
        status: error.response?.status,
        message: error.message,
        url: error.config?.url,
        data: error.response?.data,
      });
    }

    // Handle 401 Unauthorized - redirect to login
    if (error.response?.status === 401) {
      localStorage.removeItem("authToken");
      localStorage.removeItem("refreshToken");

      // Avoid redirect loop if already on login page
      if (
        typeof window !== "undefined" &&
        !window.location.pathname.includes("/login")
      ) {
        if (!isRedirectingToLogin) {
          isRedirectingToLogin = true;
          // Use replace so back button doesn't return to a broken state
          window.location.replace("/login");
        }
      }
      return Promise.reject(error);
    }

    // Handle 403 Forbidden - user doesn't have permission
    if (error.response?.status === 403) {
      console.warn("[API] Access forbidden - insufficient permissions");
      return Promise.reject(error);
    }

    // Retry logic for network errors and 5xx server errors
    const shouldRetry =
      !originalRequest._retry &&
      originalRequest &&
      (!error.response || // Network error
        error.response.status >= 500 || // Server error
        error.code === "ECONNABORTED"); // Timeout

    if (shouldRetry) {
      originalRequest._retryCount = (originalRequest._retryCount || 0) + 1;

      if (originalRequest._retryCount <= config.retryAttempts) {
        originalRequest._retry = true;

        // Exponential backoff
        const delay =
          config.retryDelay * Math.pow(3, originalRequest._retryCount - 1);

        console.log(
          `[API] Retrying request (${originalRequest._retryCount}/${config.retryAttempts}) after ${delay}ms`
        );

        await new Promise((resolve) => setTimeout(resolve, delay));
        return api(originalRequest);
      }
    }

    return Promise.reject(error);
  }
);

export const authAPI = {
  SignUp: async (credentials: SignUpCredentials): Promise<AuthResponse> => {
    try {
      const response: AxiosResponse<AuthResponse> = await api.post(
        "/users/newRegister",
        {
          ...credentials,
          // deviceInfo: {
          //   userAgent: navigator.userAgent,
          //   timestamp: new Date().toISOString(),
          // },
        }
      );

      // Validate response structure
      if (!response.data || typeof response.data.status !== "boolean") {
        throw new Error("Invalid response format from server");
      }

      return response.data;
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Login failed";
      throw new Error(message);
    }
  },
  // Login user
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    try {
      const response: AxiosResponse<AuthResponse> = await api.post(
        "/users/login",
        {
          ...credentials,
          // deviceInfo: {
          //   userAgent: navigator.userAgent,
          //   timestamp: new Date().toISOString(),
          // },
        }
      );

      // Validate response structure
      if (!response.data || typeof response.data.status !== "boolean") {
        throw new Error("Invalid response format from server");
      }
      console.log(response.data);

      return response.data;
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Login failed";
      throw new Error(message);
    }
  },

  // Request password reset
  forgotPassword: async (
    request: ForgotPasswordRequest
  ): Promise<AuthResponse> => {
    try {
      const response: AxiosResponse<AuthResponse> = await api.post(
        "/users/forgot-password",
        {
          email: request.email,
        }
      );

      if (!response.data || typeof response.data.status !== "boolean") {
        throw new Error("Invalid response format from server");
      }

      return response.data;
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Failed to send reset code";
      throw new Error(message);
    }
  },

  // Verify reset code
  verifyCode: async (request: VerifyCodeRequest): Promise<AuthResponse> => {
    try {
      const response: AxiosResponse<AuthResponse> = await api.post(
        "/users/verify-otp",
        {
          ...request,
          // timestamp: new Date().toISOString(),
        }
      );

      if (!response.data || typeof response.data.status !== "boolean") {
        throw new Error("Invalid response format from server");
      }

      return response.data;
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Invalid verification code";
      throw new Error(message);
    }
  },
  verify2FACode: async (request: any): Promise<AuthResponse> => {
    try {
      const response: AxiosResponse<AuthResponse> = await api.post(
        "/users/auth/login-email-2fa",
        {
          ...request,
          // timestamp: new Date().toISOString(),
        }
      );

      if (!response.data || typeof response.data.status !== "boolean") {
        throw new Error("Invalid response format from server");
      }

      return response.data;
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Invalid verification code";
      throw new Error(message);
    }
  },

  // Reset password
  resetPassword: async (
    request: ResetPasswordRequest
  ): Promise<AuthResponse> => {
    try {
      const response: AxiosResponse<AuthResponse> = await api.post(
        "/users/reset-password",
        {
          password: request.newPassword,
          confirmPassword: request.confirmPassword,
          otp: request.otp,
          email: request.email,
        }
      );

      if (!response.data || typeof response.data.status !== "boolean") {
        throw new Error("Invalid response format from server");
      }

      return response.data;
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Failed to reset password";
      throw new Error(message);
    }
  },

  // Resend verification code
  resendCode: async (email: string): Promise<AuthResponse> => {
    try {
      const response: AxiosResponse<AuthResponse> = await api.post(
        "/users/resend-otp",
        {
          email,
          // timestamp: new Date().toISOString(),
        }
      );

      if (!response.data || typeof response.data.status !== "boolean") {
        throw new Error("Invalid response format from server");
      }

      return response.data;
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Failed to resend code";
      throw new Error(message);
    }
  },

  // Refresh authentication token
  refreshToken: async (): Promise<AuthResponse> => {
    try {
      const refreshToken = localStorage.getItem("refreshToken");
      if (!refreshToken) {
        throw new Error("No refresh token available");
      }

      const response: AxiosResponse<AuthResponse> = await api.post(
        "/auth/refresh",
        {
          refreshToken,
          timestamp: new Date().toISOString(),
        }
      );

      if (!response.data || typeof response.data.status !== "boolean") {
        throw new Error("Invalid response format from server");
      }

      return response.data;
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Failed to refresh token";
      throw new Error(message);
    }
  },

  twoFASetup: async (credentials: string) => {
    try {
      const response = await api.post("users/auth/2fa/setup", {
        userId: credentials,
      });
      if (!response.data || typeof response.data.status !== "boolean") {
        throw new Error("Invalid response format from server");
      }
      return response.data;
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Failed to enable 2fa";
      throw new Error(message);
    }
  },

  twofactorVerify: async (credentials: any) => {
    try {
      const response = await api.post("users/twofa/verify", { ...credentials });
      if (!response.data || typeof response.data.status !== "boolean") {
        throw new Error("Invalid response format from server");
      }
      return response.data;
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Failed to enable 2fa";
      throw new Error(message);
    }
  },

  // Logout user
  logout: async (): Promise<AuthResponse> => {
    try {
      const response: AxiosResponse<AuthResponse> = await api.post(
        "/auth/logout",
        {
          timestamp: new Date().toISOString(),
        }
      );

      // Clear local storage regardless of response
      localStorage.removeItem("authToken");
      localStorage.removeItem("refreshToken");

      return response.data;
    } catch (error: any) {
      // Still clear local storage on error
      localStorage.removeItem("authToken");
      localStorage.removeItem("refreshToken");

      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Logout failed";
      throw new Error(message);
    }
  },

  // Check authentication status
  checkAuth: async (): Promise<AuthResponse> => {
    try {
      const response: AxiosResponse<AuthResponse> = await api.get("/auth/me");

      if (!response.data || typeof response.data.status !== "boolean") {
        throw new Error("Invalid response format from server");
      }

      return response.data;
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Authentication check failed";
      throw new Error(message);
    }
  },

  uploadUserPhoto: async (formData: FormData): Promise<UploadPhotoResponse> => {
    try {
      // Create a custom config for this request to override the default headers
      const config = {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      };

      const response: AxiosResponse<UploadPhotoResponse> = await api.put(
        "/users/update-profile",
        formData,
        config
      );

      if (!response.data || typeof response.data.status !== "boolean") {
        throw new Error("Invalid response format from server");
      }

      return response.data;
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Failed to upload photo";
      throw new Error(message);
    }
  },

  getUserInfo: async (credentials: any): Promise<GetUserResponse> => {
    try {
      const response: AxiosResponse<GetUserResponse> = await api.get(
        `/users/scout/${credentials.id}`
      );

      if (!response.data || typeof response.data.status !== "boolean") {
        throw new Error("Invalid response format from server");
      }

      return response.data;
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Failed to get user info";
      throw new Error(message);
    }
  },
  updateUserProfile: async (credentials: any): Promise<GetUserResponse> => {
    try {
      const response: AxiosResponse<GetUserResponse> = await api.put(
        `/users/profile`,
        // {
        //   scoutingRole: credentials.role,
        //   fullName: credentials.firstName + " " + credentials.lastName,
        //   phoneNumber: credentials.phoneNumber,
        // }
        { ...credentials }
      );

      if (!response.data || typeof response.data.status !== "boolean") {
        throw new Error("Invalid response format from server");
      }

      return response.data;
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Failed to update user profile";
      throw new Error(message);
    }
  },

  addLogs: async (credentials: any): Promise<AddActivityResponse> => {
    try {
      const response: AxiosResponse<AddActivityResponse> = await api.post(
        `/logs`,
        credentials,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );

      if (typeof response.data.status !== "boolean") {
        throw new Error("Invalid response format from server");
      }

      return response.data;
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Failed to add logs";
      throw new Error(message);
    }
  },

  getAllLogs: async (
    queryParams: string = ""
  ): Promise<AddActivityResponse> => {
    try {
      const response: AxiosResponse<AddActivityResponse> = await api.get(
        `/logs/my-logs${queryParams}`
      );
      return response.data;
    } catch (error: any) {
      console.error("Error getting all logs:", error);
      return {
        status: false,
        message: error.response?.data?.message || "Error getting logs",
      };
    }
  },

  addCertificate: async (formData: FormData): Promise<AddActivityResponse> => {
    try {
      const response: AxiosResponse<AddActivityResponse> = await api.post(
        `/trainings`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );

      if (typeof response.data.status !== "boolean") {
        throw new Error("Invalid response format from server");
      }

      return response.data;
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Failed to add certificate";
      throw new Error(message);
    }
  },

  addAward: async (credentials: any): Promise<AddActivityResponse> => {
    try {
      const response: AxiosResponse<AddActivityResponse> = await api.post(
        `/awards/createAward`,
        credentials,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );

      if (typeof response.data.status !== "boolean") {
        throw new Error("Invalid response format from server");
      }

      return response.data;
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Failed to add award";
      throw new Error(message);
    }
  },

  // getAllCertificates: async (): Promise<GetTrainingResponse> => {
  //   try {
  //     const response: AxiosResponse<GetTrainingResponse> = await api.get(
  //       `/trainings/me`
  //     );

  //     if (typeof response.data.status !== "boolean") {
  //       throw new Error("Invalid response format from server");
  //     }

  //     return response.data;
  //   } catch (error: any) {
  //     const message =
  //       error.response?.data?.message ||
  //       error.response?.data?.error ||
  //       error.message ||
  //       "Failed to get all certificates";
  //     throw new Error(message);
  //   }
  // },

  // getAwards: async (id: string): Promise<GetAwardResponse> => {
  //   try {
  //     const response: AxiosResponse<GetAwardResponse> = await api.get(
  //       `/awards/user/${id}`
  //     );

  //     if (typeof response.data.status !== "boolean") {
  //       throw new Error("Invalid response format from server");
  //     }

  //     return response.data;
  //   } catch (error: any) {
  //     const message =
  //       error.response?.data?.message ||
  //       error.response?.data?.error ||
  //       error.message ||
  //       "Failed to get all awards";
  //     throw new Error(message);
  //   }
  // },

  getAllCertificates: async (
    queryParams: string = ""
  ): Promise<GetTrainingResponse> => {
    try {
      const response: AxiosResponse<GetTrainingResponse> = await api.get(
        `/trainings/me${queryParams}`
      );
      return response.data;
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Failed to get all awards";
      throw new Error(message);
    }
  },

  // Update the getAwards function
  getAwards: async (
    id: string,
    queryParams: string = ""
  ): Promise<GetAwardResponse> => {
    try {
      const response: AxiosResponse<GetAwardResponse> = await api.get(
        `/awards/user/${id}${queryParams}`
      );
      return response.data;
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Failed to get all awards";
      throw new Error(message);
    }
  },

  getAllEvents: async (queryString: string = ""): Promise<GetEventResponse> => {
    try {
      const response: AxiosResponse<GetEventResponse> = await api.get(
        `/events${queryString}`
      );

      if (typeof response.data.status !== "boolean") {
        throw new Error("Invalid response format from server");
      }

      return response.data;
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Failed to get all events";
      throw new Error(message);
    }
  },

  getMyEvents: async (queryParams: string = ""): Promise<GetEventResponse> => {
    try {
      const response: AxiosResponse<GetEventResponse> = await api.get(
        `/events/personal/my-events${queryParams}`
      );

      if (typeof response.data.status !== "boolean") {
        throw new Error("Invalid response format from server");
      }

      return response.data;
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Failed to get all events";
      throw new Error(message);
    }
  },

  getEvent: async (id: string): Promise<GetEvent> => {
    try {
      const response: AxiosResponse<GetEvent> = await api.get(`/events/${id}`);

      if (typeof response.data.status !== "boolean") {
        throw new Error("Invalid response format from server");
      }

      return response.data;
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Failed to get event";
      throw new Error(message);
    }
  },

  addEvent: async (credentials: any): Promise<AddActivityResponse> => {
    try {
      const response: AxiosResponse<AddActivityResponse> = await api.post(
        `/events`,
        credentials,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );

      if (typeof response.data.status !== "boolean") {
        throw new Error("Invalid response format from server");
      }

      return response.data;
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Failed to add event";
      throw new Error(message);
    }
  },
  upcomingEvents: async (): Promise<GetEventResponse> => {
    try {
      const response: AxiosResponse<GetEventResponse> = await api.get(
        `/events/next/upcoming?page=1`
      );

      if (typeof response.data.status !== "boolean") {
        throw new Error("Invalid response format from server");
      }

      return response.data;
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Failed to get upcoming events";
      throw new Error(message);
    }
  },

  registerForAnEvent: async (credentials: any) => {
    try {
      const response: AxiosResponse<AddActivityResponse> = await api.post(
        `/events/${credentials.id}/register`,
        {
          status: credentials.status,
        }
      );

      if (typeof response.data.status !== "boolean") {
        throw new Error("Invalid response format from server");
      }

      return response.data;
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Failed to register for event";
      throw new Error(message);
    }
  },
  updatePassword: async (credentials: any): Promise<AddActivityResponse> => {
    try {
      const response: AxiosResponse<AddActivityResponse> = await api.post(
        `/users/change-password`,
        credentials
      );

      if (typeof response.data.status !== "boolean") {
        throw new Error("Invalid response format from server");
      }

      return response.data;
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Failed to update password";
      throw new Error(message);
    }
  },
  getUserDashboardInfo: async (): Promise<any> => {
    try {
      const response = await api.get(`/users/dashboard/summary`);

      if (typeof response.data.status !== "boolean") {
        throw new Error("Invalid response format from server");
      }
      if (response.data.status === false) {
        throw new Error(response.data.message || "Failed to get user info");
      }
      return response.data;
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Failed to get user info";
      throw new Error(message);
    }
  },
};

export const adminAPI = {
  getAllUsers: async (params: any): Promise<any> => {
    try {
      const response = await api.get("/admin/users" + params);

      if (typeof response.data.status !== "boolean") {
        throw new Error("Invalid response format from server");
      }
      if (response.data.status === false) {
        throw new Error(response.data.message || "Failed to get all users");
      }
      return response.data;
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Failed to get all users";
      throw new Error(message);
    }
  },
  getUserInfo: async (id: string): Promise<any> => {
    try {
      const response = await api.get(`/admin/user/${id}`);

      if (typeof response.data.status !== "boolean") {
        throw new Error("Invalid response format from server");
      }
      if (response.data.status === false) {
        throw new Error(response.data.message || "Failed to get user info");
      }
      return response.data;
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Failed to get user info";
      throw new Error(message);
    }
  },
  getUsersByStatus: async (status: string): Promise<any> => {
    try {
      const response = await api.get(`/admin/users/status/${status}`);

      if (typeof response.data.status !== "boolean") {
        throw new Error("Invalid response format from server");
      }
      if (response.data.status === false) {
        throw new Error(
          response.data.message || "Failed to get users by status"
        );
      }
      return response.data;
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Failed to get users by status";
      throw new Error(message);
    }
  },
  getScoutStats: async (): Promise<any> => {
    try {
      const response = await api.get("/admin/users/stats");

      if (typeof response.data.status !== "boolean") {
        throw new Error("Invalid response format from server");
      }
      if (response.data.status === false) {
        throw new Error(response.data.message || "Failed to get scout stats");
      }
      return response.data;
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Failed to get scout stats";
      throw new Error(message);
    }
  },
  getAllEvents: async (params: string): Promise<any> => {
    try {
      const response = await api.get("/events" + params);

      if (typeof response.data.status !== "boolean") {
        throw new Error("Invalid response format from server");
      }
      if (response.data.status === false) {
        throw new Error(response.data.message || "Failed to get all events");
      }
      return response.data;
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Failed to get all events";
      throw new Error(message);
    }
  },
  inviteUser: async (info: any) => {
    try {
      const response = await api.post("/admin/invite", info);
      if (typeof response.data.status !== "boolean") {
        throw new Error("Invalid response format from server");
      }
      if (response.data.status === false) {
        throw new Error(response.data.message || "Failed to invite user");
      }
      return response.data;
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Failed to invite user";
      throw new Error(message);
    }
  },
  updateUserProfileInfo: async (credentials: any): Promise<GetUserResponse> => {
    try {
      const response: AxiosResponse<GetUserResponse> = await api.patch(
        `/admin/adminEdit/${credentials.id}`,
        // {
        //   scoutingRole: credentials.role,
        //   fullName: credentials.firstName + " " + credentials.lastName,
        //   phoneNumber: credentials.phoneNumber,
        // }
        { ...credentials }
      );

      if (!response.data || typeof response.data.status !== "boolean") {
        throw new Error("Invalid response format from server");
      }

      return response.data;
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Failed to update user profile";
      throw new Error(message);
    }
  },
  auditTrails: async (params: string): Promise<any> => {
    try {
      const response = await api.get("/admin/auditTrails" + params);

      if (typeof response.data.status !== "boolean") {
        throw new Error("Invalid response format from server");
      }
      if (response.data.status === false) {
        throw new Error(response.data.message || "Failed to get audit trails");
      }
      return response.data;
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Failed to get audit trails";
      throw new Error(message);
    }
  },
  sendMessageToUsers: async (info: any) => {
    try {
      // Allow either FormData (multipart) or JSON payloads.
      const isFormData =
        typeof FormData !== "undefined" && info instanceof FormData;
      const token = localStorage.getItem("authToken");
      if (isFormData) {
        // When sending FormData, include multipart/form-data header for the request.
        // Axios/browser will handle the boundary.
        const response = await api.post("/admin/send-message", info, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });
        if (typeof response.data.status !== "boolean") {
          throw new Error("Invalid response format from server");
        }
        if (response.data.status === false) {
          throw new Error(response.data.message || "Failed to send message");
        }
        return response.data;
      } else {
        const response = await api.post("/admin/send-message", info, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        if (typeof response.data.status !== "boolean") {
          throw new Error("Invalid response format from server");
        }
        if (response.data.status === false) {
          throw new Error(response.data.message || "Failed to send message");
        }
        return response.data;
      }
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Failed to send message";
      throw new Error(message);
    }
  },
  getAllMessages: async (params: string): Promise<any> => {
    try {
      const response = await api.get("/admin/messages" + params);

      if (typeof response.data.status !== "boolean") {
        throw new Error("Invalid response format from server");
      }
      if (response.data.status === false) {
        throw new Error(response.data.message || "Failed to get messages");
      }
      return response.data;
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Failed to get messages";
      throw new Error(message);
    }
  },
  deleteMessage: async (id: string): Promise<any> => {
    try {
      const response = await api.delete(`/admin/messages/${id}`);

      if (typeof response.data.status !== "boolean") {
        throw new Error("Invalid response format from server");
      }
      if (response.data.status === false) {
        throw new Error(response.data.message || "Failed to delete message");
      }
      return response.data;
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Failed to delete message";
      throw new Error(message);
    }
  },
  getPendingInfo: async (pagination: string): Promise<any> => {
    try {
      const response = await api.get(
        "/admin/manage-records?status=pending" + pagination
      );

      if (typeof response.data.status !== "boolean") {
        throw new Error("Invalid response format from server");
      }
      if (response.data.status === false) {
        throw new Error(response.data.message || "Failed to get pending info");
      }
      return response.data;
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Failed to get pending info";
      throw new Error(message);
    }
  },
  promoteUser: async (userDetails: any): Promise<any> => {
    try {
      const response = await api.post("/admin/promote", userDetails);

      if (typeof response.data.status !== "boolean") {
        throw new Error("Invalid response format from server");
      }
      if (response.data.status === false) {
        throw new Error(response.data.message || "Failed to promote USer");
      }
      return response.data;
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Failed to promote User";
      throw new Error(message);
    }
  },
  updateUserStatus: async (userDetails: any): Promise<any> => {
    try {
      const response = await api.patch("/admin/status", userDetails);

      if (typeof response.data.status !== "boolean") {
        throw new Error("Invalid response format from server");
      }
      if (response.data.status === false) {
        throw new Error(
          response.data.message || "Failed to update User status"
        );
      }
      return response.data;
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Failed to update User status";
      throw new Error(message);
    }
  },
  getStats: async (params: string): Promise<any> => {
    try {
      const response = await api.get("/admin/reports" + params);

      if (typeof response.data.status !== "boolean") {
        throw new Error("Invalid response format from server");
      }
      if (response.data.status === false) {
        throw new Error(response.data.message || "Failed to get pending info");
      }
      return response.data;
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Failed to get pending info";
      throw new Error(message);
    }
  },
  acceptPendingItems: async (id: string): Promise<any> => {
    try {
      const response = await api.patch(`/admin/${id}/accept`);

      if (typeof response.data.status !== "boolean") {
        throw new Error("Invalid response format from server");
      }
      if (response.data.status === false) {
        throw new Error(response.data.message || "Failed to accept item");
      }
      return response.data;
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Failed to accept item";
      throw new Error(message);
    }
  },
  declinePendingItems: async (id: string): Promise<any> => {
    try {
      const response = await api.patch(`/admin/${id}/reject`);

      if (typeof response.data.status !== "boolean") {
        throw new Error("Invalid response format from server");
      }
      if (response.data.status === false) {
        throw new Error(response.data.message || "Failed to reject item");
      }
      return response.data;
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Failed to reject item";
      throw new Error(message);
    }
  },

  deleteEvent: async (id: string): Promise<any> => {
    try {
      const response = await api.delete(`/events/${id}`);

      if (typeof response.data.status !== "boolean") {
        throw new Error("Invalid response format from server");
      }
      if (response.data.status === false) {
        throw new Error(response.data.message || "Failed to delete event");
      }
      return response.data;
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Failed to delete event";
      throw new Error(message);
    }
  },
  editEvent: async (info: any, id: string): Promise<any> => {
    try {
      const response = await api.patch(`/events/${id}`, info, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });

      if (typeof response.data.status !== "boolean") {
        throw new Error("Invalid response format from server");
      }
      if (response.data.status === false) {
        throw new Error(response.data.message || "Failed to edit event");
      }
      return response.data;
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Failed to edit event";
      throw new Error(message);
    }
  },
  getRosterStats: async (): Promise<any> => {
    try {
      const response = await api.get(`/admin/status/count`);

      if (typeof response.data.status !== "boolean") {
        throw new Error("Invalid response format from server");
      }
      if (response.data.status === false) {
        throw new Error(response.data.message || "Failed to get info");
      }
      return response.data;
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Failed to get info";
      throw new Error(message);
    }
  },

  getPendingStats: async (): Promise<any> => {
    try {
      const response = await api.get(`/admin/records/stats`);

      if (typeof response.data.status !== "boolean") {
        throw new Error("Invalid response format from server");
      }
      if (response.data.status === false) {
        throw new Error(response.data.message || "Failed to get info");
      }
      return response.data;
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Failed to get info";
      throw new Error(message);
    }
  },
};

export const apiUtils = {
  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    const token = localStorage.getItem("authToken");
    return !!token;
  },

  // Get current auth token
  getAuthToken: (): string | null => {
    return localStorage.getItem("authToken");
  },

  // Clear all auth data
  clearAuthData: (): void => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("refreshToken");
  },

  // Set auth tokens
  setAuthTokens: (authToken: string, refreshToken?: string): void => {
    localStorage.setItem("authToken", authToken);
    if (refreshToken) {
      localStorage.setItem("refreshToken", refreshToken);
    }
  },

  // Get API base URL
  getBaseURL: (): string => {
    return config.baseURL;
  },

  // Health check endpoint
  healthCheck: async (): Promise<boolean> => {
    try {
      await api.get("/health");
      return true;
    } catch (error) {
      console.error("Health check failed:", error);
      return false;
    }
  },
};

export const healthCheck = apiUtils.healthCheck;
