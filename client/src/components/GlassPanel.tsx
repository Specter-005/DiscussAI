import { ReactNode } from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

interface GlassPanelProps extends HTMLMotionProps<"div"> {
  children: ReactNode;
  variant?: "light" | "heavy";
  glowingEdge?: "cyan" | "purple" | "none";
}

export function GlassPanel({
  children,
  className,
  variant = "light",
  glowingEdge = "none",
  ...props
}: GlassPanelProps) {
  return (
    <motion.div
      className={cn(
        variant === "light" ? "glass-panel" : "glass-panel-heavy",
        "relative rounded-2xl overflow-hidden",
        className
      )}
      {...props}
    >
      {glowingEdge === "cyan" && (
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary to-transparent opacity-50"></div>
      )}
      {glowingEdge === "purple" && (
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-secondary to-transparent opacity-50"></div>
      )}
      <div className="relative z-10 w-full h-full">
        {children}
      </div>
    </motion.div>
  );
}
