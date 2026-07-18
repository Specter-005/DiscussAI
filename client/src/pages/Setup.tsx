import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { GlassPanel } from "@/components/GlassPanel";
import { CyberButton } from "@/components/CyberButton";
import { useTopics } from "@/hooks/use-topics";
import { useCreateSession } from "@/hooks/use-sessions";
import { useCreateTopic } from "@/hooks/use-create-topic";
import { useToast } from "@/hooks/use-toast";
import {
  Database, Activity, Users, ChevronRight, Plus, X, Search, Info, Tag
} from "lucide-react";

const DIFFICULTY_INFO: Record<string, string> = {
  easy: "5-min session, 8 speaking turns. Ideal for beginners and building confidence.",
  medium: "8-min session, 6 speaking turns. Moderate challenge for placement practice.",
  hard: "12-min session, 4 speaking turns. Intense simulation mimicking real GD rounds.",
};

export default function Setup() {
  const [, setLocation] = useLocation();
  const { data: topics, isLoading: topicsLoading } = useTopics();
  const createSession = useCreateSession();
  const createTopic = useCreateTopic();
  const { toast } = useToast();

  const [selectedTopic, setSelectedTopic] = useState<number | null>(null);
  const [difficulty, setDifficulty] = useState("medium");
  const [aiCount, setAiCount] = useState(3);
  const [showCreateTopic, setShowCreateTopic] = useState(false);
  const [newTopicTitle, setNewTopicTitle] = useState("");
  const [newTopicCategory, setNewTopicCategory] = useState("Technology");
  const [searchQuery, setSearchQuery] = useState("");
  const [hoveredDifficulty, setHoveredDifficulty] = useState<string | null>(null);

  // Custom topics from localStorage
  const customTopics = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("discuss-ai-custom-topics") || "[]");
    } catch {
      return [];
    }
  }, []);

  // Filter topics
  const filteredTopics = useMemo(() => {
    const allTopics = topics || [];
    if (!searchQuery.trim()) return allTopics;
    const q = searchQuery.toLowerCase();
    return allTopics.filter(
      (t) => t.title.toLowerCase().includes(q) || t.category.toLowerCase().includes(q)
    );
  }, [topics, searchQuery]);

  const handleCreateTopic = async () => {
    if (!newTopicTitle.trim()) return;
    try {
      // Save to both server and localStorage
      const created = await createTopic.mutateAsync({
        title: newTopicTitle,
        category: newTopicCategory,
      });
      // Mark as custom in localStorage
      const customs = JSON.parse(localStorage.getItem("discuss-ai-custom-topics") || "[]");
      customs.push(created.id);
      localStorage.setItem("discuss-ai-custom-topics", JSON.stringify(customs));
      setNewTopicTitle("");
      setShowCreateTopic(false);
      toast({ title: "Topic created!", description: "Your custom topic is ready." });
    } catch (error) {
      toast({ title: "Error", description: "Failed to create topic.", variant: "destructive" });
    }
  };

  const handleStart = async () => {
    if (!selectedTopic) return;
    try {
      const session = await createSession.mutateAsync({
        topicId: selectedTopic,
        difficulty,
        numberOfAi: aiCount,
      });
      setLocation(`/session/${session.id}`);
    } catch (error) {
      toast({ title: "Error", description: "Failed to create session.", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <Navbar />
      
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-black font-display uppercase tracking-widest mb-2">
            Configure <span className="text-primary">Parameters</span>
          </h1>
          <p className="text-muted-foreground">Set up the variables for your next simulation.</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Col: Main Settings */}
          <div className="lg:col-span-2 space-y-6">
            <GlassPanel glowingEdge="cyan" className="p-6 md:p-8">
              <div className="flex items-center justify-between gap-3 mb-4 border-b border-border pb-4">
                <div className="flex items-center gap-3">
                  <Database className="text-primary w-5 h-5" />
                  <h2 className="text-xl font-bold font-display tracking-wider">SELECT TOPIC</h2>
                </div>
                <button
                  onClick={() => setShowCreateTopic(!showCreateTopic)}
                  className="p-2 bg-primary/20 text-primary hover:bg-primary hover:text-primary-foreground rounded-lg transition-colors"
                  title="Create Custom Topic"
                >
                  {showCreateTopic ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                </button>
              </div>

              {/* Search Bar */}
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search topics..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-muted/20 border border-border text-foreground placeholder:text-muted-foreground rounded-lg py-2.5 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              <AnimatePresence>
                {showCreateTopic && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-4 p-4 bg-card border border-primary/30 rounded-lg space-y-3"
                  >
                    <input
                      type="text"
                      placeholder="Topic title..."
                      value={newTopicTitle}
                      onChange={(e) => setNewTopicTitle(e.target.value)}
                      className="w-full bg-muted/20 border border-border text-foreground placeholder:text-muted-foreground rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                    <select
                      value={newTopicCategory}
                      onChange={(e) => setNewTopicCategory(e.target.value)}
                      className="w-full bg-muted/20 border border-border text-foreground rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary/50"
                    >
                      {["Technology", "Business", "Social Issues", "Environment", "Science", "Economics", "Health", "Education", "Ethics", "Politics", "Sports"].map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                    <CyberButton
                      size="sm"
                      className="w-full"
                      disabled={!newTopicTitle.trim() || createTopic.isPending}
                      isLoading={createTopic.isPending}
                      onClick={handleCreateTopic}
                    >
                      CREATE TOPIC
                    </CyberButton>
                  </motion.div>
                )}
              </AnimatePresence>
              
              {topicsLoading ? (
                <div className="animate-pulse space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-16 bg-muted/20 rounded-lg" />
                  ))}
                </div>
              ) : (
                <div className="grid gap-3 max-h-96 overflow-y-auto scrollbar-hide">
                  {filteredTopics?.map((topic) => {
                    const isCustom = customTopics.includes(topic.id);
                    return (
                      <button
                        key={topic.id}
                        onClick={() => setSelectedTopic(topic.id)}
                        className={`
                          text-left p-4 rounded-xl border transition-all duration-200
                          ${selectedTopic === topic.id
                            ? "bg-primary/10 border-primary neon-border-cyan shadow-lg"
                            : "bg-card/50 border-border hover:border-primary/20 hover:bg-muted/20"}
                        `}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-semibold">{topic.title}</p>
                              {isCustom && (
                                <span className="px-2 py-0.5 bg-secondary/20 text-secondary text-[10px] font-bold rounded-full uppercase tracking-wider">
                                  Custom
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1 uppercase tracking-wider flex items-center gap-1">
                              <Tag className="w-3 h-3" />
                              {topic.category}
                            </p>
                          </div>
                          {selectedTopic === topic.id && <ChevronRight className="text-primary w-5 h-5" />}
                        </div>
                      </button>
                    );
                  })}
                  {filteredTopics?.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">No topics match your search.</p>
                  )}
                </div>
              )}
            </GlassPanel>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <GlassPanel glowingEdge="purple" className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <Activity className="text-secondary w-5 h-5" />
                  <h2 className="text-lg font-bold font-display tracking-wider">INTENSITY</h2>
                </div>
                <div className="flex flex-col gap-3">
                  {(["easy", "medium", "hard"] as const).map((lvl) => (
                    <div key={lvl} className="relative">
                      <button
                        onClick={() => setDifficulty(lvl)}
                        onMouseEnter={() => setHoveredDifficulty(lvl)}
                        onMouseLeave={() => setHoveredDifficulty(null)}
                        className={`
                          w-full py-3 px-4 rounded-lg text-sm font-bold uppercase tracking-wider transition-all flex items-center justify-between
                          ${difficulty === lvl
                            ? "bg-secondary text-white shadow-[0_0_15px_rgba(176,38,255,0.3)]"
                            : "bg-muted/20 text-muted-foreground hover:bg-muted/30"}
                        `}
                      >
                        {lvl}
                        <Info className="w-3.5 h-3.5 opacity-50" />
                      </button>
                      {/* Difficulty tooltip */}
                      <AnimatePresence>
                        {hoveredDifficulty === lvl && (
                          <motion.div
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -5 }}
                            className="absolute left-0 right-0 top-full mt-1 z-20 p-2 bg-card border border-border rounded-lg text-xs text-muted-foreground shadow-lg"
                          >
                            {DIFFICULTY_INFO[lvl]}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </div>
              </GlassPanel>

              <GlassPanel className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <Users className="w-5 h-5" />
                  <h2 className="text-lg font-bold font-display tracking-wider">ENTITIES</h2>
                </div>
                <div className="flex flex-col items-center justify-center py-4">
                  <div className="text-5xl font-black font-display mb-4">
                    {aiCount}
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={aiCount}
                    onChange={(e) => setAiCount(parseInt(e.target.value))}
                    className="w-full accent-primary"
                  />
                  <p className="text-xs text-muted-foreground mt-4 text-center">
                    Number of AI personas in the simulation
                  </p>
                </div>
              </GlassPanel>
            </div>
          </div>

          {/* Right Col: Summary & Action */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <GlassPanel className="p-6 flex flex-col h-[400px]">
                <h3 className="text-xl font-bold font-display mb-6 border-b border-border pb-4">
                  SIMULATION BRIEF
                </h3>
                
                <div className="space-y-4 flex-grow text-sm">
                  <div>
                    <p className="text-muted-foreground text-xs uppercase tracking-wider mb-1">Target Subject</p>
                    <p className="font-medium">
                      {selectedTopic ? topics?.find((t) => t.id === selectedTopic)?.title : "Awaiting selection..."}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs uppercase tracking-wider mb-1">Difficulty Level</p>
                    <p className={`font-bold uppercase ${
                      difficulty === "easy" ? "text-green-400" :
                      difficulty === "medium" ? "text-yellow-400" : "text-red-400"
                    }`}>
                      {difficulty}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs uppercase tracking-wider mb-1">Active Nodes</p>
                    <p className="font-medium">{aiCount} AI Personalities + You</p>
                  </div>
                </div>

                <div className="mt-auto pt-6">
                  <CyberButton
                    className="w-full"
                    disabled={!selectedTopic || createSession.isPending}
                    isLoading={createSession.isPending}
                    onClick={handleStart}
                  >
                    INITIATE SEQUENCE
                  </CyberButton>
                </div>
              </GlassPanel>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
