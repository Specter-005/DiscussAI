import { HTMLAttributes, ReactNode } from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

interface CyberButtonProps extends HTMLMotionProps<"button"> {
  variant?: "cyan" | "purple" | "ghost";
  size?: "sm" | "md" | "lg";
  children: ReactNode;
  isLoading?: boolean;
}

export function CyberButton({
  variant = "cyan",
  size = "md",
  className,
  children,
  isLoading,
  disabled,
  ...props
}: CyberButtonProps) {
  const baseStyles = "relative inline-flex items-center justify-center font-display font-bold uppercase tracking-wider overflow-hidden rounded-lg transition-all duration-300 z-10";
  
  const variants = {
    cyan: "bg-primary/10 text-primary border border-primary/50 hover:bg-primary/20 hover:neon-border-cyan hover:text-white",
    purple: "bg-secondary/10 text-secondary border border-secondary/50 hover:bg-secondary/20 hover:neon-border-purple hover:text-white",
    ghost: "bg-transparent text-muted-foreground border border-white/10 hover:bg-white/5 hover:text-white",
  };

  const sizes = {
    sm: "px-4 py-2 text-xs",
    md: "px-6 py-3 text-sm",
    lg: "px-8 py-4 text-base",
  };

  return (
    <motion.button
      whileHover={{ scale: disabled || isLoading ? 1 : 1.02 }}
      whileTap={{ scale: disabled || isLoading ? 1 : 0.98 }}
      className={cn(
        baseStyles,
        variants[variant],
        sizes[size],
        (disabled || isLoading) && "opacity-50 cursor-not-allowed hover:bg-transparent hover:shadow-none",
        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {/* Decorative corners */}
      <span className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-current opacity-50"></span>
      <span className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-current opacity-50"></span>
      
      {isLoading ? (
        <span className="flex items-center gap-2">
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          PROCESSING
        </span>
      ) : (
        children
      )}
    </motion.button>
  );
}
