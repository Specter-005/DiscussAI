import { useState, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";

interface SessionTimerProps {
  durationSeconds: number;
  onTimeUp: () => void;
  isActive: boolean;
}

export function SessionTimer({ durationSeconds, onTimeUp, isActive }: SessionTimerProps) {
  const [remaining, setRemaining] = useState(durationSeconds);
  const [hasWarned, setHasWarned] = useState(false);
  const onTimeUpRef = useRef(onTimeUp);
  onTimeUpRef.current = onTimeUp;

  useEffect(() => {
    if (!isActive) return;
    const interval = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onTimeUpRef.current();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isActive]);

  useEffect(() => {
    if (remaining <= 60 && remaining > 0 && !hasWarned) {
      setHasWarned(true);
    }
  }, [remaining, hasWarned]);

  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  const progress = remaining / durationSeconds;

  // Color based on progress
  const getColor = () => {
    if (progress > 0.5) return "#22c55e"; // green
    if (progress > 0.2) return "#eab308"; // yellow
    return "#ef4444"; // red
  };

  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <div className="flex items-center gap-3">
      <div className={`relative w-20 h-20 ${remaining <= 60 && remaining > 0 ? "timer-flash" : ""}`}>
        <svg width="80" height="80" className="transform -rotate-90">
          <circle
            cx="40"
            cy="40"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            className="text-muted/30"
          />
          <circle
            cx="40"
            cy="40"
            r={radius}
            fill="none"
            stroke={getColor()}
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            style={{ transition: "stroke-dashoffset 1s linear, stroke 0.5s ease" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="text-lg font-display font-bold tabular-nums"
            style={{ color: getColor() }}
          >
            {minutes}:{String(seconds).padStart(2, "0")}
          </span>
        </div>
      </div>
    </div>
  );
}
