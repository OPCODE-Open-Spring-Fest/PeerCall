import { useParams, useLocation } from "react-router-dom";
import InRoom from "./InRoom.js";
import React, { useEffect, useState } from "react";
import axios from "axios";

const InRoomWrapper: React.FC = () => {
  const { roomName } = useParams();
  const location = useLocation();

  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:3000/api/auth/me", {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
          withCredentials: true,
        });
        const name = res.data?.user?.name;
        if (mounted && name) {
          setUserName(name);
          return;
        }
      } catch (err) {
        // ignore and fallback below
      }

      const navName = (location.state as { userName?: string })?.userName;
      const stored = localStorage.getItem("userName");
      if (mounted) setUserName(navName || stored || "Anonymous");
    };

    fetchUser();

    return () => {
      mounted = false;
    };
  }, [location]);

  if (userName === null) {
    return <div className="h-screen w-full flex items-center justify-center">Loading...</div>;
  }

  return <InRoom roomId={roomName || "unknown"} userName={userName} />;
};

export default InRoomWrapper;