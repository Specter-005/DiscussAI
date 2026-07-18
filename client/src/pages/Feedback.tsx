import { useEffect, useState } from "react";
import { useRoute, Link } from "wouter";
import { motion } from "framer-motion";
import { useFeedback, useGenerateFeedback } from "@/hooks/use-feedback";
import { useSession } from "@/hooks/use-sessions";
import { useMessages } from "@/hooks/use-messages";
import { GlassPanel } from "@/components/GlassPanel";
import { CyberButton } from "@/components/CyberButton";
import { Navbar } from "@/components/Navbar";
import {
  Loader2, Target, Zap, LayoutDashboard, BrainCircuit,
  Award, TrendingUp, AlertTriangle, ChevronRight, CheckCircle2
} from "lucide-react";
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, Tooltip as RechartsTooltip
} from "recharts";

interface EvaluationData {
  overallScore: number;
  clarity: { score: number; feedback: string; tip: string };
  confidence: { score: number; feedback: string; tip: string };
  argumentation: { score: number; feedback: string; tip: string };
  leadership: { score: number; feedback: string; tip: string };
  listening: { score: number; feedback: string; tip: string };
  topStrengths: string[];
  areasToImprove: string[];
  actionPlan: string[];
  placementReadiness: string;
}

export default function Feedback() {
  const [, params] = useRoute("/session/:id/feedback");
  const sessionId = params?.id ? parseInt(params.id) : null;
  const [showTranscript, setShowTranscript] = useState(false);

  const { data: sessionData } = useSession(sessionId);
  const { data: feedback, isLoading: feedbackLoading, error } = useFeedback(sessionId);
  const { data: messages } = useMessages(sessionId);
  const generateFeedback = useGenerateFeedback();

  // Auto-generate if it doesn't exist
  useEffect(() => {
    if (!feedbackLoading && !feedback && sessionId && !generateFeedback.isPending && !error) {
      generateFeedback.mutate(sessionId);
    }
  }, [feedback, feedbackLoading, sessionId, error]);

  // Save to localStorage for analytics
  useEffect(() => {
    if (feedback && sessionData && feedback.evaluationData) {
      const evalData = feedback.evaluationData as EvaluationData;
      const history = JSON.parse(localStorage.getItem("discuss-ai-sessions") || "[]");
      const existing = history.findIndex((h: any) => h.id === sessionData.session.id);
      const sessionRecord = {
        id: sessionData.session.id,
        topicTitle: sessionData.topic?.title || "Unknown",
        difficulty: sessionData.session.difficulty,
        date: new Date().toISOString(),
        overallScore: evalData.overallScore,
        clarity: evalData.clarity?.score,
        confidence: evalData.confidence?.score,
        argumentation: evalData.argumentation?.score,
        leadership: evalData.leadership?.score,
        listening: evalData.listening?.score,
        placementReadiness: evalData.placementReadiness,
      };
      if (existing >= 0) {
        history[existing] = sessionRecord;
      } else {
        history.push(sessionRecord);
      }
      localStorage.setItem("discuss-ai-sessions", JSON.stringify(history));
    }
  }, [feedback, sessionData]);

  const isGenerating = feedbackLoading || generateFeedback.isPending;

  if (isGenerating) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 text-center">
        {/* Loading skeleton */}
        <div className="relative w-24 h-24 mb-8">
          <div className="absolute inset-0 border-4 border-t-primary border-r-primary border-b-transparent border-l-transparent rounded-full animate-spin" />
          <div className="absolute inset-2 border-4 border-t-transparent border-r-transparent border-b-secondary border-l-secondary rounded-full animate-[spin_1.5s_linear_infinite_reverse]" />
          <BrainCircuit className="absolute inset-0 m-auto w-8 h-8 text-primary animate-pulse" />
        </div>
        <h2 className="text-2xl font-display font-bold mb-2">ANALYZING PERFORMANCE</h2>
        <p className="text-muted-foreground max-w-md">
          Our AI coach is evaluating your communication patterns, argument quality, and leadership potential...
        </p>
        {/* Skeleton cards */}
        <div className="mt-8 w-full max-w-3xl grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 rounded-xl bg-muted/20 animate-pulse" />
          ))}
        </div>
        <div className="mt-4 w-full max-w-3xl h-40 rounded-xl bg-muted/20 animate-pulse" />
      </div>
    );
  }

  if (!feedback) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
        <p className="text-red-500 mb-4">Error generating evaluation. Please try again.</p>
        <Link href="/"><CyberButton>Return Home</CyberButton></Link>
      </div>
    );
  }

  const evalData: EvaluationData = (feedback.evaluationData as EvaluationData) || {
    overallScore: Math.round((feedback.communicationScore + feedback.clarityScore + feedback.leadershipScore + feedback.confidenceScore + feedback.argumentScore + feedback.listeningScore) / 6 * 10),
    clarity: { score: feedback.clarityScore * 10, feedback: "", tip: "" },
    confidence: { score: feedback.confidenceScore * 10, feedback: "", tip: "" },
    argumentation: { score: feedback.argumentScore * 10, feedback: "", tip: "" },
    leadership: { score: feedback.leadershipScore * 10, feedback: "", tip: "" },
    listening: { score: feedback.listeningScore * 10, feedback: "", tip: "" },
    topStrengths: ["Good participation"],
    areasToImprove: ["Could improve argumentation"],
    actionPlan: feedback.suggestions as string[] || [],
    placementReadiness: "Developing",
  };

  const overallScore = evalData.overallScore || 70;
  const skills = [
    { name: "Clarity", ...evalData.clarity },
    { name: "Confidence", ...evalData.confidence },
    { name: "Argumentation", ...evalData.argumentation },
    { name: "Leadership", ...evalData.leadership },
    { name: "Listening", ...evalData.listening },
  ];

  const chartData = skills.map((s) => ({
    subject: s.name,
    A: s.score,
    fullMark: 100,
  }));

  const getScoreColor = (score: number) => {
    if (score < 50) return "#ef4444";
    if (score < 75) return "#eab308";
    return "#22c55e";
  };

  const getReadinessColor = (readiness: string) => {
    switch (readiness) {
      case "Not Ready": return "bg-red-500/20 text-red-400 border-red-500/30";
      case "Developing": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "Almost Ready": return "bg-green-500/20 text-green-400 border-green-500/30";
      case "Ready": return "bg-cyan-500/20 text-cyan-400 border-cyan-500/30";
      default: return "bg-muted/20 text-muted-foreground border-border";
    }
  };

  // Radial gauge calculations
  const gaugeRadius = 72;
  const gaugeCircumference = 2 * Math.PI * gaugeRadius;
  const gaugeOffset = gaugeCircumference * (1 - overallScore / 100);

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 overflow-hidden relative">
      <Navbar />
      
      {/* Background elements */}
      <div className="fixed inset-0 pointer-events-none z-[-1]">
        <div className="absolute top-[20%] right-[10%] w-[400px] h-[400px] bg-primary/5 blur-[100px] rounded-full" />
        <div className="absolute bottom-[10%] left-[10%] w-[300px] h-[300px] bg-secondary/5 blur-[100px] rounded-full" />
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4"
        >
          <div>
            <div className="flex items-center gap-2 mb-2">
              <LayoutDashboard className="w-5 h-5 text-primary" />
              <span className="text-xs font-display tracking-widest text-primary uppercase">
                Post-Session Evaluation
              </span>
            </div>
            <h1 className="text-3xl md:text-5xl font-black font-display uppercase tracking-wider">
              Performance{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                Report
              </span>
            </h1>
            {sessionData && (
              <p className="text-muted-foreground mt-2 text-sm">
                Topic: {sessionData.topic.title}
              </p>
            )}
          </div>
          <div className="flex gap-3">
            <Link href="/setup">
              <CyberButton>Start New Session</CyberButton>
            </Link>
          </div>
        </motion.div>

        {/* Placement Readiness Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className={`inline-flex items-center gap-3 px-6 py-3 rounded-xl border text-lg font-display font-bold tracking-wider ${getReadinessColor(evalData.placementReadiness)}`}>
            <Award className="w-6 h-6" />
            PLACEMENT READINESS: {evalData.placementReadiness?.toUpperCase()}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Col: Overall Score + Radar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-1 space-y-6"
          >
            {/* Radial Gauge */}
            <GlassPanel glowingEdge="cyan" className="p-6 flex flex-col items-center">
              <h3 className="font-display font-bold text-sm tracking-wider text-muted-foreground mb-4 uppercase">
                Overall Score
              </h3>
              <div className="relative w-44 h-44 mb-4">
                <svg width="176" height="176" className="transform -rotate-90">
                  <circle
                    cx="88"
                    cy="88"
                    r={gaugeRadius}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="8"
                    className="text-muted/20"
                  />
                  <circle
                    cx="88"
                    cy="88"
                    r={gaugeRadius}
                    fill="none"
                    stroke={getScoreColor(overallScore)}
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={gaugeCircumference}
                    strokeDashoffset={gaugeOffset}
                    className="gauge-animate"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span
                    className="text-5xl font-black font-display"
                    style={{ color: getScoreColor(overallScore) }}
                  >
                    {overallScore}
                  </span>
                  <span className="text-xs text-muted-foreground">/100</span>
                </div>
              </div>
            </GlassPanel>

            {/* Radar Chart */}
            <GlassPanel className="p-4">
              <div className="min-h-[250px] w-full">
                <ResponsiveContainer width="100%" height={250}>
                  <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
                    <PolarGrid stroke="hsl(var(--border))" />
                    <PolarAngleAxis
                      dataKey="subject"
                      tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                    />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                    <Radar
                      name="Score"
                      dataKey="A"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      fill="hsl(var(--primary))"
                      fillOpacity={0.25}
                    />
                    <RechartsTooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </GlassPanel>
          </motion.div>

          {/* Right Col: Details */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-2 space-y-6"
          >
            {/* Skill Bars */}
            <GlassPanel className="p-6">
              <h3 className="font-display font-bold text-sm tracking-wider text-muted-foreground mb-6 uppercase flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Skill Breakdown
              </h3>
              <div className="space-y-5">
                {skills.map((skill, idx) => (
                  <div key={skill.name} className="group relative">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">{skill.name}</span>
                      <span className="text-sm font-display font-bold" style={{ color: getScoreColor(skill.score) }}>
                        {skill.score}/100
                      </span>
                    </div>
                    <div className="w-full h-2.5 bg-muted/30 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full skill-bar-animate"
                        style={{
                          width: `${skill.score}%`,
                          backgroundColor: getScoreColor(skill.score),
                          animationDelay: `${idx * 0.15}s`,
                        }}
                      />
                    </div>
                    {/* Tooltip with feedback */}
                    {skill.feedback && (
                      <div className="mt-2 hidden group-hover:block p-3 bg-card border border-border rounded-lg text-xs text-muted-foreground">
                        <p className="mb-1"><strong>Feedback:</strong> {skill.feedback}</p>
                        {skill.tip && <p><strong>Tip:</strong> {skill.tip}</p>}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </GlassPanel>

            {/* Strengths & Improvements */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <GlassPanel className="p-5">
                <h4 className="font-display font-bold text-sm tracking-wider text-green-400 mb-3 uppercase flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  Top Strengths
                </h4>
                <div className="flex flex-wrap gap-2">
                  {evalData.topStrengths?.map((s, i) => (
                    <span
                      key={i}
                      className="px-3 py-1.5 bg-green-500/10 text-green-400 border border-green-500/20 rounded-full text-xs font-medium"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </GlassPanel>

              <GlassPanel className="p-5">
                <h4 className="font-display font-bold text-sm tracking-wider text-amber-400 mb-3 uppercase flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Areas to Improve
                </h4>
                <div className="flex flex-wrap gap-2">
                  {evalData.areasToImprove?.map((s, i) => (
                    <span
                      key={i}
                      className="px-3 py-1.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-full text-xs font-medium"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </GlassPanel>
            </div>

            {/* 3-Step Action Plan */}
            <GlassPanel glowingEdge="purple" className="p-6">
              <div className="flex items-center gap-3 mb-6 border-b border-border pb-4">
                <Zap className="text-secondary w-5 h-5" />
                <h3 className="font-display font-bold text-lg tracking-wider uppercase">
                  Your 3-Step Action Plan
                </h3>
              </div>
              <div className="space-y-4">
                {evalData.actionPlan?.map((step, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 + i * 0.15 }}
                    className="flex gap-4 items-start p-4 rounded-xl bg-card/50 border border-border hover:border-primary/30 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center shrink-0 font-display font-bold text-secondary text-sm">
                      {i + 1}
                    </div>
                    <p className="text-sm leading-relaxed">{step}</p>
                  </motion.div>
                ))}
              </div>
            </GlassPanel>

            {/* View Transcript */}
            <div className="flex gap-3">
              <CyberButton
                variant="ghost"
                onClick={() => setShowTranscript(!showTranscript)}
              >
                <ChevronRight className={`w-4 h-4 mr-2 transition-transform ${showTranscript ? "rotate-90" : ""}`} />
                {showTranscript ? "Hide" : "View Full"} Transcript
              </CyberButton>
            </div>

            {showTranscript && messages && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
              >
                <GlassPanel className="p-6 max-h-96 overflow-y-auto">
                  <div className="space-y-3">
                    {messages.map((m) => (
                      <div
                        key={m.message.id}
                        className={`text-sm p-3 rounded-lg ${
                          m.participant.isAi
                            ? "bg-muted/10 border-l-2 border-secondary/30"
                            : "bg-primary/5 border-l-2 border-primary/30"
                        }`}
                      >
                        <span className="font-bold text-xs uppercase tracking-wider">
                          {m.participant.name}:
                        </span>{" "}
                        <span className="text-muted-foreground">{m.message.content}</span>
                      </div>
                    ))}
                  </div>
                </GlassPanel>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
