import { MessageCircle } from "lucide-react";

interface TurnCounterProps {
  totalTurns: number;
  usedTurns: number;
}

export function TurnCounter({ totalTurns, usedTurns }: TurnCounterProps) {
  const remaining = totalTurns - usedTurns;
  
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-muted-foreground font-display tracking-wider uppercase">
        Turns
      </span>
      <div className="flex items-center gap-1">
        {Array.from({ length: totalTurns }).map((_, i) => (
          <MessageCircle
            key={i}
            className={`w-4 h-4 transition-all duration-300 ${
              i < usedTurns
                ? "text-primary fill-primary"
                : "text-muted-foreground/40"
            }`}
          />
        ))}
      </div>
      <span className={`text-xs font-bold font-display tabular-nums ${
        remaining <= 1 ? "text-red-400" : remaining <= 2 ? "text-yellow-400" : "text-primary"
      }`}>
        {remaining} left
      </span>
    </div>
  );
}
