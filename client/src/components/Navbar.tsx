import { Link } from "wouter";
import { Cpu, Moon, Sun } from "lucide-react";
import { motion } from "framer-motion";
import { useTheme } from "@/contexts/ThemeProvider";

export function Navbar() {
  const { theme, toggleTheme } = useTheme();

  return (
    <motion.header 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 left-0 right-0 z-50 glass-panel border-b-0 rounded-none border-t-0 border-x-0"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group cursor-pointer">
          <div className="relative">
            <Cpu className="w-8 h-8 text-primary group-hover:text-secondary transition-colors duration-500" />
            <div className="absolute inset-0 bg-primary/20 blur-md rounded-full group-hover:bg-secondary/20 transition-colors duration-500" />
          </div>
          <span className="font-display font-bold text-xl tracking-wider">
            DISCUSS<span className="text-primary neon-text-cyan">AI</span>
          </span>
        </Link>

        <nav className="hidden md:flex gap-8 flex-1 justify-center">
          <Link href="/setup" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors uppercase tracking-widest">
            New Session
          </Link>
          <Link href="/analytics" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors uppercase tracking-widest">
            Analytics
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={toggleTheme}
            className="relative p-2 rounded-xl bg-primary/10 border border-primary/30 hover:bg-primary/20 transition-all"
            title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            <motion.div
              initial={false}
              animate={{ rotate: theme === "dark" ? 0 : 180, scale: 1 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              {theme === "dark" ? (
                <Moon className="w-4 h-4 text-primary" />
              ) : (
                <Sun className="w-4 h-4 text-primary" />
              )}
            </motion.div>
          </motion.button>

          <div className="group relative cursor-pointer">
            <a className="text-xs text-muted-foreground hover:text-foreground/50 transition-colors">?</a>
            <div className="absolute right-0 mt-2 hidden group-hover:block bg-card border border-border rounded-lg px-3 py-2 text-xs text-muted-foreground whitespace-nowrap z-50">
              Created by Specter ✦
            </div>
          </div>
        </div>
      </div>
    </motion.header>
  );
}
