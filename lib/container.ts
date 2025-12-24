import { PrismaClient } from '@prisma/client';
import { BucketService } from './services/bucket-service';
import { TransactionService } from './services/transaction-service';
import { DashboardService } from './services/dashboard-service';
import { StatementService } from './services/statement-service';

export interface Container {
  prisma: PrismaClient;
  bucketService: BucketService;
  transactionService: TransactionService;
  dashboardService: DashboardService;
  statementService: StatementService;
}

class DIContainer {
  private _prisma: PrismaClient | null = null;
  private _bucketService: BucketService | null = null;
  private _transactionService: TransactionService | null = null;
  private _dashboardService: DashboardService | null = null;
  private _statementService: StatementService | null = null;

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

  get statementService(): StatementService {
    if (!this._statementService) {
      this._statementService = new StatementService(this.prisma);
    }
    return this._statementService;
  }

  async dispose(): Promise<void> {
    if (this._prisma) {
      await this._prisma.$disconnect();
      this._prisma = null;
    }
    this._bucketService = null;
    this._transactionService = null;
    this._dashboardService = null;
    this._statementService = null;
  }
}

export function createContainer(): Container {
  const container = new DIContainer();
  return {
    prisma: container.prisma,
    bucketService: container.bucketService,
    transactionService: container.transactionService,
    dashboardService: container.dashboardService,
    statementService: container.statementService,
  };
}

export function createRequestContainer(): Container {
  return createContainer();
}
