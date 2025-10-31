import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button.js";
import { PlusSquare, LogIn, LogOut } from "lucide-react";
import axios from "axios";

export default function RoomActions() {
  const [user, setUser] = useState<{ _id: string; name: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/signin");
      return;
    }

    const fetchUser = async () => {
      try {
        const res = await axios.get("http://localhost:3000/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        });
        setUser(res.data.user);
      } catch (err) {
        console.error("Failed to fetch user:", err);
        localStorage.removeItem("token");
        navigate("/signin");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [navigate]);

  const handleCreate = () => navigate("/create-room");
  const handleJoin = () => navigate("/join-room");
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-green-100">
        <p className="text-gray-600 text-lg animate-pulse">Loading...</p>
      </div>
    );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-green-100 px-4 py-8">
      <div className="max-w-md w-full bg-white/80 backdrop-blur-md shadow-xl rounded-2xl border border-green-100 p-8 transition-transform hover:scale-[1.01] duration-300">
        <h2 className="text-3xl font-bold text-green-600 text-center mb-4">
          Room Actions
        </h2>
        <p className="text-gray-600 text-center mb-8">
          👋 Hello{" "}
          <span className="font-semibold">{user?.name ?? "Guest"}</span>, what
          would you like to do today?
        </p>

        <div className="space-y-4">
          {/* Join Room */}
          <Button
            onClick={handleJoin}
            className="w-full justify-center bg-green-600 text-white font-medium py-3 rounded-lg shadow-md hover:bg-green-700 hover:shadow-lg transition-all"
          >
            <LogIn className="mr-2 h-5 w-5" /> Join a Room
          </Button>

          {/* Create Room */}
          <Button
            onClick={handleCreate}
            className="w-full justify-center bg-blue-600 text-white font-medium py-3 rounded-lg shadow-md hover:bg-blue-700 hover:shadow-lg transition-all"
          >
            <PlusSquare className="mr-2 h-5 w-5" /> Create a Room
          </Button>

          {/* Logout */}
          <Button
            onClick={handleLogout}
            className="w-full justify-center bg-red-600 text-white font-medium py-3 rounded-lg shadow-md hover:bg-red-700 hover:shadow-lg transition-all"
          >
            <LogOut className="mr-2 h-5 w-5" /> Logout
          </Button>
        </div>
      </div>
    </div>
  );
}
