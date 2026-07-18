import { z } from 'zod';
import { 
  insertTopicSchema, 
  insertSessionSchema, 
  insertParticipantSchema, 
  insertMessageSchema, 
  insertFeedbackSchema,
  topics,
  sessions,
  participants,
  messages,
  feedbacks
} from './schema';

export const errorSchemas = {
  validation: z.object({ message: z.string(), field: z.string().optional() }),
  notFound: z.object({ message: z.string() }),
  internal: z.object({ message: z.string() }),
};

export const api = {
  topics: {
    list: {
      method: 'GET' as const,
      path: '/api/topics' as const,
      responses: {
        200: z.array(z.custom<typeof topics.$inferSelect>()),
      }
    },
    create: {
      method: 'POST' as const,
      path: '/api/topics' as const,
      input: insertTopicSchema,
      responses: {
        201: z.custom<typeof topics.$inferSelect>(),
      }
    }
  },
  sessions: {
    create: {
      method: 'POST' as const,
      path: '/api/sessions' as const,
      input: z.object({
        topicId: z.coerce.number(),
        difficulty: z.string(),
        numberOfAi: z.coerce.number()
      }),
      responses: {
        201: z.custom<typeof sessions.$inferSelect>(),
      }
    },
    get: {
      method: 'GET' as const,
      path: '/api/sessions/:id' as const,
      responses: {
        200: z.object({
          session: z.custom<typeof sessions.$inferSelect>(),
          participants: z.array(z.custom<typeof participants.$inferSelect>()),
          topic: z.custom<typeof topics.$inferSelect>(),
        }),
        404: errorSchemas.notFound,
      }
    },
    update: {
      method: 'PATCH' as const,
      path: '/api/sessions/:id' as const,
      input: insertSessionSchema.partial(),
      responses: {
        200: z.custom<typeof sessions.$inferSelect>(),
        404: errorSchemas.notFound,
      }
    }
  },
  messages: {
    list: {
      method: 'GET' as const,
      path: '/api/sessions/:sessionId/messages' as const,
      responses: {
        200: z.array(z.object({
          message: z.custom<typeof messages.$inferSelect>(),
          participant: z.custom<typeof participants.$inferSelect>()
        })),
        404: errorSchemas.notFound,
      }
    },
    create: {
      method: 'POST' as const,
      path: '/api/sessions/:sessionId/messages' as const,
      input: z.object({
        content: z.string(),
        participantId: z.coerce.number()
      }),
      responses: {
        201: z.array(z.object({
          message: z.custom<typeof messages.$inferSelect>(),
          participant: z.custom<typeof participants.$inferSelect>()
        })),
        404: errorSchemas.notFound,
      }
    }
  },
  feedback: {
    get: {
      method: 'GET' as const,
      path: '/api/sessions/:sessionId/feedback' as const,
      responses: {
        200: z.custom<typeof feedbacks.$inferSelect>(),
        404: errorSchemas.notFound,
      }
    },
    generate: {
      method: 'POST' as const,
      path: '/api/sessions/:sessionId/feedback/generate' as const,
      responses: {
        200: z.custom<typeof feedbacks.$inferSelect>(),
        404: errorSchemas.notFound,
      }
    }
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
