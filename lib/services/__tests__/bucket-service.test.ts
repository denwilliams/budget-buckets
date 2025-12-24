import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BucketService } from '../bucket-service';
import { PrismaClient } from '@prisma/client';

const mockPrisma = {
  bucket: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
} as unknown as PrismaClient;

describe('BucketService', () => {
  let service: BucketService;

  beforeEach(() => {
    service = new BucketService(mockPrisma);
    vi.clearAllMocks();
  });

  describe('getAllBuckets', () => {
    it('should return all buckets with transactions', async () => {
      const mockBuckets = [
        {
          id: '1',
          name: 'Groceries',
          size: 500,
          period: 'monthly',
          createdAt: new Date(),
          transactions: [],
        },
        {
          id: '2',
          name: 'Entertainment',
          size: 200,
          period: 'monthly',
          createdAt: new Date(),
          transactions: [],
        },
      ];

      vi.mocked(mockPrisma.bucket.findMany).mockResolvedValue(mockBuckets as any);

      const result = await service.getAllBuckets();

      expect(result).toEqual(mockBuckets);
      expect(mockPrisma.bucket.findMany).toHaveBeenCalledWith({
        include: {
          transactions: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    });

    it('should return empty array when no buckets exist', async () => {
      vi.mocked(mockPrisma.bucket.findMany).mockResolvedValue([]);

      const result = await service.getAllBuckets();

      expect(result).toEqual([]);
    });
  });

  describe('getBucketById', () => {
    it('should return bucket by id with transactions', async () => {
      const mockBucket = {
        id: '1',
        name: 'Groceries',
        size: 500,
        period: 'monthly',
        createdAt: new Date(),
        transactions: [
          {
            id: 't1',
            date: new Date(),
            description: 'Store',
            amount: 50,
            bucketId: '1',
            createdAt: new Date(),
          },
        ],
      };

      vi.mocked(mockPrisma.bucket.findUnique).mockResolvedValue(mockBucket as any);

      const result = await service.getBucketById('1');

      expect(result).toEqual(mockBucket);
      expect(mockPrisma.bucket.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
        include: {
          transactions: true,
        },
      });
    });

    it('should return null when bucket does not exist', async () => {
      vi.mocked(mockPrisma.bucket.findUnique).mockResolvedValue(null);

      const result = await service.getBucketById('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('createBucket', () => {
    it('should create bucket with valid data', async () => {
      const input = {
        name: 'Groceries',
        size: 500,
        period: 'monthly' as const,
      };

      const mockCreated = {
        id: '1',
        ...input,
        createdAt: new Date(),
        transactions: [],
      };

      vi.mocked(mockPrisma.bucket.create).mockResolvedValue(mockCreated as any);

      const result = await service.createBucket(input);

      expect(result).toEqual(mockCreated);
      expect(mockPrisma.bucket.create).toHaveBeenCalledWith({
        data: {
          name: input.name,
          size: input.size,
          period: input.period,
        },
        include: {
          transactions: true,
        },
      });
    });

    it('should handle size as string and convert to number', async () => {
      const input = {
        name: 'Groceries',
        size: '500' as any,
        period: 'monthly' as const,
      };

      const mockCreated = {
        id: '1',
        name: input.name,
        size: 500,
        period: input.period,
        createdAt: new Date(),
        transactions: [],
      };

      vi.mocked(mockPrisma.bucket.create).mockResolvedValue(mockCreated as any);

      const result = await service.createBucket(input);

      expect(mockPrisma.bucket.create).toHaveBeenCalledWith({
        data: {
          name: input.name,
          size: 500,
          period: input.period,
        },
        include: {
          transactions: true,
        },
      });
    });
  });

  describe('updateBucket', () => {
    it('should update bucket with provided fields', async () => {
      const updateData = {
        name: 'Updated Groceries',
        size: 600,
      };

      const mockUpdated = {
        id: '1',
        name: 'Updated Groceries',
        size: 600,
        period: 'monthly',
        createdAt: new Date(),
        transactions: [],
      };

      vi.mocked(mockPrisma.bucket.update).mockResolvedValue(mockUpdated as any);

      const result = await service.updateBucket('1', updateData);

      expect(result).toEqual(mockUpdated);
      expect(mockPrisma.bucket.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: {
          name: updateData.name,
          size: updateData.size,
        },
        include: {
          transactions: true,
        },
      });
    });

    it('should only update provided fields', async () => {
      const updateData = {
        name: 'Updated Name',
      };

      const mockUpdated = {
        id: '1',
        name: 'Updated Name',
        size: 500,
        period: 'monthly',
        createdAt: new Date(),
        transactions: [],
      };

      vi.mocked(mockPrisma.bucket.update).mockResolvedValue(mockUpdated as any);

      await service.updateBucket('1', updateData);

      expect(mockPrisma.bucket.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: {
          name: updateData.name,
        },
        include: {
          transactions: true,
        },
      });
    });
  });

  describe('deleteBucket', () => {
    it('should delete bucket by id', async () => {
      vi.mocked(mockPrisma.bucket.delete).mockResolvedValue({} as any);

      await service.deleteBucket('1');

      expect(mockPrisma.bucket.delete).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });
  });
});
