import { PrismaClient } from '@prisma/client';
import { CreateBucketInput, UpdateBucketInput } from '../validation';
import { BucketWithTransactions } from '../types';

export class BucketService {
  constructor(private prisma: PrismaClient) {}

  async getAllBuckets(): Promise<BucketWithTransactions[]> {
    return this.prisma.bucket.findMany({
      include: {
        transactions: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getBucketById(id: string): Promise<BucketWithTransactions | null> {
    return this.prisma.bucket.findUnique({
      where: { id },
      include: {
        transactions: true,
      },
    });
  }

  async createBucket(data: CreateBucketInput): Promise<BucketWithTransactions> {
    return this.prisma.bucket.create({
      data: {
        name: data.name,
        size: typeof data.size === 'string' ? parseFloat(data.size) : data.size,
        period: data.period,
      },
      include: {
        transactions: true,
      },
    });
  }

  async updateBucket(
    id: string,
    data: UpdateBucketInput
  ): Promise<BucketWithTransactions> {
    const updateData: any = {};
    if (data.name) updateData.name = data.name;
    if (data.size) {
      updateData.size = typeof data.size === 'string' ? parseFloat(data.size) : data.size;
    }
    if (data.period) updateData.period = data.period;

    return this.prisma.bucket.update({
      where: { id },
      data: updateData,
      include: {
        transactions: true,
      },
    });
  }

  async deleteBucket(id: string): Promise<void> {
    await this.prisma.bucket.delete({
      where: { id },
    });
  }
}
