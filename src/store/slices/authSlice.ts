import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

export interface AuthState {
  user: any | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: localStorage.getItem("authToken") || null,
  isAuthenticated: !!localStorage.getItem("authToken"),
  loading: false,
  error: null,
};

// Cross-tab logout functionality
let currentToken: string | null = localStorage.getItem("authToken");

// Listen for storage changes (when another tab logs in/out)
if (typeof window !== "undefined") {
  window.addEventListener("storage", (e) => {
    if (e.key === "authToken") {
      const newToken = e.newValue;

      // If token changed and it's different from current user's token
      if (newToken !== currentToken) {
        // Dispatch logout action to current tab
        window.dispatchEvent(
          new CustomEvent("auth:cross-tab-logout", {
            detail: { reason: "token_changed", newToken },
          })
        );
      }
    }
  });
}

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // Special reducer for rehydration
    rehydrate: (state, action: PayloadAction<AuthState>) => {
      return { ...state, ...action.payload };
    },
    loginStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    loginSuccess: (
      state,
      action: PayloadAction<{ userInfo: any; token: string }>
    ) => {
      state.loading = false;
      state.isAuthenticated = true;
      state.user = action.payload.userInfo;
      state.token = action.payload.token;
      state.error = null;

      // Update current token reference for cross-tab detection
      if (typeof window !== "undefined") {
        currentToken = action.payload.token;
      }

      localStorage.setItem("authToken", action.payload.token);
    },
    loginFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      localStorage.removeItem("authToken");
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      state.error = null;

      // Update current token reference
      if (typeof window !== "undefined") {
        currentToken = null;
      }

      localStorage.removeItem("authToken");
    },
    // New reducer for cross-tab logout
    crossTabLogout: (
      state,
      action: PayloadAction<{ reason: string; newToken?: string | null }>
    ) => {
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      state.error = `Logged out: ${
        action.payload.reason === "token_changed"
          ? "Another user logged in"
          : "Session expired"
      }`;

      // Update current token reference
      if (typeof window !== "undefined") {
        currentToken = action.payload.newToken || null;
      }
    },
    updateUser: (state, action: PayloadAction<any>) => {
      state.user = { ...state.user, ...action.payload };
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  loginStart,
  loginSuccess,
  loginFailure,
  logout,
  crossTabLogout,
  updateUser,
  clearError,
} = authSlice.actions;

export default authSlice.reducer;
