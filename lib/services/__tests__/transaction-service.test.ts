import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TransactionService } from '../transaction-service';
import { PrismaClient } from '@prisma/client';

const mockPrisma = {
  transaction: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
} as unknown as PrismaClient;

describe('TransactionService', () => {
  let service: TransactionService;

  beforeEach(() => {
    service = new TransactionService(mockPrisma);
    vi.clearAllMocks();
  });

  describe('getAllTransactions', () => {
    it('should return all transactions with bucket', async () => {
      const mockTransactions = [
        {
          id: 't1',
          date: new Date(),
          description: 'Grocery Store',
          amount: 50,
          bucketId: 'b1',
          createdAt: new Date(),
          bucket: {
            id: 'b1',
            name: 'Groceries',
            size: 500,
            period: 'monthly',
            createdAt: new Date(),
          },
        },
        {
          id: 't2',
          date: new Date(),
          description: 'Gas Station',
          amount: 40,
          bucketId: null,
          createdAt: new Date(),
          bucket: null,
        },
      ];

      vi.mocked(mockPrisma.transaction.findMany).mockResolvedValue(
        mockTransactions as any
      );

      const result = await service.getAllTransactions();

      expect(result).toEqual(mockTransactions);
      expect(mockPrisma.transaction.findMany).toHaveBeenCalledWith({
        include: {
          bucket: true,
        },
        orderBy: {
          date: 'desc',
        },
      });
    });

    it('should return empty array when no transactions exist', async () => {
      vi.mocked(mockPrisma.transaction.findMany).mockResolvedValue([]);

      const result = await service.getAllTransactions();

      expect(result).toEqual([]);
    });
  });

  describe('getTransactionById', () => {
    it('should return transaction by id with bucket', async () => {
      const mockTransaction = {
        id: 't1',
        date: new Date(),
        description: 'Grocery Store',
        amount: 50,
        bucketId: 'b1',
        createdAt: new Date(),
        bucket: {
          id: 'b1',
          name: 'Groceries',
          size: 500,
          period: 'monthly',
          createdAt: new Date(),
        },
      };

      vi.mocked(mockPrisma.transaction.findUnique).mockResolvedValue(
        mockTransaction as any
      );

      const result = await service.getTransactionById('t1');

      expect(result).toEqual(mockTransaction);
      expect(mockPrisma.transaction.findUnique).toHaveBeenCalledWith({
        where: { id: 't1' },
        include: {
          bucket: true,
        },
      });
    });

    it('should return null when transaction does not exist', async () => {
      vi.mocked(mockPrisma.transaction.findUnique).mockResolvedValue(null);

      const result = await service.getTransactionById('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('createTransaction', () => {
    it('should create transaction with bucket', async () => {
      const input = {
        date: new Date(),
        description: 'Grocery Store',
        amount: 50,
        bucketId: 'b1',
      };

      const mockCreated = {
        id: 't1',
        ...input,
        createdAt: new Date(),
        bucket: {
          id: 'b1',
          name: 'Groceries',
          size: 500,
          period: 'monthly',
          createdAt: new Date(),
        },
      };

      vi.mocked(mockPrisma.transaction.create).mockResolvedValue(mockCreated as any);

      const result = await service.createTransaction(input);

      expect(result).toEqual(mockCreated);
      expect(mockPrisma.transaction.create).toHaveBeenCalledWith({
        data: input,
        include: {
          bucket: true,
        },
      });
    });

    it('should create transaction without bucket', async () => {
      const input = {
        date: new Date(),
        description: 'Unassigned Transaction',
        amount: 75,
      };

      const mockCreated = {
        id: 't1',
        ...input,
        bucketId: null,
        createdAt: new Date(),
        bucket: null,
      };

      vi.mocked(mockPrisma.transaction.create).mockResolvedValue(mockCreated as any);

      const result = await service.createTransaction(input);

      expect(result).toEqual(mockCreated);
    });
  });

  describe('updateTransaction', () => {
    it('should update transaction with bucket assignment', async () => {
      const updateData = {
        bucketId: 'b1',
      };

      const mockUpdated = {
        id: 't1',
        date: new Date(),
        description: 'Grocery Store',
        amount: 50,
        bucketId: 'b1',
        createdAt: new Date(),
        bucket: {
          id: 'b1',
          name: 'Groceries',
          size: 500,
          period: 'monthly',
          createdAt: new Date(),
        },
      };

      vi.mocked(mockPrisma.transaction.update).mockResolvedValue(mockUpdated as any);

      const result = await service.updateTransaction('t1', updateData);

      expect(result).toEqual(mockUpdated);
      expect(mockPrisma.transaction.update).toHaveBeenCalledWith({
        where: { id: 't1' },
        data: {
          bucketId: 'b1',
        },
        include: {
          bucket: true,
        },
      });
    });

    it('should update transaction to remove bucket assignment', async () => {
      const updateData = {
        bucketId: null,
      };

      const mockUpdated = {
        id: 't1',
        date: new Date(),
        description: 'Grocery Store',
        amount: 50,
        bucketId: null,
        createdAt: new Date(),
        bucket: null,
      };

      vi.mocked(mockPrisma.transaction.update).mockResolvedValue(mockUpdated as any);

      const result = await service.updateTransaction('t1', updateData);

      expect(result).toEqual(mockUpdated);
      expect(mockPrisma.transaction.update).toHaveBeenCalledWith({
        where: { id: 't1' },
        data: {
          bucketId: null,
        },
        include: {
          bucket: true,
        },
      });
    });
  });

  describe('deleteTransaction', () => {
    it('should delete transaction by id', async () => {
      vi.mocked(mockPrisma.transaction.delete).mockResolvedValue({} as any);

      await service.deleteTransaction('t1');

      expect(mockPrisma.transaction.delete).toHaveBeenCalledWith({
        where: { id: 't1' },
      });
    });
  });
});
