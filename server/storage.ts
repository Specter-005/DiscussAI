import { db } from "./db";
import { 
  topics, sessions, participants, messages, feedbacks,
  type Topic, type InsertTopic,
  type Session, type InsertSession,
  type Participant, type InsertParticipant,
  type Message, type InsertMessage,
  type Feedback, type InsertFeedback
} from "@shared/schema";
import { eq, asc } from "drizzle-orm";

export interface IStorage {
  getTopics(): Promise<Topic[]>;
  createTopic(topic: InsertTopic): Promise<Topic>;
  
  createSession(session: InsertSession): Promise<Session>;
  getSession(id: number): Promise<Session | undefined>;
  updateSession(id: number, session: Partial<InsertSession>): Promise<Session>;
  
  createParticipant(participant: InsertParticipant): Promise<Participant>;
  getParticipantsBySession(sessionId: number): Promise<Participant[]>;
  
  createMessage(msg: InsertMessage): Promise<Message>;
  getMessagesBySession(sessionId: number): Promise<Message[]>;
  
  createFeedback(feedback: InsertFeedback): Promise<Feedback>;
  getFeedbackBySession(sessionId: number): Promise<Feedback | undefined>;
}

export class DatabaseStorage implements IStorage {
  async getTopics() { return await db.select().from(topics); }
  async createTopic(t: InsertTopic) { const [res] = await db.insert(topics).values(t).returning(); return res; }
  
  async createSession(s: InsertSession) { const [res] = await db.insert(sessions).values(s).returning(); return res; }
  async getSession(id: number) { const [res] = await db.select().from(sessions).where(eq(sessions.id, id)); return res; }
  async updateSession(id: number, s: Partial<InsertSession>) { const [res] = await db.update(sessions).set(s).where(eq(sessions.id, id)).returning(); return res; }
  
  async createParticipant(p: InsertParticipant) { const [res] = await db.insert(participants).values(p).returning(); return res; }
  async getParticipantsBySession(sessionId: number) { return await db.select().from(participants).where(eq(participants.sessionId, sessionId)); }
  
  async createMessage(m: InsertMessage) { const [res] = await db.insert(messages).values(m).returning(); return res; }
  async getMessagesBySession(sessionId: number) { return await db.select().from(messages).where(eq(messages.sessionId, sessionId)).orderBy(asc(messages.createdAt)); }
  
  async createFeedback(f: InsertFeedback) { const [res] = await db.insert(feedbacks).values(f).returning(); return res; }
  async getFeedbackBySession(sessionId: number) { const [res] = await db.select().from(feedbacks).where(eq(feedbacks.sessionId, sessionId)); return res; }
}

export const storage = new DatabaseStorage();
