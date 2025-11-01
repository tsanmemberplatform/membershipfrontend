import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { crossTabLogout } from "../store/slices/authSlice";

/**
 * Hook to handle cross-tab authentication state synchronization
 * This ensures that when a user logs in on one tab, other tabs are logged out
 */
export const useCrossTabAuth = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleCrossTabLogout = (event: CustomEvent) => {
      const { reason, newToken } = event.detail;

      // Don't redirect if already on login page
      if (location.pathname === "/login") {
        return;
      }

      dispatch(crossTabLogout({ reason, newToken }));

      // Redirect to login page with appropriate message
      navigate("/login", {
        state: {
          message:
            reason === "token_changed"
              ? "You have been logged out because another user logged in on this browser."
              : "Your session has expired.",
          type: "warning",
        },
        replace: true, // Use replace to prevent going back to protected route
      });
    };

    // Listen for cross-tab logout events
    window.addEventListener(
      "auth:cross-tab-logout",
      handleCrossTabLogout as EventListener
    );

    return () => {
      window.removeEventListener(
        "auth:cross-tab-logout",
        handleCrossTabLogout as EventListener
      );
    };
  }, [dispatch, navigate, location.pathname]);
};
