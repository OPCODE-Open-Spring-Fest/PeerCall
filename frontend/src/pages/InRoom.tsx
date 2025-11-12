import React, { useState, useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { Mic, MicOff, Video, VideoOff, PhoneOff, Users, MessageSquare } from "lucide-react";
import { motion } from "framer-motion";
import { HotKeys } from "react-hotkeys";

const keyMap = {
  TOGGLE_MIC: "ctrl+m",
  TOGGLE_VIDEO: "ctrl+v",
  TOGGLE_CHAT: "ctrl+c",
};

const SOCKET_URL = "http://localhost:3000";

const InRoom: React.FC<{ roomId: string; userName: string }> = ({ roomId, userName }) => {
  const [micOn, setMicOn] = useState(true);
  const [videoOn, setVideoOn] = useState(true);
  const [showChat, setShowChat] = useState(false);
  const [messages, setMessages] = useState<{ user: string; text: string; time?: string }[]>([]);
  const [chatInput, setChatInput] = useState("");

  const socketRef = useRef<Socket | null>(null);
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    document.title = `${roomId} | PeerCall`;

    const socket = io(SOCKET_URL);
    socketRef.current = socket;

    socket.emit("join-room", { roomId, userName });
    console.log("🟢 Joined room:", roomId, "as", userName);

    socket.on("chat-history", (history: any[]) => {
      setMessages(
        history.map((m) => ({
          roomId: m.roomId,
          user: m.user,
          text: m.text,
          time: m.timestamp,
        }))
      );
    });

    socket.on("chat-message", (msg: any) => {
      setMessages((prev) => [
        ...prev,
        { roomIduser: msg.user, text: msg.text, time: msg.timestamp || new Date().toISOString() },
      ]);
    });

    socket.on("user-joined", ({ userName ,roomId}) => {
      setMessages((prev) => [
        ...prev,
        { user: "System", text: `${userName} joined the room ${roomId}` },
      ]);
    });

    socket.on("user-left", ({ userName }) => {
      setMessages((prev) => [
        ...prev,
        { user: "System", text: `${userName} left the room` },
      ]);
    });

    return () => {
      socket.emit("leave-room", { roomId, userName });
      socket.disconnect();
    };
  }, [roomId, userName]);

  useEffect(() => {
    const initMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
        mediaStreamRef.current = stream;
        if (localVideoRef.current) localVideoRef.current.srcObject = stream;

        setMicOn(stream.getAudioTracks().some((t) => t.enabled));
        setVideoOn(stream.getVideoTracks().some((t) => t.enabled));
      } catch (err) {
        console.error("Failed to get user media:", err);
        setMicOn(false);
        setVideoOn(false);
      }
    };
    initMedia();

    return () => {
      mediaStreamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !socketRef.current) return;

    const message = {
      roomId,
      user: userName,
      text: chatInput.trim(),
      timestamp: new Date().toISOString(),
    };

    socketRef.current.emit("chat-message", message);
    setMessages((s) => [...s, message]);
    setChatInput("");
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, showChat]);

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

  return (
    <HotKeys keyMap={keyMap} handlers={handlers}>
      <div className="h-screen w-full bg-gray-950 text-white flex flex-col">
        {/* Header */}
        <header className="p-4 border-b border-gray-800 flex justify-between items-center">
          <h1 className="text-xl font-semibold">Room: {roomId}</h1>
          <div className="flex items-center gap-3 text-gray-400">
            <Users className="w-5 h-5" />
            <span>{userName}</span>
          </div>
        </header>

        {/* Main Section */}
        <div className="flex-1 flex flex-col md:flex-row">
          {/* Video Area */}
          <div className="flex-1 flex justify-center items-center p-4">
            <div className="bg-black rounded-2xl relative w-full max-w-3xl aspect-video overflow-hidden">
              <video
                ref={localVideoRef}
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover rounded-2xl"
              />
              <span className="absolute bottom-2 left-2 bg-gray-800 px-2 py-1 rounded text-sm">
                You ({userName})
              </span>
            </div>
          </div>

          {/* Chat Panel */}
          {showChat && (
            <motion.div
              initial={{ x: 200, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 200, opacity: 0 }}
              className="w-full md:w-80 bg-gray-900 border-l border-gray-800 flex flex-col"
            >
              <div className="p-3 border-b border-gray-800 font-medium">In-call Chat</div>
              <div className="flex-1 overflow-y-auto p-3 text-gray-300">
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
                          <span className="bg-green-100 text-gray-900 rounded px-2 py-1 text-sm inline-block max-w-[85%]">
                            {msg.text}
                          </span>
                        </div>
                      </div>
                    ))}
                    <div ref={chatEndRef} />
                  </div>
                )}
              </div>

              <form onSubmit={sendMessage} className="p-3 border-t border-gray-800 flex">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 bg-gray-800 rounded-l-md px-3 py-2 text-sm focus:outline-none"
                />
                <button type="submit" className="bg-indigo-600 px-4 rounded-r-md text-sm">
                  Send
                </button>
              </form>
            </motion.div>
          )}
        </div>

        {/* Footer Controls */}
        <footer className="p-4 flex justify-center gap-6 border-t border-gray-800 bg-gray-950">
          <button onClick={toggleMic} className={`p-3 rounded-full ${micOn ? "bg-gray-800" : "bg-red-600"}`}>
            {micOn ? <Mic /> : <MicOff />}
          </button>

          <button onClick={toggleVideo} className={`p-3 rounded-full ${videoOn ? "bg-gray-800" : "bg-red-600"}`}>
            {videoOn ? <Video /> : <VideoOff />}
          </button>

          <button className="p-3 rounded-full bg-red-600 hover:bg-red-700">
            <PhoneOff />
          </button>

          <button
            onClick={() => setShowChat((prev) => !prev)}
            className={`p-3 rounded-full ${showChat ? "bg-indigo-600" : "bg-gray-800"}`}
          >
            <MessageSquare />
          </button>
        </footer>
      </div>
    </HotKeys>
  );
};

export default InRoom;
