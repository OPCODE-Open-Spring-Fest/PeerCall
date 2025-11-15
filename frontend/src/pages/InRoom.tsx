import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { io, Socket } from "socket.io-client";
import { Mic, MicOff, Video, VideoOff, PhoneOff, Users, MessageSquare } from "lucide-react";
import { motion } from "framer-motion";
import { HotKeys } from "react-hotkeys";
import { useConnectionQuality } from "../hooks/useConnectionQuality.js";
import ConnectionQualityIndicator from "../components/ConnectionQualityIndicator.js";
import { API_ENDPOINTS } from "../lib/apiConfig.js";

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
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [showPermissionModal, setShowPermissionModal] = useState(false);


  const [micOn, setMicOn] = useState(true);
  const [videoOn, setVideoOn] = useState(true);
  const [showChat, setShowChat] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [userName, setUserName] = useState("User");
  const [participantCount, setParticipantCount] = useState(1);

  const [isSharing, setIsSharing] = useState(false);
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);

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
      const storedName = localStorage.getItem("userName");
      if (storedName) {
        setUserName(storedName);
      } else {
        // simple fallback: derive from token if you have a scheme
        setUserName("User");
      }
    }
  }, []);

  // --- Helper: create RTCPeerConnection and attach handlers ---
  const createPeerConnection = (isInitiator = false) => {
    if (peerConnectionRef.current) return peerConnectionRef.current;

    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        // add TURN if you have one for production
      ],
    });

    // Send ICE candidates to remote via signaling
    pc.onicecandidate = (event) => {
      if (event.candidate && socketRef.current && roomName) {
        socketRef.current.emit("rtc-ice-candidate", {
          roomId: roomName,
          candidate: event.candidate,
        });
      }
    };

    // When remote track arrives, attach to remote video element
    pc.ontrack = (event) => {
      // For typical one-stream-per-peer, event.streams[0] is the remote stream
      const [stream] = event.streams;
      if (remoteVideoRef.current && stream) {
        remoteVideoRef.current.srcObject = stream;
      }
    };

    // Add local audio/video tracks if available
    const localStream = mediaStreamRef.current;
    if (localStream) {
      localStream.getTracks().forEach((track) => {
        try {
          pc.addTrack(track, localStream);
        } catch (err) {
          console.warn("addTrack failed:", err);
        }
      });
    }

    peerConnectionRef.current = pc;
    return pc;
  };

  // --- Signaling handlers ---
  useEffect(() => {
    if (!roomName) return;

    const socket = io(API_ENDPOINTS.SOCKET);
    socketRef.current = socket;

    socket.on("connect", () => {
      // join after connect
      socket.emit("join-room", roomName, userName);
    });

    // Chat related
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
      setMessages((prev) => [...prev, { user: "System", text: `${joinedUser} joined the room` }]);
      setParticipantCount((prev) => prev + 1);

      // If someone joined and we already have a local stream, create a peer connection and be the caller (initiator)
      // This helps existing participant initiate connection to the new joiner.
      // For simplicity we broadcast offers to the room; new participant will answer them.
      // Only create offer if we have local media ready.
      if (mediaStreamRef.current) {
        (async () => {
          const pc = createPeerConnection(true);
          try {
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            socket.emit("rtc-offer", { roomId: roomName, sdp: offer });
          } catch (err) {
            console.error("Failed to create/send offer:", err);
          }
        })();
      }
    });

    socket.on("user-left", ({ userName: leftUser }: { userName: string }) => {
      setMessages((prev) => [...prev, { user: "System", text: `${leftUser} left the room` }]);
      setParticipantCount((prev) => Math.max(1, prev - 1));
      // If peer left, close pc
      if (peerConnectionRef.current) {
        try {
          peerConnectionRef.current.close();
        } catch (e) { }
        peerConnectionRef.current = null;
        if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
      }
    });

    socket.on("update-members", (members: any[]) => {
      setParticipantCount(members.length || 1);
    });

    // RTC Offer: other participant sent an offer -> set remote desc and create answer
    socket.on("rtc-offer", async (payload: { roomId?: string; sdp: RTCSessionDescriptionInit }) => {
      try {
        // If we don't have a pc yet, create one
        const pc = createPeerConnection(false);
        await pc.setRemoteDescription(new RTCSessionDescription(payload.sdp));
        // create answer
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.emit("rtc-answer", { roomId: roomName, sdp: answer });
      } catch (err) {
        console.error("Error handling rtc-offer:", err);
      }
    });

    // RTC Answer: remote answered our offer -> set remote description
    socket.on("rtc-answer", async (payload: { roomId?: string; sdp: RTCSessionDescriptionInit }) => {
      try {
        const pc = peerConnectionRef.current;
        if (!pc) {
          console.warn("Received answer but no peerConnection exists");
          return;
        }
        await pc.setRemoteDescription(new RTCSessionDescription(payload.sdp));
      } catch (err) {
        console.error("Error handling rtc-answer:", err);
      }
    });

    // ICE candidate from remote -> add to pc
    socket.on("rtc-ice-candidate", async (payload: { roomId?: string; candidate: RTCIceCandidateInit }) => {
      try {
        const pc = peerConnectionRef.current;
        if (!pc || !payload?.candidate) return;
        await pc.addIceCandidate(new RTCIceCandidate(payload.candidate));
      } catch (err) {
        console.error("Error adding remote ICE candidate:", err);
      }
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.emit("leave-room", {
          roomId: roomName,
          userId: localStorage.getItem("token") || "",
          userName,
        });
        socketRef.current.disconnect();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomName, userName]);

  // Initialize media stream
  const initMedia = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });

      // Success
      setPermissionError(null);
      setShowPermissionModal(false);

      // Save stream to your refs/states
      mediaStreamRef.current = stream;
      setMicOn(true);
      setVideoOn(true);

      // Attach tracks, send to peer, whatever your flow is
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

    } catch (err: any) {
      console.error("Error accessing camera/mic:", err);

      let msg = "Camera/Microphone access was denied. Please allow permissions.";

      if (err.name === "NotAllowedError") {
        msg = "You blocked camera/mic access for this site. Please enable it from browser settings.";
      } else if (err.name === "NotFoundError") {
        msg = "No camera or microphone was found on your device.";
      }

      setPermissionError(msg);
      setShowPermissionModal(true);

      setMicOn(false);
      setVideoOn(false);
    }
  };
  useEffect(() => {
    initMedia();
  }, []);


  // When local media becomes available and a peer is present, ensure tracks are added
  useEffect(() => {
    // If we have a pc and a media stream, make sure tracks are added
    const pc = peerConnectionRef.current;
    const stream = mediaStreamRef.current;
    if (pc && stream) {
      // Avoid double adding by checking pc.getSenders()
      const existingKinds = pc.getSenders().map((s) => s.track?.kind).filter(Boolean);
      stream.getTracks().forEach((track) => {
        if (!existingKinds.includes(track.kind)) {
          try {
            pc.addTrack(track, stream);
          } catch (err) {
            console.warn("addTrack (later) failed:", err);
          }
        }
      });
    }
  }, [mediaStreamRef.current]); // note: this effect will run once after media sets

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
    // stop local stream
    mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
    // stop screen stream (if any)
    screenStream?.getTracks().forEach((t) => t.stop());
    // close pc
    if (peerConnectionRef.current) {
      try {
        peerConnectionRef.current.close();
      } catch (e) { }
      peerConnectionRef.current = null;
    }
    // disconnect socket
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

  // ---------------- Screen share logic ----------------
  const replaceSendersWithTrack = (track: MediaStreamTrack | null) => {
    const pc = peerConnectionRef.current;
    if (!pc) return;
    pc.getSenders().forEach((sender) => {
      if (sender.track && sender.track.kind === "video") {
        sender.replaceTrack(track).catch((err) => console.warn("replaceTrack error:", err));
      }
    });
  };

  const startScreenShare = async () => {
    if (!navigator.mediaDevices || !(navigator.mediaDevices as any).getDisplayMedia) {
      alert("Screen sharing is not supported in this browser.");
      return;
    }
    try {
      const stream = await (navigator.mediaDevices as any).getDisplayMedia({
        video: true,
        audio: false, // optional: set true to capture system audio when supported
      });

      const screenTrack = stream.getVideoTracks()[0];
      if (!screenTrack) throw new Error("No screen track");

      // When the user stops sharing using browser UI:
      screenTrack.onended = () => {
        stopScreenShare(true);
      };

      // Replace outgoing video senders with the screen track
      replaceSendersWithTrack(screenTrack);

      setScreenStream(stream);
      setIsSharing(true);

      // Notify other participants so UI can pin the sharer
      socketRef.current?.emit("user-screen-sharing", { userName, sharing: true });

      // Keep a local preview of the screen: show on local video element (optional)
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;
    } catch (err) {
      console.error("startScreenShare error:", err);
    }
  };

  const stopScreenShare = (fromTrackEnd = false) => {
    // Stop any screen tracks
    screenStream?.getTracks().forEach((t) => t.stop());

    // Restore camera track
    const cameraTrack = mediaStreamRef.current?.getVideoTracks()[0] || null;
    replaceSendersWithTrack(cameraTrack);

    // Restore local preview to camera stream
    if (localVideoRef.current) localVideoRef.current.srcObject = mediaStreamRef.current;

    setIsSharing(false);
    setScreenStream(null);

    // Notify peers
    socketRef.current?.emit("user-screen-sharing", { userName, sharing: false });
    // If fromTrackEnd true, the onended handler already called this path; emitting twice is harmless
  };

  const toggleScreenShare = () => {
    if (isSharing) stopScreenShare();
    else startScreenShare();
  };

  // Listen for remote sharing UI hints (server should forward this event)
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;
    const onSharing = ({ userName: sharerName, sharing }: { userName: string; sharing: boolean }) => {
      if (sharing) {
        setMessages((prev) => [...prev, { user: "System", text: `${sharerName} is sharing their screen` }]);
        // Optionally: if sharer is remote, you could enlarge the remote video tile
        // Implementation depends on your layout state (not provided here)
      } else {
        setMessages((prev) => [...prev, { user: "System", text: `${sharerName} stopped sharing` }]);
      }
    };
    socket.on("user-screen-sharing", onSharing);
    return () => {
      socket.off("user-screen-sharing", onSharing);
    };
  }, []);

  // =======================================================
  // UI
  // =======================================================
  if (!roomName) {
    return (
      <div className="h-screen flex items-center justify-center">
        <p className="text-white">Invalid room</p>
      </div>
    );
  }
  const permissionModal = showPermissionModal && (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-gray-900 text-white w-full max-w-md p-6 rounded-2xl shadow-xl border border-gray-700"
      >
        <h2 className="text-xl font-semibold mb-3">Permissions Required</h2>

        <p className="text-gray-300 mb-4 text-sm leading-relaxed">
          {permissionError}
        </p>

        {/* Instructions when user BLOCKED permissions */}
        {permissionError?.includes("blocked") && (
          <div className="text-sm text-gray-400 mb-4">
            <p className="mb-2">To enable camera/mic permissions:</p>
            <ul className="list-disc ml-5 space-y-1">
              <li>Click the lock icon in the URL bar</li>
              <li>Open "Site Settings"</li>
              <li>Set Camera and Microphone to "Allow"</li>
              <li>Reload the page</li>
            </ul>
          </div>
        )}

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={() => setShowPermissionModal(false)}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm"
          >
            Close
          </button>

          <button
            onClick={() => {
              setShowPermissionModal(false);
              initMedia(); // 🔥 This re-triggers browser permission prompt
            }}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-sm font-medium"
          >
            Retry
          </button>
        </div>
      </motion.div>
    </div>
  );


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
              <span className="text-sm font-medium">
                {participantCount} Participant{participantCount !== 1 ? "s" : ""}
              </span>
            </div>
          </div>
        </header>

        {/* Main Video Area */}
        {permissionModal}

        <div className="flex-1 flex flex-col md:flex-row">
          {/* Video Grid */}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
            {/* Local Video */}
            <div className="bg-black rounded-2xl relative overflow-hidden group">
              <video ref={localVideoRef} autoPlay muted playsInline className="w-full h-full object-cover rounded-2xl" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
              <span className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg text-sm font-medium border border-white/10 shadow-lg">
                You ({userName})
              </span>
              <div className="absolute top-3 right-3">
                <ConnectionQualityIndicator quality={connectionQualityStats.quality} stats={connectionQualityStats} showLabel={false} compact={true} />
              </div>
            </div>

            {/* Remote Video */}
            <div className="bg-black rounded-2xl relative overflow-hidden group">
              <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover rounded-2xl" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
              <span className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg text-sm font-medium border border-white/10 shadow-lg">
                Peer
              </span>
              <div className="absolute top-3 right-3">
                <ConnectionQualityIndicator quality={connectionQualityStats.quality} stats={connectionQualityStats} showLabel={false} compact={true} />
              </div>
            </div>
          </div>

          {/* Chat Panel */}
          {showChat && (
            <motion.div initial={{ x: 200, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 200, opacity: 0 }} className="w-full md:w-80 bg-gray-900 dark:bg-gray-800 border-l border-gray-800 dark:border-gray-700 flex flex-col">
              <div className="p-3 border-b border-gray-800 dark:border-gray-700 font-medium">In-call Chat</div>
              <div className="flex-1 overflow-y-auto p-3 text-gray-300 dark:text-gray-400">
                {messages.length === 0 ? (
                  <p className="text-sm text-gray-500">No messages yet...</p>
                ) : (
                  <div className="space-y-2">
                    {messages.map((msg, idx) => (
                      <div key={idx} className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-semibold ${msg.user === "System" ? "text-yellow-400" : msg.user === userName ? "text-green-400" : "text-indigo-400"}`}>
                            {msg.user}
                          </span>
                          <span className="text-xs text-gray-400">{msg.time ? new Date(msg.time).toLocaleTimeString() : ""}</span>
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
                <input type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)} placeholder="Type a message..." className="flex-1 bg-gray-800 dark:bg-gray-700 rounded-l-md px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                <button type="submit" className="bg-indigo-600 dark:bg-indigo-500 px-4 rounded-r-md text-sm hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors">
                  Send
                </button>
              </form>
            </motion.div>
          )}
        </div>

        {/* Controls */}
        <footer className="p-4 flex justify-center gap-6 border-t border-gray-800 dark:border-gray-700 bg-gray-950 dark:bg-gray-900">
          <button onClick={toggleMic} className={`p-3 rounded-full ${micOn ? "bg-gray-800 dark:bg-gray-700" : "bg-red-600 dark:bg-red-500"} hover:opacity-80 transition-opacity`} title="Toggle Microphone (Ctrl+M)">
            {micOn ? <Mic /> : <MicOff />}
          </button>

          <button onClick={toggleVideo} className={`p-3 rounded-full ${videoOn ? "bg-gray-800 dark:bg-gray-700" : "bg-red-600 dark:bg-red-500"} hover:opacity-80 transition-opacity`} title="Toggle Video (Ctrl+V)">
            {videoOn ? <Video /> : <VideoOff />}
          </button>

          <button onClick={handleEndCall} className="p-3 rounded-full bg-red-600 dark:bg-red-500 hover:bg-red-700 dark:hover:bg-red-600 transition-colors" title="End Call">
            <PhoneOff />
          </button>

          <button onClick={() => setShowChat(!showChat)} className={`p-3 rounded-full ${showChat ? "bg-indigo-600 dark:bg-indigo-500" : "bg-gray-800 dark:bg-gray-700"} hover:opacity-80 transition-opacity`} title="Toggle Chat (Ctrl+C)">
            <MessageSquare />
          </button>

          {/* Screen share button */}
          <button onClick={toggleScreenShare} className={`p-3 rounded-full ${isSharing ? "bg-red-600 dark:bg-red-500" : "bg-gray-800 dark:bg-gray-700"} hover:opacity-80 transition-opacity`} title={isSharing ? "Stop Screen Share" : "Share Screen (Click)"}>
            {/* simple icon fallback: use text emoji if you don't have an icon; you can replace with an svg */}
            {isSharing ? "🛑" : "🖥️"}
          </button>
        </footer>
      </div>
    </HotKeys>
  );
};

export default InRoom;
