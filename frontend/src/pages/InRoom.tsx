import React, { useState, useEffect, useRef } from "react";
import { Mic, MicOff, Video, VideoOff, PhoneOff, Users, MessageSquare } from "lucide-react";
import { motion } from "framer-motion";
import { HotKeys } from "react-hotkeys";

const keyMap = {
  TOGGLE_MIC: "ctrl+m",
  TOGGLE_VIDEO: "ctrl+v",
  TOGGLE_CHAT: "ctrl+c",
};

const InRoom: React.FC<{ roomName: string }> = ({ roomName }) => {
  const [micOn, setMicOn] = useState(true);
  const [videoOn, setVideoOn] = useState(true);
  const [showChat, setShowChat] = useState(false);
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const [messages, setMessages] = useState<{ user: string; text: string; time?: string }[]>([]);
  const [chatInput, setChatInput] = useState("");
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    document.title = `${roomName} | PeerCall`;
    //initalize local media when joining the room
    const initMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: true,
        });
        mediaStreamRef.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
        const hasAudio = stream.getAudioTracks().some((t) => t.enabled !== false);
        const hasVideo = stream.getVideoTracks().some((t) => t.enabled !== false);
        setMicOn(hasAudio);
        setVideoOn(hasVideo);
      } catch (err) {
        console.error("Failed to get user media:", err);//due to denial or other unavailability issues
        setMicOn(false);
        setVideoOn(false);
      }
    };

    initMedia();

    return () => {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((t) => t.stop());
        mediaStreamRef.current = null;
      }
    };
  }, [roomName]);

  const handlers = {//to handle the keyboard events
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
      toggleChat();
    },
  };
  const toggleMic = () => {
    const stream = mediaStreamRef.current;
    if (!stream) {
      console.warn("No local media stream available to toggle mic");
      setMicOn((s) => !s);
      return;
    }
    const audioTracks = stream.getAudioTracks();
    if (audioTracks.length === 0) {
      console.warn("No audio tracks found");
      setMicOn(false);
      return;
    }
    const enabled = !audioTracks[0].enabled;
    audioTracks.forEach((t) => (t.enabled = enabled));
    setMicOn(enabled);
  };

  const toggleVideo = () => {
    const stream = mediaStreamRef.current;
    if (!stream) {
      console.warn("No local media stream available to toggle video");
      setVideoOn((s) => !s);
      return;
    }
    const videoTracks = stream.getVideoTracks();
    if (videoTracks.length === 0) {
      console.warn("No video tracks found");
      setVideoOn(false);
      return;
    }
    const enabled = !videoTracks[0].enabled;
    videoTracks.forEach((t) => (t.enabled = enabled));
    setVideoOn(enabled);
  };

  const toggleChat = () => {
    setShowChat((prev) => !prev);
  };

  useEffect(() => {
    if(chatEndRef.current)chatEndRef.current.scrollIntoView({behavior:"smooth"});
  },[messages,showChat]);

  return (
    <HotKeys keyMap={keyMap} handlers={handlers}>
      <div className="h-screen w-full bg-gray-950 text-white flex flex-col">
        {/* Header */}
        <header className="p-4 border-b border-gray-800 flex justify-between items-center">
          <h1 className="text-xl font-semibold">Room: {roomName}</h1>
          <div className="flex items-center gap-3 text-gray-400">
            <Users className="w-5 h-5" />
            <span>2 Participants</span>
          </div>
        </header>

        {/* Main Video Area */}
        <div className="flex-1 flex flex-col md:flex-row">
          {/* Video Grid */}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
            <div className="bg-black rounded-2xl relative">
              <video
                ref={localVideoRef}
                autoPlay
                muted
                className="w-full h-full object-cover rounded-2xl"
              />
              <span className="absolute bottom-2 left-2 bg-gray-800 px-2 py-1 rounded text-sm">
                You
              </span>
            </div>
            <div className="bg-black rounded-2xl relative">
              <video
                ref={remoteVideoRef}
                autoPlay
                className="w-full h-full object-cover rounded-2xl"
              />
              <span className="absolute bottom-2 left-2 bg-gray-800 px-2 py-1 rounded text-sm">
                Peer
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
              <div className="p-3 border-b border-gray-800 font-medium">
                In-call Chat
              </div>
              <div className="flex-1 overflow-y-auto p-3 text-gray-300">
                {messages.length === 0 ? (
                  <p className="text-sm">No messages yet...</p>
                ) : (
                  <div className="space-y-2">
                    {messages.map((msg, idx) => (
                      <div key={idx} className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-green-300 font-semibold">{msg.user}</span>
                          <span className="text-xs text-gray-400">{msg.time ? new Date(msg.time).toLocaleTimeString() : ""}</span>
                        </div>
                        <div className="mt-1">
                          <span className="bg-green-100 text-gray-900 rounded px-2 py-1 text-sm inline-block max-w-[85%]">{msg.text}</span>
                        </div>
                      </div>
                    ))}
                    <div ref={chatEndRef} />
                  </div>
                )}
              </div>
              <form className="p-3 border-t border-gray-800 flex" onSubmit={(e) => { e.preventDefault();
                  if (chatInput.trim() === "") return; setMessages((s) => [...s, { user: "You", text: chatInput.trim(), time: new Date().toISOString() }]); setChatInput("");
                }}>
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e)=>setChatInput(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 bg-gray-800 rounded-l-md px-3 py-2 text-sm focus:outline-none"
                />
                <button type="submit" className="bg-indigo-600 px-4 rounded-r-md text-sm">Send</button>
              </form>
            </motion.div>
          )}
        </div>

        {/* Controls */}
        <footer className="p-4 flex justify-center gap-6 border-t border-gray-800 bg-gray-950">
          <button
            onClick={toggleMic}
            className={`p-3 rounded-full ${micOn ? "bg-gray-800" : "bg-red-600"}`}
          >
            {micOn ? <Mic /> : <MicOff />}
          </button>

          <button
            onClick={toggleVideo}
            className={`p-3 rounded-full ${
              videoOn ? "bg-gray-800" : "bg-red-600"
            }`}
          >
            {videoOn ? <Video /> : <VideoOff />}
          </button>

          <button className="p-3 rounded-full bg-red-600 hover:bg-red-700">
            <PhoneOff />
          </button>

          <button
            onClick={toggleChat}
            className={`p-3 rounded-full ${
              showChat ? "bg-indigo-600" : "bg-gray-800"
            }`}
          >
            <MessageSquare />
          </button>
        </footer>
      </div>
    </HotKeys>
  );
};

export default InRoom;
