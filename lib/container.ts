import { PrismaClient } from '@prisma/client';
import { BucketService } from './services/bucket-service';
import { TransactionService } from './services/transaction-service';
import { DashboardService } from './services/dashboard-service';

export interface Container {
  prisma: PrismaClient;
  bucketService: BucketService;
  transactionService: TransactionService;
  dashboardService: DashboardService;
}

class DIContainer {
  private _prisma: PrismaClient | null = null;
  private _bucketService: BucketService | null = null;
  private _transactionService: TransactionService | null = null;
  private _dashboardService: DashboardService | null = null;

  get prisma(): PrismaClient {
    if (!this._prisma) {
      this._prisma = new PrismaClient();
    }
    return this._prisma;
  }

  get bucketService(): BucketService {
    if (!this._bucketService) {
      this._bucketService = new BucketService(this.prisma);
    }
    return this._bucketService;
  }

  get transactionService(): TransactionService {
    if (!this._transactionService) {
      this._transactionService = new TransactionService(this.prisma);
    }
    return this._transactionService;
  }

  get dashboardService(): DashboardService {
    if (!this._dashboardService) {
      this._dashboardService = new DashboardService(this.prisma);
    }
    return this._dashboardService;
  }

  async dispose(): Promise<void> {
    if (this._prisma) {
      await this._prisma.$disconnect();
      this._prisma = null;
    }
    this._bucketService = null;
    this._transactionService = null;
    this._dashboardService = null;
  }
}

export function createContainer(): Container {
  const container = new DIContainer();
  return {
    prisma: container.prisma,
    bucketService: container.bucketService,
    transactionService: container.transactionService,
    dashboardService: container.dashboardService,
  };
}

export function createRequestContainer(): Container {
  return createContainer();
}
