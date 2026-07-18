import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import Anthropic from "@anthropic-ai/sdk";
import express from "express";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || "",
});

// Detailed persona system prompts
const PERSONA_PROMPTS: Record<string, string> = {
  "Logical Thinker": `You are Alex, a methodical and analytical thinker in a group discussion. You break down arguments into logical components and evaluate them step by step. You say things like "Let's think about this systematically," "The logical conclusion here is...", "If we follow that reasoning..." You use contractions naturally ("I'd argue," "it's clear that"). You occasionally disagree respectfully with "I see your point, but the logic doesn't hold because...". You respond in 2-4 sentences max. Never reveal you are an AI. React specifically to what was said before you.`,

  "Data Analyst": `You are Jordan, someone who backs up every claim with data, statistics, or real-world examples. You get excited about numbers and trends. You say things like "Actually, studies show that..." "The data suggests otherwise," "Look at the numbers—" and "If you look at the trend over the last decade..." You use casual language with contractions ("it's," "that's," "we're"). You sometimes challenge vague claims by asking for evidence. You respond in 2-4 sentences max. Never reveal you are an AI. React specifically to what was said before you.`,

  "Aggressive Debater": `You are Casey, a passionate and blunt debater in a group discussion. You interrupt ideas you disagree with, speak in short punchy sentences, use phrases like "That's simply wrong," "Let me be direct," "With all due respect, no." "Honestly, that argument doesn't hold up." You occasionally build on others' points but always add a challenging spin. You're confrontational but not rude—you push back hard on weak arguments. You respond in 2-4 sentences max. Never reveal you are an AI. React specifically to what was said before you.`,

  "The Visionary": `You are Morgan, a big-picture thinker who always connects ideas to broader trends and future possibilities. You say things like "Imagine if we scaled this up—" "The bigger picture here is..." "Right, but think about where this leads in ten years." "This could reshape how we think about..." You're enthusiastic and optimistic but grounded. You use casual speech ("I'd say," "Look,"). You respond in 2-4 sentences max. Never reveal you are an AI. React specifically to what was said before you.`,

  "The Skeptic": `You are Riley, a critical thinker who questions assumptions and plays devil's advocate. You say things like "Hold on, are we sure about that?" "I'm not convinced—" "Everyone's assuming X, but what if Y?" "That sounds good in theory, but in practice..." You're not negative—you're thoughtfully contrarian. You force the group to defend their positions. You use natural speech patterns ("Honestly," "I mean,"). You respond in 2-4 sentences max. Never reveal you are an AI. React specifically to what was said before you.`,
};

async function seedDatabase() {
  const topicsList = await storage.getTopics();
  if (topicsList.length === 0) {
    const topics = [
      { title: "Is AI replacing human creativity?", category: "Technology" },
      { title: "Should social media be regulated?", category: "Social Issues" },
      { title: "Remote work vs office culture", category: "Business" },
      { title: "Is cryptocurrency the future of finance?", category: "Technology" },
      { title: "Climate change: individual action vs systemic policy", category: "Environment" },
      { title: "The ethics of genetic engineering", category: "Science" },
      { title: "Universal basic income: pros and cons", category: "Economics" },
      { title: "Mental health in the digital age", category: "Health" },
      { title: "Should there be a limit on personal wealth?", category: "Ethics" },
      { title: "The future of work: automation and employment", category: "Business" },
      { title: "Are we too dependent on technology?", category: "Technology" },
      { title: "The role of government in education", category: "Education" },
      { title: "Should space exploration be prioritized over earthly problems?", category: "Science" },
      { title: "The impact of social media on democracy", category: "Politics" },
      { title: "Is traditional education obsolete?", category: "Education" },
      // 10 additional diverse topics
      { title: "Should voting be made mandatory?",  category: "Politics" },
      { title: "Is cancel culture beneficial or harmful?", category: "Social Issues" },
      { title: "Should performance-enhancing drugs be legalized in sports?", category: "Sports" },
      { title: "Nuclear energy: savior or threat?", category: "Environment" },
      { title: "Is privacy a fundamental right in the digital era?", category: "Ethics" },
      { title: "Should college education be free for everyone?", category: "Education" },
      { title: "Electric vehicles: hype or revolution?", category: "Technology" },
      { title: "Does media play a fair role in elections?", category: "Politics" },
      { title: "Should euthanasia be legalized globally?", category: "Ethics" },
      { title: "Is the Indian Premier League good for cricket?", category: "Sports" },
    ];
    for (const topic of topics) {
      await storage.createTopic(topic);
    }
    console.log("Database seeded with topics.");
  }
}

