import React, { useState } from "react";
import { WifiOff, SignalLow, SignalMedium, SignalHigh, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { ConnectionQuality, ConnectionQualityStats } from "../hooks/useConnectionQuality.js";

interface ConnectionQualityIndicatorProps {
  quality: ConnectionQuality;
  stats?: ConnectionQualityStats;
  showLabel?: boolean;
  className?: string;
  compact?: boolean;
}

const ConnectionQualityIndicator: React.FC<ConnectionQualityIndicatorProps> = ({
  quality,
  stats,
  showLabel = false,
  className = "",
  compact = false,
}) => {
  const [showTooltip, setShowTooltip] = useState(false);

  const getQualityConfig = () => {
    switch (quality) {
      case "excellent": //4 bars
        return {
          icon: SignalHigh,
          barColor: "bg-green-500",
          inactiveColor: "bg-gray-700/40",
          textColor: "text-green-500",
          label: "Excellent",
          bars: [true, true, true, true],
        };
      case "good": // 3 bars
        return {
          icon: SignalHigh,
          barColor: "bg-green-400",
          inactiveColor: "bg-gray-700/40",
          textColor: "text-green-400",
          label: "Good",
          bars: [true, true, true, false],
        };
      case "fair": // 2 bars
        return {
          icon: SignalMedium,
          barColor: "bg-yellow-500",
          inactiveColor: "bg-gray-700/40",
          textColor: "text-yellow-500",
          label: "Fair",
          bars: [true, true, false, false],
        };
      case "poor": // 1 bar
        return {
          icon: SignalLow,
          barColor: "bg-red-500",
          inactiveColor: "bg-gray-700/40",
          textColor: "text-red-500",
          label: "Poor",
          bars: [true, false, false, false],
        };
      default: // 0 bars
        return {
          icon: WifiOff,
          barColor: "bg-gray-500",
          inactiveColor: "bg-gray-700/40",
          textColor: "text-gray-400",
          label: "Unknown",
          bars: [false, false, false, false],
        };
    }
  };

  const config = getQualityConfig();
  const Icon = config.icon;
  const barHeights = [6, 9, 12, 15];

  const prevQuality = React.useRef<ConnectionQuality | null>(null);
  React.useEffect(() => {
    if (prevQuality.current === quality) return;
    prevQuality.current = quality;
    switch (quality) {
      case "poor":
        toast.error("Your connection is poor. Expect lag or interruptions.", {
          duration: 2500,
        });
        break;
      case "fair":
        toast.warning("Your connection is fair. Performance may vary.", {
          duration: 2500,
        });
        break;
      case "good":
        toast("Your connection is good.", { duration: 2000 });
        break;
      case "excellent":
        toast.success("Excellent connection!", { duration: 2000 });
        break;
      default:
        toast("Connection quality unknown.", { duration: 2000 });
    }
  }, [quality]);

  const formatMetric = (value?: number, unit: string = "") => {
    if (value === undefined) return "N/A";
    if (value < 1) return `${value.toFixed(2)}${unit}`;
    return `${Math.round(value)}${unit}`;
  };

  const tooltipContent = stats && (
    <div className="text-xs space-y-1">
      <div className="font-semibold text-white mb-2">Connection Quality</div>
      {stats.rtt !== undefined && (
        <div className="flex justify-between gap-4 text-gray-300">
          <span>Latency:</span>
          <span className="font-medium">{formatMetric(stats.rtt, "ms")}</span>
        </div>
      )}
      {stats.packetLoss !== undefined && (
        <div className="flex justify-between gap-4 text-gray-300">
          <span>Packet Loss:</span>
          <span className="font-medium">{formatMetric(stats.packetLoss, "%")}</span>
        </div>
      )}
      {stats.jitter !== undefined && (
        <div className="flex justify-between gap-4 text-gray-300">
          <span>Jitter:</span>
          <span className="font-medium">{formatMetric(stats.jitter, "ms")}</span>
        </div>
      )}
      {stats.bandwidth !== undefined && (
        <div className="flex justify-between gap-4 text-gray-300">
          <span>Bandwidth:</span>
          <span className="font-medium">{formatMetric(stats.bandwidth, "kbps")}</span>
        </div>
      )}
      {stats.videoResolution && (
        <div className="flex justify-between gap-4 text-gray-300">
          <span>Resolution:</span>
          <span className="font-medium">
            {stats.videoResolution.width}x{stats.videoResolution.height}
          </span>
        </div>
      )}
      {stats.videoFrameRate !== undefined && (
        <div className="flex justify-between gap-4 text-gray-300">
          <span>Frame Rate:</span>
          <span className="font-medium">{formatMetric(stats.videoFrameRate, "fps")}</span>
        </div>
      )}
    </div>
  );

  if (compact) {
    return (
      <div
        className={`relative ${className}`}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <div className="flex items-end gap-0.5 bg-black/60 backdrop-blur-sm px-2 py-1.5 rounded-md border border-white/10">
          {quality === "unknown" ? (
            <Icon className={`w-3.5 h-3.5 ${config.textColor}`} />
          ) : (
            <div className="flex items-end gap-0.5">
              {config.bars.map((active, index) => (
                <div
                  key={index}
                  className={`w-1 rounded-sm transition-all duration-200 ${
                    active ? config.barColor : config.inactiveColor
                  }`}
                  style={{ 
                    height: `${barHeights[index]}px`,
                  }}
                />
              ))}
            </div>
          )}
        </div>
        <AnimatePresence>
          {showTooltip && tooltipContent && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 5 }}
              transition={{ duration: 0.15 }}
              className="absolute bottom-full right-0 mb-2 bg-gray-900/95 backdrop-blur-md px-3 py-2 rounded-lg border border-gray-700 shadow-xl min-w-[180px] z-50"
            >
              {tooltipContent}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div
      className={`relative flex items-center gap-2 ${className}`}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <div className="flex items-center gap-2 bg-gray-900/80 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-gray-800/50">
        {/*signal bars*/}
        <div className="flex items-end gap-0.5">
          {quality === "unknown" ? (
            <Icon className={`w-4 h-4 ${config.textColor}`} />
          ) : (
            <div className="flex items-end gap-0.5">
              {config.bars.map((active, index) => (
                <div
                  key={index}
                  className={`w-1.5 rounded-sm transition-all duration-200 ${
                    active ? config.barColor : config.inactiveColor
                  }`}
                  style={{ 
                    height: `${barHeights[index]}px`,
                   }}
                />
              ))}
            </div>
          )}
        </div>

        {showLabel && (
          <span className={`text-xs font-medium ${config.textColor}`}>{config.label}</span>
        )}

        {stats && (stats.rtt !== undefined || stats.packetLoss !== undefined) && (
          <Info className="w-3 h-3 text-gray-500" />
        )}
      </div>
      <AnimatePresence>
        {showTooltip && tooltipContent && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full right-0 mt-2 bg-gray-900/95 backdrop-blur-md px-3 py-2.5 rounded-lg border border-gray-700 shadow-xl min-w-[200px] z-50"
          >
            {tooltipContent}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ConnectionQualityIndicator;

