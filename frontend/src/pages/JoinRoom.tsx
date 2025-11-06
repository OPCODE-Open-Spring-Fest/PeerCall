
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button.js";
import axios from "axios";

export default function JoinRoom() {
  const [roomName, setRoomName] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const API_BASE = "http://localhost:3000/api/rooms";// include /rooms here

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomName.trim()) return alert("Please enter a room name!");

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

      // const roomName = res.data._id
      alert("Joined room successfully!");
      navigate(`/room/${roomName}`);
    } catch (err: any) {
      console.error("Join room error:", err);
      alert(err.response?.data?.message || err.message || "Failed to join room.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-green-100 px-4 py-8">
      <div className="max-w-md w-full bg-white/80 backdrop-blur-md shadow-xl rounded-2xl border border-green-100 p-8">
        <h2 className="text-3xl font-bold text-green-600 text-center mb-6">
          Join a Room
        </h2>
        <form onSubmit={handleJoin} className="space-y-4">
          <input
            type="text"
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
            placeholder="Enter room name"
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
          />
          <Button
            type="submit"
            disabled={loading}
            className="w-full justify-center bg-green-600 text-white font-medium py-3 rounded-lg shadow-md hover:bg-green-700 hover:shadow-lg transition-all"
          >
            {loading ? "Joining..." : "Join Room"}
          </Button>
        </form>
      </div>
    </div>
  );
}
