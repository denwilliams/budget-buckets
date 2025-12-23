import { PrismaClient } from '@prisma/client';

export interface Container {
  prisma: PrismaClient;
}

class DIContainer {
  private _prisma: PrismaClient | null = null;

  get prisma(): PrismaClient {
    if (!this._prisma) {
      this._prisma = new PrismaClient();
    }
    return this._prisma;
  }

  async dispose(): Promise<void> {
    if (this._prisma) {
      await this._prisma.$disconnect();
      this._prisma = null;
    }
  }
}

export function createContainer(): Container {
  const container = new DIContainer();
  return {
    prisma: container.prisma,
  };
}

export function createRequestContainer(): Container {
  return createContainer();
}
