import { PrismaClient } from '@prisma/client';

/**
 * Global Prisma Client instance for serverless environments
 * Uses singleton pattern to prevent connection pool exhaustion
 */
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

/**
 * Create or retrieve Prisma Client instance
 * In production (serverless), reuses the same instance across invocations
 * In development, creates new instances per module reload (with HMR)
 */
export function createPrismaClient(): PrismaClient {
  if (!global.prisma) {
    global.prisma = new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
      // Configure connection pool for serverless
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
    });
  }

  return global.prisma;
}

/**
 * Disconnect Prisma Client (useful for cleanup in tests)
 */
export async function disconnectPrisma(): Promise<void> {
  if (global.prisma) {
    await global.prisma.$disconnect();
    global.prisma = undefined;
  }
}
