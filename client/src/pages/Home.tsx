import { motion } from "framer-motion";
import { Link } from "wouter";
import { CyberButton } from "@/components/CyberButton";
import { GlassPanel } from "@/components/GlassPanel";
import { BrainCircuit, MessageSquare, Zap, Target } from "lucide-react";
import { Navbar } from "@/components/Navbar";

export default function Home() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
    },
  };

  return (
    <div className="min-h-screen pt-16">
      <Navbar />
      
      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="text-center max-w-4xl mx-auto"
        >
          <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-panel mb-8 border-primary/30">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
            <span className="text-xs font-medium text-primary tracking-widest uppercase">System Online V2.0</span>
          </motion.div>

          <motion.h1 variants={itemVariants} className="text-5xl md:text-7xl font-black mb-6 leading-tight">
            ELEVATE YOUR <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary neon-text-cyan">
              DISCOURSE
            </span>
          </motion.h1>

          <motion.p variants={itemVariants} className="text-lg md:text-xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
            Train your communication skills in hyper-realistic, AI-driven group discussions. Face adaptive personalities, articulate complex arguments, and receive deep analytical feedback.
          </motion.p>

          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link href="/setup">
              <CyberButton size="lg" className="w-full sm:w-auto">
                Initialize Session
              </CyberButton>
            </Link>
            <Link href="/analytics">
              <CyberButton variant="ghost" size="lg" className="w-full sm:w-auto">
                View Analytics
              </CyberButton>
            </Link>
          </motion.div>
        </motion.div>

        {/* Features Grid */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-32"
        >
          <GlassPanel glowingEdge="cyan" className="p-8">
            <BrainCircuit className="w-12 h-12 text-primary mb-6" />
            <h3 className="text-xl font-bold mb-3 font-display">Adaptive AI Personas</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Engage with varied archetypes: The Skeptic, The Visionary, The Data Analyst. Each uniquely programmed to challenge your perspectives.
            </p>
          </GlassPanel>

          <GlassPanel glowingEdge="purple" className="p-8 relative top-0 md:top-12">
            <Zap className="w-12 h-12 text-secondary mb-6" />
            <h3 className="text-xl font-bold mb-3 font-display">Real-time Synthesis</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Experience dynamic conversations where AI participants listen to you and each other, creating organic, unpredictable debates.
            </p>
          </GlassPanel>

          <GlassPanel glowingEdge="cyan" className="p-8">
            <Target className="w-12 h-12 text-primary mb-6" />
            <h3 className="text-xl font-bold mb-3 font-display">Precision Feedback</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Post-session telemetry breaks down your clarity, leadership, and argumentation with actionable metrics and insights.
            </p>
          </GlassPanel>
        </motion.div>
      </main>

      {/* Decorative background elements */}
      <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden">
        <div className="absolute top-1/4 left-10 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 right-10 w-[600px] h-[600px] bg-secondary/5 rounded-full blur-[120px]" />
      </div>
    </div>
  );
}
