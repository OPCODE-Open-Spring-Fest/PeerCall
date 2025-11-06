// src/pages/CreateRoom.tsx
import { React, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button.js";
import axios from "axios";

export default function CreateRoom() {
  const [roomName, setRoomName] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const API_BASE = "http://localhost:3000/api/rooms";

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomName.trim()) return alert("Please enter a room name!");

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `${API_BASE}/createRoom`,
        { name: roomName },
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      );

      alert("Room created successfully!");
      navigate(`/lobby/${res.data._id}`);

    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to create room.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-100 px-4 py-8">
      <div className="max-w-md w-full bg-white/80 backdrop-blur-md shadow-xl rounded-2xl border border-blue-100 p-8">
        <h2 className="text-3xl font-bold text-blue-600 text-center mb-6">
          Create a Room
        </h2>
        <form onSubmit={handleCreate} className="space-y-4">
          <input
            type="text"
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
            placeholder="Enter room name"
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <Button
            type="submit"
            disabled={loading}
            className="w-full justify-center bg-blue-600 text-white font-medium py-3 rounded-lg shadow-md hover:bg-blue-700 hover:shadow-lg transition-all"
          >
            {loading ? "Creating..." : "Create Room"}
          </Button>
        </form>
      </div>
    </div>
  );
}