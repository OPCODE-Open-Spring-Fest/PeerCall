import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { io, Socket } from "socket.io-client";
import { Mic, MicOff, Video, VideoOff, PhoneOff, Users, MessageSquare,} from "lucide-react";
import { motion } from "framer-motion";
import { HotKeys } from "react-hotkeys";
import { useConnectionQuality } from "../hooks/useConnectionQuality";
import ConnectionQualityIndicator from "../components/ConnectionQualityIndicator";
import { API_ENDPOINTS } from "../lib/apiConfig";

const keyMap = {
  TOGGLE_MIC: "ctrl+m",
  TOGGLE_VIDEO: "ctrl+v",
  TOGGLE_CHAT: "ctrl+c",
};
interface ChatMessage {
  user: string;
  text: string;
  time?: string;
}
const InRoom: React.FC = () => {
  const { roomName } = useParams<{ roomName: string }>();
  const navigate = useNavigate();
  
  const [micOn, setMicOn] = useState(true);
  const [videoOn, setVideoOn] = useState(true);
  const [showChat, setShowChat] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [userName, setUserName] = useState("User");
  const [participantCount, setParticipantCount] = useState(1);

  const socketRef = useRef<Socket | null>(null);
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);

  const connectionQualityStats = useConnectionQuality({
    localStream: mediaStreamRef.current,
    peerConnection: peerConnectionRef.current,
  });

  // Get user name from localStorage or token
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      // Try to get user info from token or make API call
      // For now, use a default or extract from token
      const storedName = localStorage.getItem("userName");
      if (storedName) {
        setUserName(storedName);
      }
    }
  }, []);

  // Initialize Socket.io connection
  useEffect(() => {
    if (!roomName) return;

    document.title = `${roomName} | PeerCall`;

    const socket = io(API_ENDPOINTS.SOCKET);
    socketRef.current = socket;

    socket.emit("join-room", roomName, userName);
    console.log("🟢 Joined room:", roomName, "as", userName);

    socket.on("chat-history", (history: any[]) => {
      setMessages(
        history.map((m) => ({
          user: m.user,
          text: m.text,
          time: m.timestamp || m.time,
        }))
      );
    });

    socket.on("chat-message", (msg: any) => {
      setMessages((prev) => [
        ...prev,
        {
          user: msg.user,
          text: msg.text,
          time: msg.time || msg.timestamp || new Date().toISOString(),
        },
      ]);
    });

    socket.on("user-joined", ({ userName: joinedUser, roomId }: { userName: string; roomId?: string }) => {
      setMessages((prev) => [
        ...prev,
        { user: "System", text: `${joinedUser} joined the room` },
      ]);
      setParticipantCount((prev) => prev + 1);
    });

    socket.on("user-left", ({ userName: leftUser }: { userName: string }) => {
      setMessages((prev) => [
        ...prev,
        { user: "System", text: `${leftUser} left the room` },
      ]);
      setParticipantCount((prev) => Math.max(1, prev - 1));
    });

    socket.on("update-members", (members: any[]) => {
      setParticipantCount(members.length || 1);
    });

    return () => {
      socket.emit("leave-room", {
        roomId: roomName,
        userId: localStorage.getItem("token") || "",
        userName,
      });
      socket.disconnect();
    };
  }, [roomName, userName]);

  // Initialize media stream
  useEffect(() => {
    const initMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        mediaStreamRef.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
        setMicOn(stream.getAudioTracks().some((t) => t.enabled));
        setVideoOn(stream.getVideoTracks().some((t) => t.enabled));
      } catch (err) {
        console.error("Error accessing camera/mic:", err);
        alert("Please allow camera and microphone permissions.");
        setMicOn(false);
        setVideoOn(false);
      }
    };

    initMedia();

    return () => {
      mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (showChat) {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, showChat]);

  // HotKeys handlers
  const handlers = {
    TOGGLE_MIC: (e: KeyboardEvent) => {
      e.preventDefault();
      toggleMic();
    },
    TOGGLE_VIDEO: (e: KeyboardEvent) => {
      e.preventDefault();
      toggleVideo();
    },
    TOGGLE_CHAT: (e: KeyboardEvent) => {
      e.preventDefault();
      setShowChat((prev) => !prev);
    },
  };

  const toggleMic = () => {
    const stream = mediaStreamRef.current;
    if (!stream) return;
    const audioTracks = stream.getAudioTracks();
    if (audioTracks.length === 0) return;
    const enabled = !audioTracks[0].enabled;
    audioTracks.forEach((t) => (t.enabled = enabled));
    setMicOn(enabled);
  };

  const toggleVideo = () => {
    const stream = mediaStreamRef.current;
    if (!stream) return;
    const videoTracks = stream.getVideoTracks();
    if (videoTracks.length === 0) return;
    const enabled = !videoTracks[0].enabled;
    videoTracks.forEach((t) => (t.enabled = enabled));
    setVideoOn(enabled);
  };

  const handleEndCall = () => {
    mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
    socketRef.current?.disconnect();
    navigate("/");
  };

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !socketRef.current || !roomName) return;

    const message = {
      roomId: roomName,
      user: userName,
      text: chatInput.trim(),
    };

    socketRef.current.emit("chat-message", message);
    setChatInput("");
  };

  if (!roomName) {
    return (
      <div className="h-screen flex items-center justify-center">
        <p className="text-white">Invalid room</p>
      </div>
    );
  }

  return (
    <HotKeys keyMap={keyMap} handlers={handlers}>
      <div className="h-screen w-full bg-gray-950 dark:bg-gray-900 text-white flex flex-col">
        {/* Header */}
        <header className="p-4 border-b border-gray-800/50 dark:border-gray-700/50 bg-gray-950/50 dark:bg-gray-900/50 backdrop-blur-sm flex justify-between items-center">
          <h1 className="text-xl font-semibold bg-gradient-to-r from-white to-gray-300 dark:from-gray-100 dark:to-gray-400 bg-clip-text text-transparent">
            Room: {roomName}
          </h1>
          <div className="flex items-center gap-4">
            <ConnectionQualityIndicator
              quality={connectionQualityStats.quality}
              stats={connectionQualityStats}
              showLabel={true}
            />
            <div className="flex items-center gap-2 text-gray-400 dark:text-gray-500 bg-gray-900/50 dark:bg-gray-800/50 px-3 py-1.5 rounded-lg border border-gray-800/50 dark:border-gray-700/50">
              <Users className="w-4 h-4" />
              <span className="text-sm font-medium">{participantCount} Participant{participantCount !== 1 ? "s" : ""}</span>
            </div>
          </div>
        </header>

        {/* Main Video Area */}
        <div className="flex-1 flex flex-col md:flex-row">
          {/* Video Grid */}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
            {/* Local Video */}
            <div className="bg-black rounded-2xl relative overflow-hidden group">
              <video
                ref={localVideoRef}
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover rounded-2xl"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
              <span className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg text-sm font-medium border border-white/10 shadow-lg">
                You ({userName})
              </span>
              <div className="absolute top-3 right-3">
                <ConnectionQualityIndicator
                  quality={connectionQualityStats.quality}
                  stats={connectionQualityStats}
                  showLabel={false}
                  compact={true}
                />
              </div>
            </div>

            {/* Remote Video */}
            <div className="bg-black rounded-2xl relative overflow-hidden group">
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover rounded-2xl"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
              <span className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg text-sm font-medium border border-white/10 shadow-lg">
                Peer
              </span>
              <div className="absolute top-3 right-3">
                <ConnectionQualityIndicator
                  quality={connectionQualityStats.quality}
                  stats={connectionQualityStats}
                  showLabel={false}
                  compact={true}
                />
              </div>
            </div>
          </div>

          {/* Chat Panel */}
          {showChat && (
            <motion.div
              initial={{ x: 200, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 200, opacity: 0 }}
              className="w-full md:w-80 bg-gray-900 dark:bg-gray-800 border-l border-gray-800 dark:border-gray-700 flex flex-col"
            >
              <div className="p-3 border-b border-gray-800 dark:border-gray-700 font-medium">
                In-call Chat
              </div>
              <div className="flex-1 overflow-y-auto p-3 text-gray-300 dark:text-gray-400">
                {messages.length === 0 ? (
                  <p className="text-sm text-gray-500">No messages yet...</p>
                ) : (
                  <div className="space-y-2">
                    {messages.map((msg, idx) => (
                      <div key={idx} className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-xs font-semibold ${
                              msg.user === "System"
                                ? "text-yellow-400"
                                : msg.user === userName
                                ? "text-green-400"
                                : "text-indigo-400"
                            }`}
                          >
                            {msg.user}
                          </span>
                          <span className="text-xs text-gray-400">
                            {msg.time ? new Date(msg.time).toLocaleTimeString() : ""}
                          </span>
                        </div>
                        <div className="mt-1">
                          <span className="bg-green-100 dark:bg-green-900/30 text-gray-900 dark:text-gray-100 rounded px-2 py-1 text-sm inline-block max-w-[85%]">
                            {msg.text}
                          </span>
                        </div>
                      </div>
                    ))}
                    <div ref={chatEndRef} />
                  </div>
                )}
              </div>
              <form onSubmit={sendMessage} className="p-3 border-t border-gray-800 dark:border-gray-700 flex">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 bg-gray-800 dark:bg-gray-700 rounded-l-md px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="submit"
                  className="bg-indigo-600 dark:bg-indigo-500 px-4 rounded-r-md text-sm hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors"
                >
                  Send
                </button>
              </form>
            </motion.div>
          )}
        </div>

        {/* Controls */}
        <footer className="p-4 flex justify-center gap-6 border-t border-gray-800 dark:border-gray-700 bg-gray-950 dark:bg-gray-900">
          <button
            onClick={toggleMic}
            className={`p-3 rounded-full ${
              micOn ? "bg-gray-800 dark:bg-gray-700" : "bg-red-600 dark:bg-red-500"
            } hover:opacity-80 transition-opacity`}
            title="Toggle Microphone (Ctrl+M)"
          >
            {micOn ? <Mic /> : <MicOff />}
          </button>

          <button
            onClick={toggleVideo}
            className={`p-3 rounded-full ${
              videoOn ? "bg-gray-800 dark:bg-gray-700" : "bg-red-600 dark:bg-red-500"
            } hover:opacity-80 transition-opacity`}
            title="Toggle Video (Ctrl+V)"
          >
            {videoOn ? <Video /> : <VideoOff />}
          </button>

          <button
            onClick={handleEndCall}
            className="p-3 rounded-full bg-red-600 dark:bg-red-500 hover:bg-red-700 dark:hover:bg-red-600 transition-colors"
            title="End Call"
          >
            <PhoneOff />
          </button>

          <button
            onClick={() => setShowChat(!showChat)}
            className={`p-3 rounded-full ${
              showChat ? "bg-indigo-600 dark:bg-indigo-500" : "bg-gray-800 dark:bg-gray-700"
            } hover:opacity-80 transition-opacity`}
            title="Toggle Chat (Ctrl+C)"
          >
            <MessageSquare />
          </button>
        </footer>
      </div>
    </HotKeys>
  );
};

export default InRoom;
