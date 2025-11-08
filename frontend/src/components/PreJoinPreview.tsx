import React, { useEffect, useRef, useState } from "react";

const PreJoinPreview: React.FC<{ onJoin: (stream: MediaStream) => void }> = ({ onJoin }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
    const [selectedCam, setSelectedCam] = useState<string>("");
    const [selectedMic, setSelectedMic] = useState<string>("");
    const [isMuted, setIsMuted] = useState(false);
    const [isCamOn, setIsCamOn] = useState(true);

    // 🔹 Fetch devices + get default media
    useEffect(() => {
        const initMedia = async () => {
            try {
                const newStream = await navigator.mediaDevices.getUserMedia({
                    video: true,
                    audio: true,
                });
                setStream(newStream);
                if (videoRef.current) videoRef.current.srcObject = newStream;

                const devicesList = await navigator.mediaDevices.enumerateDevices();
                setDevices(devicesList);
            } catch (err) {
                console.error("Media access denied:", err);
            }
        };

        initMedia();

        return () => {
            // 🔹 Cleanup
            stream?.getTracks().forEach(track => track.stop());
        };
    }, []);

    const handleToggleMic = () => {
        if (stream) {
            stream.getAudioTracks().forEach(track => (track.enabled = !track.enabled));
            setIsMuted(prev => !prev);
        }
    };

    const handleToggleCam = () => {
        if (stream) {
            stream.getVideoTracks().forEach(track => (track.enabled = !track.enabled));
            setIsCamOn(prev => !prev);
        }
    };

    const handleDeviceChange = async (deviceId: string, type: "audioinput" | "videoinput") => {
        if (!stream) return;

        // Stop old tracks of the same kind
        stream.getTracks()
            .filter(track => track.kind === (type === "audioinput" ? "audio" : "video"))
            .forEach(track => track.stop());

        const constraints: MediaStreamConstraints =
            type === "audioinput"
                ? { audio: { deviceId }, video: isCamOn }
                : { video: { deviceId }, audio: true };

        const newStream = await navigator.mediaDevices.getUserMedia(constraints);
        setStream(newStream);
        if (videoRef.current) videoRef.current.srcObject = newStream;

        if (type === "videoinput") setSelectedCam(deviceId);
        else setSelectedMic(deviceId);
    };

    return (
        <div className="flex flex-col items-center gap-4 p-6 bg-gray-900 text-white rounded-2xl shadow-lg">
            <h2 className="text-xl font-semibold">Preview Your Setup</h2>

            <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className="rounded-xl w-80 h-56 bg-black object-cover"
            />

            <div className="flex gap-4 mt-3">
                <button onClick={handleToggleCam} className="px-3 py-2 bg-blue-600 rounded-lg hover:bg-blue-700">
                    {isCamOn ? "Turn Off Camera" : "Turn On Camera"}
                </button>
                <button onClick={handleToggleMic} className="px-3 py-2 bg-blue-600 rounded-lg hover:bg-blue-700">
                    {isMuted ? "Unmute Mic" : "Mute Mic"}
                </button>
            </div>

            <div className="flex flex-col gap-2 mt-4 w-80">
                <label>Camera:</label>
                <select
                    value={selectedCam}
                    onChange={e => handleDeviceChange(e.target.value, "videoinput")}
                    className="text-black p-2 rounded-lg"
                >
                    {devices
                        .filter(d => d.kind === "videoinput")
                        .map(cam => (
                            <option key={cam.deviceId} value={cam.deviceId}>
                                {cam.label || `Camera ${cam.deviceId.slice(0, 5)}`}
                            </option>
                        ))}
                </select>

                <label>Microphone:</label>
                <select
                    value={selectedMic}
                    onChange={e => handleDeviceChange(e.target.value, "audioinput")}
                    className="text-black p-2 rounded-lg"
                >
                    {devices
                        .filter(d => d.kind === "audioinput")
                        .map(mic => (
                            <option key={mic.deviceId} value={mic.deviceId}>
                                {mic.label || `Mic ${mic.deviceId.slice(0, 5)}`}
                            </option>
                        ))}
                </select>
            </div>

            <button
                onClick={() => onJoin(stream!)}
                className="mt-6 px-6 py-3 bg-green-600 rounded-xl hover:bg-green-700"
            >
                Join Call
            </button>
        </div>
    );
};

export default PreJoinPreview;
