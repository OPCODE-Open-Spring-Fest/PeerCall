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
        });
        setUser(res.data.user);
      } catch (err) {
        // invalid token or user not found
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

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="container mx-auto px-6 py-10">
      <div className="max-w-md mx-auto bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4 ">Room Actions</h2>
        <p className="text-sm text-gray-600 mb-6">Hello {user?.name ?? "user"}, choose an action:</p>

        <div className="space-y-3">
          <Button
            className="w-full justify-center bg-green-600 hover:bg-green-700 text-white"
            onClick={handleJoin}
          >
            <LogIn className="mr-2 h-4 w-4" /> Join Room
          </Button>

          <Button
            className="w-full justify-center bg-blue-600 hover:bg-blue-700 text-white"
            onClick={handleCreate}
          >
            <PlusSquare className="mr-2 h-4 w-4" /> Create Room
          </Button>

          <Button
            className="w-full justify-center bg-red-600 hover:bg-red-700 text-white"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-4 w-4" /> Logout
          </Button>
        </div>
      </div>
    </div>
  );
}