export async function registerRoutes(httpServer: Server, app: Express): Promise<Server> {
  // Body parser with larger limit for audio
  app.use(express.json({ limit: "50mb" }));
  
  // Seed database
  seedDatabase().catch(console.error);

  // Topics
  app.get(api.topics.list.path, async (req, res) => {
    try {
      const topicsList = await storage.getTopics();
      res.json(topicsList);
    } catch (err) {
      console.error("Error fetching topics:", err);
      res.status(500).json({ message: "Failed to fetch topics" });
    }
  });

  app.post(api.topics.create.path, async (req, res) => {
    try {
      const input = api.topics.create.input.parse(req.body);
      const topic = await storage.createTopic(input);
      res.status(201).json(topic);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message, field: err.errors[0].path.join('.') });
      }
      console.error("Error creating topic:", err);
      res.status(500).json({ message: "Failed to create topic" });
    }
  });

  // Sessions
  app.post(api.sessions.create.path, async (req, res) => {
    try {
      const input = api.sessions.create.input.parse(req.body);
      const session = await storage.createSession({
        topicId: input.topicId,
        difficulty: input.difficulty,
        status: "setup"
      });

      // Create user participant
      await storage.createParticipant({
        sessionId: session.id,
        name: "You",
        isAi: false
      });

      // Create AI participants with human-like personas
      const aiProfiles = [
        { name: "Alex", personality: "Logical Thinker", avatar: "🧠" },
        { name: "Jordan", personality: "Data Analyst", avatar: "📊" },
        { name: "Casey", personality: "Aggressive Debater", avatar: "⚡" },
        { name: "Morgan", personality: "The Visionary", avatar: "🔮" },
        { name: "Riley", personality: "The Skeptic", avatar: "🎯" }
      ];
      const numAi = Math.min(Math.max(input.numberOfAi, 1), 5);
      
      for (let i = 0; i < numAi; i++) {
        await storage.createParticipant({
          sessionId: session.id,
          name: aiProfiles[i].name,
          isAi: true,
          personality: aiProfiles[i].personality,
          avatar: aiProfiles[i].avatar
        });
      }

      res.status(201).json(session);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message, field: err.errors[0].path.join('.') });
      }
      console.error("Error creating session:", err);
      res.status(500).json({ message: "Failed to create session" });
    }
  });

  app.get(api.sessions.get.path, async (req, res) => {
    try {
      const session = await storage.getSession(Number(req.params.id));
      if (!session) return res.status(404).json({ message: "Session not found" });
      
      const participants = await storage.getParticipantsBySession(session.id);
      const topicsList = await storage.getTopics();
      const topic = topicsList.find(t => t.id === session.topicId);
      
      res.json({ session, participants, topic });
    } catch (err) {
      console.error("Error fetching session:", err);
      res.status(500).json({ message: "Failed to fetch session" });
    }
  });

  app.patch(api.sessions.update.path, async (req, res) => {
    try {
      const session = await storage.updateSession(Number(req.params.id), req.body);
      res.json(session);
    } catch (err) {
      console.error("Error updating session:", err);
      res.status(500).json({ message: "Failed to update session" });
    }
  });

  // Messages
  app.get(api.messages.list.path, async (req, res) => {
    try {
      const sessionId = Number(req.params.sessionId);
      const messages = await storage.getMessagesBySession(sessionId);
      const participants = await storage.getParticipantsBySession(sessionId);
      
      const result = messages.map(m => ({
        message: m,
        participant: participants.find(p => p.id === m.participantId)!
      }));
      
      res.json(result);
    } catch (err) {
      console.error("Error fetching messages:", err);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  app.post(api.messages.create.path, async (req, res) => {
    try {
      const sessionId = Number(req.params.sessionId);
      const input = api.messages.create.input.parse(req.body);
      
      // Save user message
      const msg = await storage.createMessage({
        sessionId,
        participantId: input.participantId,
        content: input.content
      });

      const participants = await storage.getParticipantsBySession(sessionId);
      const sender = participants.find(p => p.id === msg.participantId);
      
      const newMessages = [{ message: msg, participant: sender }];

      // Multiple AI responses
      const aiParticipants = participants.filter(p => p.isAi);
      if (aiParticipants.length > 0 && sender && !sender.isAi) {
        const allMsgs = await storage.getMessagesBySession(sessionId);
        const topicsList = await storage.getTopics();
        const currentSession = await storage.getSession(sessionId);
        const topicTitle = topicsList.find(t => t.id === currentSession?.topicId)?.title || "this topic";
        
        // Build conversation history for Claude format
        const conversationText = allMsgs.map(m => {
          const p = participants.find(x => x.id === m.participantId);
          return `${p?.name}: ${m.content}`;
        }).join('\n');
        
        // Select 1-2 random AIs to respond
        const numResponders = Math.min(1 + Math.floor(Math.random() * 2), aiParticipants.length);
        const shuffled = [...aiParticipants].sort(() => Math.random() - 0.5);
        const responders = shuffled.slice(0, numResponders);
        
        for (let i = 0; i < responders.length; i++) {
          const ai = responders[i];
          try {
            const systemPrompt = PERSONA_PROMPTS[ai.personality] || 
              `You're ${ai.name}, chatting naturally about "${topicTitle}". Keep it conversational and brief (2-4 sentences). Sound like a real person, not an AI.`;

            // For second responder, include context about the first AI's response
            let contextNote = "";
            if (i > 0 && newMessages.length > 1) {
              const prevAi = newMessages[newMessages.length - 1];
              if (prevAi?.participant?.isAi) {
                contextNote = `\n\nIMPORTANT: ${prevAi.participant.name} just said: "${prevAi.message.content}". You should react to both the user AND ${prevAi.participant.name}'s point. Agree, disagree, or build on it.`;
              }
            }

            const response = await anthropic.messages.create({
              model: "claude-sonnet-4-20250514",
              max_tokens: 300,
              system: systemPrompt + contextNote + `\n\nThe discussion topic is: "${topicTitle}". Here is the conversation so far:\n${conversationText}`,
              messages: [
                {
                  role: "user",
                  content: `Continue the discussion as ${ai.name}. Respond naturally to what was just said. Do NOT prefix your response with your name.`
                }
              ],
            });

            const aiText = response.content[0]?.type === "text" 
              ? response.content[0].text 
              : "I think that's an interesting perspective.";
            
            // Clean any name prefix the model might add
            const cleanText = aiText.replace(new RegExp(`^${ai.name}:\\s*`, 'i'), '');
            
            const aiMsg = await storage.createMessage({
              sessionId,
              participantId: ai.id,
              content: cleanText
            });
            newMessages.push({ message: aiMsg, participant: ai });
          } catch (err) {
            console.error(`Anthropic API error for ${ai.name}:`, err);
          }
        }
      }

      res.status(201).json(newMessages);
    } catch (err) {
      console.error("Error creating message:", err);
      res.status(500).json({ message: "Failed to send message. Please try again." });
    }
  });

  // Feedback
  app.get(api.feedback.get.path, async (req, res) => {
    try {
      const feedback = await storage.getFeedbackBySession(Number(req.params.sessionId));
      if (!feedback) return res.status(404).json({ message: "Not found" });
      res.json(feedback);
    } catch (err) {
      console.error("Error fetching feedback:", err);
      res.status(500).json({ message: "Failed to fetch feedback" });
    }
  });

  app.post(api.feedback.generate.path, async (req, res) => {
    const sessionId = Number(req.params.sessionId);
    
    try {
      const messages = await storage.getMessagesBySession(sessionId);
      const participants = await storage.getParticipantsBySession(sessionId);
      
      const transcript = messages.map(m => {
        const p = participants.find(x => x.id === m.participantId);
        return `${p?.name}${p?.isAi ? " (AI)" : " (Student)"}: ${m.content}`;
      }).join('\n');

      const userMessages = messages.filter(m => {
        const p = participants.find(x => x.id === m.participantId);
        return p && !p.isAi;
      });

      const response = await anthropic.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1500,
        system: `You are an expert communication coach evaluating a student's performance in a group discussion (GD) for placement preparation. The student is labeled "You (Student)" in the transcript. Analyze their contributions carefully.

Return ONLY a valid JSON object with these exact keys:
{
  "overallScore": <number 0-100>,
  "clarity": { "score": <number 0-100>, "feedback": "<specific feedback>", "tip": "<actionable tip>" },
  "confidence": { "score": <number 0-100>, "feedback": "<specific feedback>", "tip": "<actionable tip>" },
  "argumentation": { "score": <number 0-100>, "feedback": "<specific feedback>", "tip": "<actionable tip>" },
  "leadership": { "score": <number 0-100>, "feedback": "<specific feedback>", "tip": "<actionable tip>" },
  "listening": { "score": <number 0-100>, "feedback": "<specific feedback>", "tip": "<actionable tip>" },
  "topStrengths": ["<strength1>", "<strength2>"],
  "areasToImprove": ["<area1>", "<area2>"],
  "actionPlan": ["<step1>", "<step2>", "<step3>"],
  "placementReadiness": "<one of: Not Ready | Developing | Almost Ready | Ready>"
}

Be honest but encouraging. Base scores on: frequency of participation, quality of arguments, response to others' points, confidence in delivery, and leadership initiative.`,
        messages: [
          {
            role: "user",
            content: `Here is the full GD transcript. The student spoke ${userMessages.length} times out of ${messages.length} total messages.\n\n${transcript}`
          }
        ],
      });

      const responseText = response.content[0]?.type === "text" ? response.content[0].text : "{}";
      
      // Extract JSON from response (handle markdown code blocks)
      let jsonStr = responseText;
      const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonMatch) jsonStr = jsonMatch[1];
      
      const parsed = JSON.parse(jsonStr.trim());
      
      const feedback = await storage.createFeedback({
        sessionId,
        communicationScore: Math.round((parsed.overallScore || 70) / 10),
        clarityScore: Math.round((parsed.clarity?.score || 70) / 10),
        leadershipScore: Math.round((parsed.leadership?.score || 50) / 10),
        confidenceScore: Math.round((parsed.confidence?.score || 60) / 10),
        argumentScore: Math.round((parsed.argumentation?.score || 70) / 10),
        listeningScore: Math.round((parsed.listening?.score || 80) / 10),
        suggestions: parsed.actionPlan || ["Participate more frequently", "Try to summarize points"],
        evaluationData: parsed,
      });
      
      res.json(feedback);
    } catch (err) {
      console.error("Error generating feedback:", err);
      res.status(500).json({ message: "Failed to generate evaluation. Please try again." });
    }
  });

  return httpServer;
}
