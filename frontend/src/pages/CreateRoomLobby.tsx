import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Button } from "../components/ui/button.js";

export default function CreateRoomLobby() {
    const { roomId } = useParams<{ roomId: string }>();
    const [roomName, setRoomName] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(true);
    const [copied, setCopied] = useState<boolean>(false);
    const navigate = useNavigate();

    const API_BASE = "http://localhost:3000/api/rooms";

    // Fetch room details by ID
    useEffect(() => {
        const fetchRoom = async () => {
            try {
                const token = localStorage.getItem("token");
                const res = await axios.get(`${API_BASE}/listRooms`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const found = res.data.find((r: any) => r._id === roomId);
                if (found) setRoomName(found.name);
            } catch (err) {
                console.error("Failed to fetch room details:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchRoom();
    }, [roomId]);

    // Copy join link to clipboard
    const handleCopyLink = () => {
        const link = `${window.location.origin}/room/${roomId}`;
        navigator.clipboard.writeText(link);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-600 dark:text-gray-400 transition-colors">
                Loading room details...
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 dark:from-gray-900 via-white dark:via-gray-950 to-blue-100 dark:to-gray-900 px-4 py-8 transition-colors">
            <div className="max-w-md w-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-xl rounded-2xl border border-blue-100 dark:border-gray-800 p-8 text-center transition-colors">
                <h1 className="text-2xl font-semibold mb-2 text-blue-700 dark:text-blue-500">
                    Room Created 🎉
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mb-6">
                    {roomName ? `Room: ${roomName}` : "Unnamed Room"}
                </p>

                <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3 text-gray-700 dark:text-gray-300 mb-4 break-words">
                    <p className="text-sm">Room ID: {roomId}</p>
                </div>

                <Button
                    onClick={handleCopyLink}
                    className="w-full justify-center bg-blue-600 dark:bg-blue-500 text-white font-medium py-3 rounded-lg shadow-md hover:bg-blue-700 dark:hover:bg-blue-600 hover:shadow-lg transition-all"
                >
                    {copied ? "✅ Copied!" : "Copy Join Link"}
                </Button>

                <p className="text-gray-400 dark:text-gray-500 mt-6 text-sm">
                    Share this link with others so they can join your room.
                </p>

                <Button
                    onClick={() => navigate(`/room/${roomId}`)}
                    className="mt-6 w-full bg-green-600 dark:bg-green-500 hover:bg-green-700 dark:hover:bg-green-600 text-white font-medium py-3 rounded-lg shadow-md transition-all"
                >
                    Go to Room
                </Button>
            </div>
        </div>
    );
}
