import React, { useState, useEffect, useRef } from "react";
import {
    Mic,
    MicOff,
    Video,
    VideoOff,
    PhoneOff,
    Users,
    MessageSquare,
} from "lucide-react";
import { motion } from "framer-motion";
import { useConnectionQuality } from "../hooks/useConnectionQuality";
import ConnectionQualityIndicator from "../components/ConnectionQualityIndicator";

const InRoom: React.FC<{ roomName: string }> = ({ roomName }) => {
    const [micOn, setMicOn] = useState(true);
    const [videoOn, setVideoOn] = useState(true);
    const [showChat, setShowChat] = useState(false);

    const localVideoRef = useRef<HTMLVideoElement | null>(null);
    const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
    const connectionQualityStats = useConnectionQuality({
        localStream,
        peerConnection: peerConnectionRef.current,
    });

    // 🔹 STEP 1: Initialize camera and mic on join
    useEffect(() => {
        document.title = `${roomName} | PeerCall`;

        const initMedia = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: true,
                    audio: true,
                });
                setLocalStream(stream);
                if (localVideoRef.current) {
                    localVideoRef.current.srcObject = stream;
                }
            } catch (err) {
                console.error("Error accessing camera/mic:", err);
                alert("Please allow camera and microphone permissions.");
            }
        };

        initMedia();

        // Cleanup when leaving room
        return () => {
            localStream?.getTracks().forEach((track) => track.stop());
        };
    }, [roomName]);

    // 🔹 STEP 2: Toggle mic
    const handleToggleMic = () => {
        if (!localStream) return;
        localStream.getAudioTracks().forEach((track) => {
            track.enabled = !track.enabled;
        });
        setMicOn((prev) => !prev);
    };

    // 🔹 STEP 3: Toggle video
    const handleToggleVideo = () => {
        if (!localStream) return;
        localStream.getVideoTracks().forEach((track) => {
            track.enabled = !track.enabled;
        });
        setVideoOn((prev) => !prev);
    };

    // 🔹 STEP 4: End call (for now just stop media)
    const handleEndCall = () => {
        localStream?.getTracks().forEach((track) => track.stop());
        window.location.href = "/"; // or navigate to dashboard/home
    };

    return (
        <div className="h-screen w-full bg-gray-950 text-white flex flex-col">
            {/* Header */}
            <header className="p-4 border-b border-gray-800/50 bg-gray-950/50 backdrop-blur-sm flex justify-between items-center">
                <h1 className="text-xl font-semibold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                    Room: {roomName}
                </h1>
                <div className="flex items-center gap-4">
                    <ConnectionQualityIndicator
                        quality={connectionQualityStats.quality}
                        stats={connectionQualityStats}
                        showLabel={true}
                    />
                    <div className="flex items-center gap-2 text-gray-400 bg-gray-900/50 px-3 py-1.5 rounded-lg border border-gray-800/50">
                        <Users className="w-4 h-4" />
                        <span className="text-sm font-medium">2 Participants</span>
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
                            You
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

                {/* Chat Panel (toggle) */}
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
                            <p className="text-sm">No messages yet...</p>
                        </div>
                        <div className="p-3 border-t border-gray-800 flex">
                            <input
                                type="text"
                                placeholder="Type a message..."
                                className="flex-1 bg-gray-800 rounded-l-md px-3 py-2 text-sm focus:outline-none"
                            />
                            <button className="bg-indigo-600 px-4 rounded-r-md text-sm">
                                Send
                            </button>
                        </div>
                    </motion.div>
                )}
            </div>

            {/* Controls */}
            <footer className="p-4 flex justify-center gap-6 border-t border-gray-800 bg-gray-950">
                <button
                    onClick={handleToggleMic}
                    className={`p-3 rounded-full ${micOn ? "bg-gray-800" : "bg-red-600"
                        }`}
                >
                    {micOn ? <Mic /> : <MicOff />}
                </button>

                <button
                    onClick={handleToggleVideo}
                    className={`p-3 rounded-full ${videoOn ? "bg-gray-800" : "bg-red-600"
                        }`}
                >
                    {videoOn ? <Video /> : <VideoOff />}
                </button>

                <button
                    onClick={handleEndCall}
                    className="p-3 rounded-full bg-red-600 hover:bg-red-700"
                >
                    <PhoneOff />
                </button>

                <button
                    onClick={() => setShowChat(!showChat)}
                    className={`p-3 rounded-full ${showChat ? "bg-indigo-600" : "bg-gray-800"
                        }`}
                >
                    <MessageSquare />
                </button>
            </footer>
        </div>
    );
};

export default InRoom;
