interface WaveformVisualizerProps {
  analyserData: Uint8Array | null;
  isActive: boolean;
}

export function WaveformVisualizer({ analyserData, isActive }: WaveformVisualizerProps) {
  if (!isActive) return null;

  const bars = analyserData ? Array.from(analyserData).slice(0, 16) : new Array(16).fill(30);

  return (
    <div className="flex items-end justify-center gap-[2px] h-8 px-2">
      {bars.map((value, i) => {
        const height = Math.max(4, (value / 255) * 32);
        return (
          <div
            key={i}
            className="w-[3px] rounded-full bg-gradient-to-t from-primary to-secondary"
            style={{
              height: `${height}px`,
              transition: "height 0.08s ease-out",
              opacity: 0.6 + (value / 255) * 0.4,
            }}
          />
        );
      })}
    </div>
  );
}
