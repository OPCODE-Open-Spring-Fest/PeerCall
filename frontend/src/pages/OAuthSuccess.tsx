import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = (import.meta.env.VITE_API_URL as string) || "http://localhost:3000";

const OAuthSuccess: React.FC = () => {
  const navigate = useNavigate();
  const [message, setMessage] = useState("Finalizing sign in...");

  const extractTokenFromUrl = (): string | null => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const qToken = urlParams.get("token") || urlParams.get("accessToken") || urlParams.get("authToken");
      if (qToken) return qToken;

      const hash = window.location.hash || "";
      const fragment = hash.startsWith("#") ? hash.slice(1) : hash;
      const fragParams = new URLSearchParams(fragment);
      const hToken = fragParams.get("token") || fragParams.get("accessToken") || fragParams.get("authToken");
      if (hToken) return hToken;
    } catch (err) {
      // ignore 
    }
    return null;
  };

  useEffect(() => {
    (async () => {
      //If backend included token in URL prefer that.
      const tokenFromUrl = extractTokenFromUrl();
      if (tokenFromUrl) {
        try {
          localStorage.setItem("token", tokenFromUrl);
          setMessage("Sign in successful — redirecting...");
          setTimeout(() => navigate("/", { replace: true }), 700);
          return;
        } catch (err) {
          console.warn("Unable to persist token from URL:", err);
          setMessage("Signed in but could not persist session locally. Redirecting...");
          setTimeout(() => navigate("/", { replace: true }), 1200);
          return;
        }
      }

      //Otherwise call refresh endpoint
      try {
        const res = await fetch(`${API_URL}/api/auth/refresh`, {
          method: "GET",
          credentials: "include", 
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        });

        if (!res.ok) {
          const body = await res.json().catch(() => null);
          const errMsg = body?.message || `Failed to refresh token (status ${res.status})`;
          setMessage(errMsg);
          // redirect to signin
          setTimeout(() => navigate("/signin"), 1400);
          return;
        }

        const data = await res.json().catch(() => null);
        const token = data?.accessToken || data?.token || null;

        if (!token) {
          setMessage("No access token returned from server. Please try signing in again.");
          setTimeout(() => navigate("/signin"), 1300);
          return;
        }

        try {
          localStorage.setItem("token", token);
        } catch (err) {
          console.warn("Failed to persist access token:", err);
        }

        setMessage("Sign in successful — redirecting...");
        setTimeout(() => navigate("/", { replace: true }), 700);
      } catch (err) {
        console.error("Network error while refreshing token:", err);
        setMessage("Network error finalizing sign-in. Please try again.");
        setTimeout(() => navigate("/signin"), 1400);
      }
    })();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="text-lg font-medium">{message}</p>
      </div>
    </div>
  );
};

export default OAuthSuccess;