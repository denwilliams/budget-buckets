import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DashboardService } from '../dashboard-service';
import { PrismaClient } from '@prisma/client';

// Mock Prisma Client
const mockPrisma = {
  bucket: {
    findMany: vi.fn(),
  },
} as unknown as PrismaClient;

describe('DashboardService', () => {
  let service: DashboardService;

  beforeEach(() => {
    service = new DashboardService(mockPrisma);
    vi.clearAllMocks();
  });

  describe('getDashboardData', () => {
    it('should return empty array when no buckets exist', async () => {
      vi.mocked(mockPrisma.bucket.findMany).mockResolvedValue([]);

      const result = await service.getDashboardData();

      expect(result).toEqual([]);
      expect(mockPrisma.bucket.findMany).toHaveBeenCalledWith({
        include: {
          transactions: true,
        },
      });
    });

    it('should calculate status as "good" when spending is below time elapsed', async () => {
      const mockBuckets = [
        {
          id: '1',
          name: 'Test Bucket',
          size: 1000,
          period: 'monthly',
          createdAt: new Date(),
          transactions: [
            {
              id: 't1',
              date: new Date(),
              description: 'Test',
              amount: 100, // 10% spent
              bucketId: '1',
              createdAt: new Date(),
            },
          ],
        },
      ];

      vi.mocked(mockPrisma.bucket.findMany).mockResolvedValue(
        mockBuckets as any
      );

      const result = await service.getDashboardData();

      expect(result).toHaveLength(1);
      expect(result[0].status).toBe('good');
      expect(result[0].totalSpent).toBe(100);
      expect(result[0].percentageFull).toBe(10);
    });

    it('should calculate status as "critical" when spending is above time elapsed', async () => {
      const mockBuckets = [
        {
          id: '1',
          name: 'Test Bucket',
          size: 1000,
          period: 'monthly',
          createdAt: new Date(),
          transactions: [
            {
              id: 't1',
              date: new Date(),
              description: 'Test',
              amount: 900, // 90% spent
              bucketId: '1',
              createdAt: new Date(),
            },
          ],
        },
      ];

      vi.mocked(mockPrisma.bucket.findMany).mockResolvedValue(
        mockBuckets as any
      );

      const result = await service.getDashboardData();

      expect(result).toHaveLength(1);
      expect(result[0].status).toBe('critical');
      expect(result[0].totalSpent).toBe(900);
    });

    it('should only include transactions from current period', async () => {
      const now = new Date();
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 15);

      const mockBuckets = [
        {
          id: '1',
          name: 'Test Bucket',
          size: 1000,
          period: 'monthly',
          createdAt: new Date(),
          transactions: [
            {
              id: 't1',
              date: now,
              description: 'Current',
              amount: 100,
              bucketId: '1',
              createdAt: new Date(),
            },
            {
              id: 't2',
              date: lastMonth,
              description: 'Old',
              amount: 500,
              bucketId: '1',
              createdAt: new Date(),
            },
          ],
        },
      ];

      vi.mocked(mockPrisma.bucket.findMany).mockResolvedValue(
        mockBuckets as any
      );

      const result = await service.getDashboardData();

      expect(result[0].totalSpent).toBe(100);
      expect(result[0].transactionCount).toBe(1);
    });
  });
});
