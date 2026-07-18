import { pgTable, serial, integer, text, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Topics table
export const topics = pgTable("topics", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  category: text("category").notNull(),
});

// Sessions table
export const sessions = pgTable("sessions", {
  id: serial("id").primaryKey(),
  topicId: integer("topic_id").references(() => topics.id),
  status: text("status").notNull().default("setup"), // setup, live, completed
  difficulty: text("difficulty").notNull().default("medium"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Participants table
export const participants = pgTable("participants", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id").references(() => sessions.id).notNull(),
  name: text("name").notNull(),
  isAi: boolean("is_ai").notNull(),
  personality: text("personality"), // e.g. Logical Thinker
  avatar: text("avatar"),
});

// Messages table
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id").references(() => sessions.id).notNull(),
  participantId: integer("participant_id").references(() => participants.id).notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Feedbacks table
export const feedbacks = pgTable("feedbacks", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id").references(() => sessions.id).notNull(),
  communicationScore: integer("communication_score").notNull(),
  clarityScore: integer("clarity_score").notNull(),
  leadershipScore: integer("leadership_score").notNull(),
  confidenceScore: integer("confidence_score").notNull(),
  argumentScore: integer("argument_score").notNull(),
  listeningScore: integer("listening_score").notNull(),
  suggestions: jsonb("suggestions").notNull(), // array of strings
  evaluationData: jsonb("evaluation_data"), // rich structured evaluation JSON
});

// Zod schemas
export const insertTopicSchema = createInsertSchema(topics).omit({ id: true });
export const insertSessionSchema = createInsertSchema(sessions).omit({ id: true, createdAt: true });
export const insertParticipantSchema = createInsertSchema(participants).omit({ id: true });
export const insertMessageSchema = createInsertSchema(messages).omit({ id: true, createdAt: true });
export const insertFeedbackSchema = createInsertSchema(feedbacks).omit({ id: true });

// Types
export type Topic = typeof topics.$inferSelect;
export type InsertTopic = z.infer<typeof insertTopicSchema>;

export type Session = typeof sessions.$inferSelect;
export type InsertSession = z.infer<typeof insertSessionSchema>;
export type UpdateSessionRequest = Partial<InsertSession>;

export type Participant = typeof participants.$inferSelect;
export type InsertParticipant = z.infer<typeof insertParticipantSchema>;

export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;

export type Feedback = typeof feedbacks.$inferSelect;
export type InsertFeedback = z.infer<typeof insertFeedbackSchema>;

export type CreateSessionRequest = {
  topicId: number;
  difficulty: string;
  numberOfAi: number;
};
