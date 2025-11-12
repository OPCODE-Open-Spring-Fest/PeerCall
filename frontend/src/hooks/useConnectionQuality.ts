import { useState, useEffect, useRef } from "react";

export type ConnectionQuality = "excellent" | "good" | "fair" | "poor" | "unknown";

export interface ConnectionQualityStats {
  quality: ConnectionQuality;
  videoResolution?: { width: number; height: number };
  videoFrameRate?: number;
  audioLevel?: number;
  packetLoss?: number;
  jitter?: number;
  rtt?: number; //Round-trip-time in ms
  bandwidth?: number; //bandwidth in kbps
}

interface UseConnectionQualityOptions {
  localStream?: MediaStream | null;
  peerConnection?: RTCPeerConnection | null;
  updateInterval?: number; 
}

export const useConnectionQuality = ({
  localStream,
  peerConnection,
  updateInterval = 2000,
}: UseConnectionQualityOptions): ConnectionQualityStats => {
  const [stats, setStats] = useState<ConnectionQualityStats>({
    quality: "unknown",
  });
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (!localStream && !peerConnection) {
      setStats({ quality: "unknown" });
      return;
    }

    const updateStats = async () => {
      try {
        const newStats: ConnectionQualityStats = {
          quality: "unknown",
        };

        if (localStream) {
          const videoTrack = localStream.getVideoTracks()[0];
          const audioTrack = localStream.getAudioTracks()[0];

          if (videoTrack) {
            const settings = videoTrack.getSettings();
            newStats.videoResolution = {
              width: settings.width || 0,
              height: settings.height || 0,
            };
            newStats.videoFrameRate = settings.frameRate || 0;
          }

          if (audioTrack) {
            try {
              const trackStats = await audioTrack.getStats();
              trackStats.forEach((report) => {
                if (report.type === "media-source" && "audioLevel" in report) {
                  newStats.audioLevel = (report as any).audioLevel;
                }
              });
            } catch (e) {
              // not avlble
            }
          }
        }
        //network quality
        if (peerConnection) {
          try {
            const pcStats = await peerConnection.getStats();
            let totalPacketsLost = 0;
            let totalPackets = 0;
            let totalJitter = 0;
            let jitterCount = 0;
            let totalRtt = 0;
            let rttCount = 0;
            let availableBandwidth = 0;

            pcStats.forEach((report) => {
              if (report.type === "inbound-rtp" && report.mediaType === "video") {
                const inboundReport = report as any;
                if (inboundReport.packetsLost !== undefined) {
                  totalPacketsLost += inboundReport.packetsLost;
                }
                if (inboundReport.packetsReceived !== undefined) {
                  totalPackets += inboundReport.packetsReceived;
                }
                if (inboundReport.jitter !== undefined) {
                  totalJitter += inboundReport.jitter;
                  jitterCount++;
                }
              }
              if (report.type === "outbound-rtp" && report.mediaType === "video") {
                const outboundReport = report as any;
                if (outboundReport.packetsLost !== undefined) {
                  totalPacketsLost += outboundReport.packetsLost;
                }
                if (outboundReport.packetsSent !== undefined) {
                  totalPackets += outboundReport.packetsSent;
                }
              }
              if (report.type === "candidate-pair" && report.state === "succeeded") {
                const candidatePair = report as any;
                if (candidatePair.currentRoundTripTime !== undefined) {
                  totalRtt += candidatePair.currentRoundTripTime * 1000; 
                  rttCount++;
                }
                if (candidatePair.availableOutgoingBitrate !== undefined) {
                  availableBandwidth = Math.max(
                    availableBandwidth,
                    candidatePair.availableOutgoingBitrate / 1000 
                  );
                }
              }
            });

            if (totalPackets > 0) {
              newStats.packetLoss = (totalPacketsLost / totalPackets) * 100;
            }
            if (jitterCount > 0) {
              newStats.jitter = totalJitter / jitterCount;
            }
            if (rttCount > 0) {
              newStats.rtt = totalRtt / rttCount;
            }
            if (availableBandwidth > 0) {
              newStats.bandwidth = availableBandwidth;
            }
          } catch (e) {
            console.warn("Failed to get peer connection stats:", e);
          }
        }
        newStats.quality = calculateQuality(newStats);

        setStats(newStats);
      } catch (error) {
        console.error("Error updating connection quality stats:", error);
      }
    };

    updateStats();

    intervalRef.current = window.setInterval(updateStats, updateInterval);

    return () => {
      if (intervalRef.current !== null) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [localStream, peerConnection, updateInterval]);

  return stats;
};

export function calculateQuality(stats: Partial<ConnectionQualityStats>): ConnectionQuality {
  if (stats.packetLoss !== undefined || stats.rtt !== undefined || stats.jitter !== undefined) {
    const packetLoss = stats.packetLoss || 0;
    const rtt = stats.rtt || 0;
    const jitter = stats.jitter || 0;

    if (packetLoss < 1 && rtt < 100 && jitter < 20) {
      return "excellent";
    }
    if (packetLoss < 3 && rtt < 200 && jitter < 50) {
      return "good";
    }
    if (packetLoss < 5 && rtt < 300 && jitter < 100) {
      return "fair";
    }
    return "poor";
  }

  if (stats.videoResolution && stats.videoFrameRate !== undefined) {
    const { width, height } = stats.videoResolution;
    const pixels = width * height;
    const frameRate = stats.videoFrameRate;

    //Excellent: 720p+ at 30fps+
    if (pixels >= 1280 * 720 && frameRate >= 30) {
      return "excellent";
    }
    //Good: 480p+ at 25fps+
    if (pixels >= 640 * 480 && frameRate >= 25) {
      return "good";
    }
    //Fair: 360p+ at 20fps+
    if (pixels >= 640 * 360 && frameRate >= 20) {
      return "fair";
    }
    //Poor: anything lower
    return "poor";
  }

  return "unknown";
}

