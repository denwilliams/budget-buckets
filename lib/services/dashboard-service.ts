import { PrismaClient } from '@prisma/client';
import { DashboardBucket, BucketWithTransactions } from '../types';

export class DashboardService {
  constructor(private prisma: PrismaClient) {}

  async getDashboardData(): Promise<DashboardBucket[]> {
    const buckets = await this.prisma.bucket.findMany({
      include: {
        transactions: true,
      },
    });

    return buckets.map((bucket) => this.calculateBucketStatus(bucket));
  }

  private calculateBucketStatus(bucket: BucketWithTransactions): DashboardBucket {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    const { startOfPeriod, endOfPeriod } = this.getPeriodDates(
      bucket.period,
      currentYear,
      currentMonth
    );

    const periodTransactions = bucket.transactions.filter((t) => {
      const transactionDate = new Date(t.date);
      return transactionDate >= startOfPeriod && transactionDate <= endOfPeriod;
    });

    const totalSpent = periodTransactions.reduce((sum, t) => sum + t.amount, 0);
    const percentageFull = (totalSpent / bucket.size) * 100;

    const { percentageOfTimeElapsed } = this.calculateTimeElapsed(
      startOfPeriod,
      endOfPeriod,
      now
    );

    const status = this.determineStatus(percentageFull, percentageOfTimeElapsed);

    return {
      id: bucket.id,
      name: bucket.name,
      size: bucket.size,
      period: bucket.period,
      totalSpent,
      percentageFull,
      percentageOfTimeElapsed,
      status,
      transactionCount: periodTransactions.length,
    };
  }

  private getPeriodDates(
    period: string,
    currentYear: number,
    currentMonth: number
  ): { startOfPeriod: Date; endOfPeriod: Date } {
    if (period === 'monthly') {
      return {
        startOfPeriod: new Date(currentYear, currentMonth, 1),
        endOfPeriod: new Date(currentYear, currentMonth + 1, 0),
      };
    } else {
      return {
        startOfPeriod: new Date(currentYear, 0, 1),
        endOfPeriod: new Date(currentYear, 11, 31),
      };
    }
  }

  private calculateTimeElapsed(
    startOfPeriod: Date,
    endOfPeriod: Date,
    now: Date
  ): { percentageOfTimeElapsed: number; totalDays: number; daysElapsed: number } {
    const totalDays = Math.ceil(
      (endOfPeriod.getTime() - startOfPeriod.getTime()) / (1000 * 60 * 60 * 24)
    );
    const daysElapsed = Math.ceil(
      (now.getTime() - startOfPeriod.getTime()) / (1000 * 60 * 60 * 24)
    );
    const percentageOfTimeElapsed = (daysElapsed / totalDays) * 100;

    return { percentageOfTimeElapsed, totalDays, daysElapsed };
  }

  private determineStatus(
    percentageFull: number,
    percentageOfTimeElapsed: number
  ): 'good' | 'warning' | 'critical' {
    const threshold = 10;

    if (percentageFull < percentageOfTimeElapsed - threshold) {
      return 'good';
    } else if (percentageFull > percentageOfTimeElapsed + threshold) {
      return 'critical';
    } else {
      return 'warning';
    }
  }
}
