import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const buckets = await prisma.bucket.findMany({
      include: {
        transactions: true,
      },
    });

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    const dashboardData = buckets.map((bucket) => {
      const startOfPeriod =
        bucket.period === 'monthly'
          ? new Date(currentYear, currentMonth, 1)
          : new Date(currentYear, 0, 1);

      const endOfPeriod =
        bucket.period === 'monthly'
          ? new Date(currentYear, currentMonth + 1, 0)
          : new Date(currentYear, 11, 31);

      const periodTransactions = bucket.transactions.filter((t) => {
        const transactionDate = new Date(t.date);
        return transactionDate >= startOfPeriod && transactionDate <= endOfPeriod;
      });

      const totalSpent = periodTransactions.reduce(
        (sum, t) => sum + t.amount,
        0
      );

      const percentageFull = (totalSpent / bucket.size) * 100;

      const totalDays = Math.ceil(
        (endOfPeriod.getTime() - startOfPeriod.getTime()) / (1000 * 60 * 60 * 24)
      );
      const daysElapsed = Math.ceil(
        (now.getTime() - startOfPeriod.getTime()) / (1000 * 60 * 60 * 24)
      );
      const percentageOfTimeElapsed = (daysElapsed / totalDays) * 100;

      let status: 'good' | 'warning' | 'critical';
      if (percentageFull < percentageOfTimeElapsed - 10) {
        status = 'good';
      } else if (percentageFull > percentageOfTimeElapsed + 10) {
        status = 'critical';
      } else {
        status = 'warning';
      }

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
    });

    return NextResponse.json(dashboardData);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}
