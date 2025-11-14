import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button.js";
import axios from "axios";
import PreJoinPreview from "../components/PreJoinPreview.js";
import { toast } from "sonner"

export default function JoinRoom() {
  const [roomName, setRoomName] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const navigate = useNavigate();
  const API_BASE = "http://localhost:3000/api/rooms";

  // 🔹 Step 1: Handle room join initiation
  const handleJoinClick = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomName.trim()) {
      toast.error("Please enter a room name!");
      return;
    }

    // Instead of joining immediately, show preview first
    setShowPreview(true);
  };

  // 🔹 Step 2: After preview confirmation, actually join the backend room
  const handleConfirmJoin = async (mediaStream: MediaStream) => {
    setStream(mediaStream);
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No auth token found");

      const res = await axios.post(
        `${API_BASE}/${roomName}/join`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast.success("Joined room successfully!");
      // Optional: Stop preview stream before entering actual call
      mediaStream.getTracks().forEach(track => track.stop());
      navigate(`/room/${roomName}`);
    } catch (err: any) {
      console.error("Join room error:", err);
      toast.error(err.response?.data?.message || err.message || "Failed to join room.");
      setShowPreview(false);
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Step 3: Conditional render — preview or join form
  if (showPreview) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 dark:bg-gray-950">
        <PreJoinPreview onJoin={handleConfirmJoin} />
      </div>
    );
  }

  // 🔹 Step 4: Default room input form
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 dark:from-gray-900 via-white dark:via-gray-950 to-green-100 dark:to-gray-900 px-4 py-8">
      <div className="max-w-md w-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-xl rounded-2xl border border-green-100 dark:border-gray-800 p-8">
        <h2 className="text-3xl font-bold text-green-600 dark:text-green-500 text-center mb-6">
          Join a Room
        </h2>
        <form onSubmit={handleJoinClick} className="space-y-4">
          <input
            type="text"
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
            placeholder="Enter room name"
            className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-400 dark:focus:ring-green-500"
          />
          <Button
            type="submit"
            disabled={loading}
            className="w-full justify-center bg-green-600 dark:bg-green-500 text-white font-medium py-3 rounded-lg shadow-md hover:bg-green-700 dark:hover:bg-green-600 hover:shadow-lg transition-all"
          >
            {loading ? "Joining..." : "Join Room"}
          </Button>
        </form>
      </div>
    </div>
  );
}

