import { z } from 'zod';
import { insertPrioritySchema, insertTaskSchema, tasks, priorities, userState } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  userState: {
    get: {
      method: 'GET' as const,
      path: '/api/user-state' as const,
      responses: {
        200: z.custom<typeof userState.$inferSelect>(),
      },
    },
    update: {
      method: 'PATCH' as const,
      path: '/api/user-state' as const,
      input: z.object({
        screenTimeMinutes: z.number().optional(),
        hasOnboarded: z.boolean().optional()
      }),
      responses: {
        200: z.custom<typeof userState.$inferSelect>(),
      },
    }
  },
  priorities: {
    list: {
      method: 'GET' as const,
      path: '/api/priorities' as const,
      responses: {
        200: z.array(z.custom<typeof priorities.$inferSelect>()),
      },
    },
    createMany: {
      method: 'POST' as const,
      path: '/api/priorities/bulk' as const,
      input: z.object({
        priorities: z.array(insertPrioritySchema)
      }),
      responses: {
        201: z.array(z.custom<typeof priorities.$inferSelect>()),
      },
    }
  },
  tasks: {
    list: {
      method: 'GET' as const,
      path: '/api/tasks' as const,
      responses: {
        200: z.array(z.custom<typeof tasks.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/tasks' as const,
      input: insertTaskSchema.extend({ parentId: z.number().optional() }),
      responses: {
        201: z.custom<typeof tasks.$inferSelect>(),
      },
    },
    createMany: {
      method: 'POST' as const,
      path: '/api/tasks/bulk' as const,
      input: z.object({
        tasks: z.array(insertTaskSchema.extend({ parentId: z.number().optional() }))
      }),
      responses: {
        201: z.array(z.custom<typeof tasks.$inferSelect>()),
      },
    },
    update: {
      method: 'PATCH' as const,
      path: '/api/tasks/:id' as const,
      input: insertTaskSchema.partial().extend({
        status: z.enum(["pending", "completed"]).optional(),
        nudge: z.string().optional(),
        parentId: z.number().optional(),
        completedAt: z.string().optional(),
      }),
      responses: {
        200: z.custom<typeof tasks.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/tasks/:id' as const,
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    }
  },
  ai: {
    processDump: {
      method: 'POST' as const,
      path: '/api/ai/process-dump' as const,
      input: z.object({
        dumpText: z.string()
      }),
      responses: {
        200: z.object({
          tasks: z.array(z.object({
            content: z.string(),
            tier: z.enum(["focus", "backlog", "icebox"])
          }))
        })
      }
    },
    generateNudge: {
      method: 'POST' as const,
      path: '/api/ai/nudge/:id' as const,
      responses: {
        200: z.object({ nudge: z.string() }),
        404: errorSchemas.notFound
      }
    },
    generateBreakdown: {
      method: 'POST' as const,
      path: '/api/ai/breakdown/:id' as const,
      responses: {
        200: z.object({ steps: z.array(z.string()) }),
        404: errorSchemas.notFound
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

export type TaskUpdateInput = z.infer<typeof api.tasks.update.input>;
