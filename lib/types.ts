import { PrismaClient, Bucket, Transaction } from '@prisma/client';

export type Container = {
  prisma: PrismaClient;
};

// Prisma result types
export type BucketWithTransactions = Bucket & {
  transactions: Transaction[];
};

export type TransactionWithBucket = Transaction & {
  bucket: Bucket | null;
};

// API Input types
export type CreateBucketInput = {
  name: string;
  size: number;
  period: 'monthly' | 'yearly';
};

export type UpdateBucketInput = Partial<CreateBucketInput>;

export type UpdateTransactionInput = {
  bucketId: string | null;
};

// Dashboard types
export type DashboardBucket = {
  id: string;
  name: string;
  size: number;
  period: string;
  totalSpent: number;
  percentageFull: number;
  percentageOfTimeElapsed: number;
  status: 'good' | 'warning' | 'critical';
  transactionCount: number;
};
