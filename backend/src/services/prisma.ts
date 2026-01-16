import { PrismaClient } from '@prisma/client';

// Evita múltiplas instâncias em desenvolvimento
const globalForPrisma = global as unknown as { prisma: ReturnType<typeof createPrismaClient> };

const createPrismaClient = () => {
  return new PrismaClient().$extends({
    result: {
      ticket: {
        summary: {
          needs: { summary: true },
          compute(ticket) {
            if (!ticket.summary) return null;
            try {
              return JSON.parse(ticket.summary as string);
            } catch {
              return ticket.summary;
            }
          },
        },
      },
    },
  });
};

export const prisma = globalForPrisma.prisma || createPrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;