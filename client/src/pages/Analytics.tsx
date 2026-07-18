import { useState, useMemo } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { GlassPanel } from "@/components/GlassPanel";
import { CyberButton } from "@/components/CyberButton";
import {
  TrendingUp, Award, Target, Calendar, Zap, BarChart3
} from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis,
  PolarRadiusAxis, Radar
} from "recharts";

interface SessionRecord {
  id: number;
  topicTitle: string;
  difficulty: string;
  date: string;
  overallScore?: number;
  clarity?: number;
  confidence?: number;
  argumentation?: number;
  leadership?: number;
  listening?: number;
  placementReadiness?: string;
}

export default function Analytics() {
  const sessions: SessionRecord[] = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("discuss-ai-sessions") || "[]");
    } catch {
      return [];
    }
  }, []);

  const scoredSessions = sessions.filter((s) => s.overallScore != null);
  const last5 = scoredSessions.slice(-5);

  const avgScore = scoredSessions.length > 0
    ? Math.round(scoredSessions.reduce((sum, s) => sum + (s.overallScore || 0), 0) / scoredSessions.length)
    : 0;

  const bestScore = scoredSessions.length > 0
    ? Math.max(...scoredSessions.map((s) => s.overallScore || 0))
    : 0;

  // Average skills for radar
  const avgSkills = useMemo(() => {
    if (scoredSessions.length === 0) return [];
    const avg = (key: keyof SessionRecord) => {
      const vals = scoredSessions.filter((s) => s[key] != null).map((s) => s[key] as number);
      return vals.length > 0 ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : 0;
    };
    return [
      { subject: "Clarity", A: avg("clarity"), fullMark: 100 },
      { subject: "Confidence", A: avg("confidence"), fullMark: 100 },
      { subject: "Argumentation", A: avg("argumentation"), fullMark: 100 },
      { subject: "Leadership", A: avg("leadership"), fullMark: 100 },
      { subject: "Listening", A: avg("listening"), fullMark: 100 },
    ];
  }, [scoredSessions]);

  const lineData = last5.map((s, i) => ({
    name: `Session ${i + 1}`,
    score: s.overallScore || 0,
  }));

  const getReadinessColor = (readiness?: string) => {
    switch (readiness) {
      case "Not Ready": return "text-red-400";
      case "Developing": return "text-yellow-400";
      case "Almost Ready": return "text-green-400";
      case "Ready": return "text-cyan-400";
      default: return "text-muted-foreground";
    }
  };

  if (sessions.length === 0) {
    return (
      <div className="min-h-screen pt-16">
        <Navbar />
        <div className="max-w-3xl mx-auto px-4 pt-24 pb-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="w-20 h-20 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center mx-auto">
              <BarChart3 className="w-10 h-10 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-black font-display uppercase tracking-wider mb-3">
                No Sessions <span className="text-primary">Yet</span>
              </h1>
              <p className="text-muted-foreground text-lg max-w-md mx-auto">
                Complete your first GD session to see your analytics and track your improvement over time.
              </p>
            </div>
            <Link href="/setup">
              <CyberButton size="lg">Start Your First Session</CyberButton>
            </Link>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <Navbar />

      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            <span className="text-xs font-display tracking-widest text-primary uppercase">
              Progress Tracking
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black font-display uppercase tracking-wider">
            Your{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
              Analytics
            </span>
          </h1>
        </motion.div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <GlassPanel glowingEdge="cyan" className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <Target className="w-5 h-5 text-primary" />
                <span className="text-xs text-muted-foreground uppercase tracking-wider">Sessions Completed</span>
              </div>
              <p className="text-4xl font-black font-display">{sessions.length}</p>
            </GlassPanel>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <GlassPanel className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="w-5 h-5 text-secondary" />
                <span className="text-xs text-muted-foreground uppercase tracking-wider">Average Score</span>
              </div>
              <p className="text-4xl font-black font-display">{avgScore}<span className="text-lg text-muted-foreground">/100</span></p>
            </GlassPanel>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <GlassPanel glowingEdge="purple" className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <Award className="w-5 h-5 text-green-400" />
                <span className="text-xs text-muted-foreground uppercase tracking-wider">Best Score</span>
              </div>
              <p className="text-4xl font-black font-display text-green-400">{bestScore}<span className="text-lg text-muted-foreground">/100</span></p>
            </GlassPanel>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Line Chart */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
            <GlassPanel className="p-6">
              <h3 className="font-display font-bold text-sm tracking-wider text-muted-foreground mb-4 uppercase">
                Score Progress (Last 5 Sessions)
              </h3>
              {lineData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={lineData}>
                    <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" />
                    <XAxis dataKey="name" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                    <YAxis domain={[0, 100]} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="score"
                      stroke="hsl(var(--primary))"
                      strokeWidth={3}
                      dot={{ fill: "hsl(var(--primary))", r: 5 }}
                      activeDot={{ r: 7 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-muted-foreground text-center py-10">Complete sessions with evaluation to see progress.</p>
              )}
            </GlassPanel>
          </motion.div>

          {/* Radar Chart */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}>
            <GlassPanel className="p-6">
              <h3 className="font-display font-bold text-sm tracking-wider text-muted-foreground mb-4 uppercase">
                Average Skill Profile
              </h3>
              {avgSkills.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <RadarChart cx="50%" cy="50%" outerRadius="70%" data={avgSkills}>
                    <PolarGrid stroke="hsl(var(--border))" />
                    <PolarAngleAxis
                      dataKey="subject"
                      tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                    />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                    <Radar
                      name="Average"
                      dataKey="A"
                      stroke="hsl(var(--secondary))"
                      strokeWidth={2}
                      fill="hsl(var(--secondary))"
                      fillOpacity={0.25}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-muted-foreground text-center py-10">Complete sessions to see skill profile.</p>
              )}
            </GlassPanel>
          </motion.div>
        </div>

        {/* Session History Table */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
          <GlassPanel className="p-6 overflow-x-auto">
            <h3 className="font-display font-bold text-sm tracking-wider text-muted-foreground mb-4 uppercase flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Recent Sessions
            </h3>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-2 text-muted-foreground font-display text-xs tracking-wider uppercase">Date</th>
                  <th className="text-left py-3 px-2 text-muted-foreground font-display text-xs tracking-wider uppercase">Topic</th>
                  <th className="text-center py-3 px-2 text-muted-foreground font-display text-xs tracking-wider uppercase">Score</th>
                  <th className="text-center py-3 px-2 text-muted-foreground font-display text-xs tracking-wider uppercase">Readiness</th>
                </tr>
              </thead>
              <tbody>
                {[...sessions].reverse().slice(0, 10).map((s, i) => (
                  <tr key={i} className="border-b border-border/50 hover:bg-muted/10 transition-colors">
                    <td className="py-3 px-2 text-muted-foreground text-xs">
                      {new Date(s.date).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-2 truncate max-w-[200px]">{s.topicTitle}</td>
                    <td className="py-3 px-2 text-center font-display font-bold">
                      {s.overallScore ?? "—"}
                    </td>
                    <td className={`py-3 px-2 text-center text-xs font-bold ${getReadinessColor(s.placementReadiness)}`}>
                      {s.placementReadiness || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </GlassPanel>
        </motion.div>
      </div>
    </div>
  );
}
