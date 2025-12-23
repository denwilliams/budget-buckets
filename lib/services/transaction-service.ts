import { PrismaClient } from '@prisma/client';
import { TransactionWithBucket } from '../types';
import { UpdateTransactionInput } from '../validation';

export class TransactionService {
  constructor(private prisma: PrismaClient) {}

  async getAllTransactions(): Promise<TransactionWithBucket[]> {
    return this.prisma.transaction.findMany({
      include: {
        bucket: true,
      },
      orderBy: {
        date: 'desc',
      },
    });
  }

  async getTransactionById(id: string): Promise<TransactionWithBucket | null> {
    return this.prisma.transaction.findUnique({
      where: { id },
      include: {
        bucket: true,
      },
    });
  }

  async updateTransaction(
    id: string,
    data: UpdateTransactionInput
  ): Promise<TransactionWithBucket> {
    return this.prisma.transaction.update({
      where: { id },
      data: {
        bucketId: data.bucketId,
      },
      include: {
        bucket: true,
      },
    });
  }

  async createTransaction(data: {
    date: Date;
    description: string;
    amount: number;
    bucketId?: string;
  }): Promise<TransactionWithBucket> {
    return this.prisma.transaction.create({
      data,
      include: {
        bucket: true,
      },
    });
  }

  async deleteTransaction(id: string): Promise<void> {
    await this.prisma.transaction.delete({
      where: { id },
    });
  }
}
