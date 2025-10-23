import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const OAuthSuccess: React.FC = () => {
  const navigate = useNavigate();
  const [message, setMessage] = useState("Finalizing sign in...");

  useEffect(() => {
    const hash = window.location.hash || "";
    const fragment = hash.startsWith("#") ? hash.slice(1) : hash;
    const params = new URLSearchParams(fragment);
    const token = params.get("token");

    if (token) {
      try {
        localStorage.setItem("token", token);
        setMessage("Sign in successful — redirecting...");
        setTimeout(() => {
          navigate("/", { replace: true });
        }, 700);
      } catch (err) {
        console.error("Failed to save token", err);
        setMessage("Sign in succeeded but we couldn't save the session locally.");
        setTimeout(() => navigate("/signin"), 1500);
      }
    } else {
      setMessage("No token found in redirect. Please try signing in again.");
      setTimeout(() => navigate("/signin"), 1300);
    }
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