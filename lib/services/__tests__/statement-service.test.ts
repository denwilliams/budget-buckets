import { describe, it, expect, vi, beforeEach } from 'vitest';
import { StatementService } from '../statement-service';
import { PrismaClient } from '@prisma/client';

const mockPrisma = {
  transaction: {
    create: vi.fn(),
  },
} as unknown as PrismaClient;

describe('StatementService', () => {
  let service: StatementService;

  beforeEach(() => {
    service = new StatementService(mockPrisma);
    vi.clearAllMocks();
  });

  describe('uploadStatement', () => {
    it('should parse and save valid CSV data', async () => {
      const csvContent = `Date,Description,Amount
2024-01-15,Grocery Store,50.00
2024-01-16,Gas Station,40.00`;

      const file = new File([csvContent], 'statement.csv', { type: 'text/csv' });

      const mockTransactions = [
        {
          id: 't1',
          date: new Date('2024-01-15'),
          description: 'Grocery Store',
          amount: 50.0,
          bucketId: null,
          createdAt: new Date(),
          bucket: null,
        },
        {
          id: 't2',
          date: new Date('2024-01-16'),
          description: 'Gas Station',
          amount: 40.0,
          bucketId: null,
          createdAt: new Date(),
          bucket: null,
        },
      ];

      vi.mocked(mockPrisma.transaction.create)
        .mockResolvedValueOnce(mockTransactions[0] as any)
        .mockResolvedValueOnce(mockTransactions[1] as any);

      const result = await service.uploadStatement(file);

      expect(result.success).toBe(true);
      expect(result.count).toBe(2);
      expect(result.transactions).toHaveLength(2);
      expect(mockPrisma.transaction.create).toHaveBeenCalledTimes(2);
    });

    it('should handle CSV with different column names (lowercase)', async () => {
      const csvContent = `date,description,amount
2024-01-15,Store,25.50`;

      const file = new File([csvContent], 'statement.csv', { type: 'text/csv' });

      const mockTransaction = {
        id: 't1',
        date: new Date('2024-01-15'),
        description: 'Store',
        amount: 25.5,
        bucketId: null,
        createdAt: new Date(),
        bucket: null,
      };

      vi.mocked(mockPrisma.transaction.create).mockResolvedValue(mockTransaction as any);

      const result = await service.uploadStatement(file);

      expect(result.success).toBe(true);
      expect(result.count).toBe(1);
    });

    it('should handle CSV with uppercase column names', async () => {
      const csvContent = `DATE,DESCRIPTION,AMOUNT
2024-01-15,STORE,25.50`;

      const file = new File([csvContent], 'statement.csv', { type: 'text/csv' });

      const mockTransaction = {
        id: 't1',
        date: new Date('2024-01-15'),
        description: 'STORE',
        amount: 25.5,
        bucketId: null,
        createdAt: new Date(),
        bucket: null,
      };

      vi.mocked(mockPrisma.transaction.create).mockResolvedValue(mockTransaction as any);

      const result = await service.uploadStatement(file);

      expect(result.success).toBe(true);
      expect(result.count).toBe(1);
    });

    it('should handle CSV with Debit column instead of Amount', async () => {
      const csvContent = `Date,Description,Debit
2024-01-15,Store,25.50`;

      const file = new File([csvContent], 'statement.csv', { type: 'text/csv' });

      const mockTransaction = {
        id: 't1',
        date: new Date('2024-01-15'),
        description: 'Store',
        amount: 25.5,
        bucketId: null,
        createdAt: new Date(),
        bucket: null,
      };

      vi.mocked(mockPrisma.transaction.create).mockResolvedValue(mockTransaction as any);

      const result = await service.uploadStatement(file);

      expect(result.success).toBe(true);
      expect(result.count).toBe(1);
    });

    it('should skip rows with missing date or amount', async () => {
      const csvContent = `Date,Description,Amount
2024-01-15,Valid Transaction,50.00
,Missing Date,40.00
2024-01-17,Missing Amount,`;

      const file = new File([csvContent], 'statement.csv', { type: 'text/csv' });

      const mockTransaction = {
        id: 't1',
        date: new Date('2024-01-15'),
        description: 'Valid Transaction',
        amount: 50.0,
        bucketId: null,
        createdAt: new Date(),
        bucket: null,
      };

      vi.mocked(mockPrisma.transaction.create).mockResolvedValue(mockTransaction as any);

      const result = await service.uploadStatement(file);

      expect(result.success).toBe(true);
      expect(result.count).toBe(1);
      expect(mockPrisma.transaction.create).toHaveBeenCalledTimes(1);
    });

    it('should convert negative amounts to positive', async () => {
      const csvContent = `Date,Description,Amount
2024-01-15,Debit Transaction,-50.00`;

      const file = new File([csvContent], 'statement.csv', { type: 'text/csv' });

      const mockTransaction = {
        id: 't1',
        date: new Date('2024-01-15'),
        description: 'Debit Transaction',
        amount: 50.0,
        bucketId: null,
        createdAt: new Date(),
        bucket: null,
      };

      vi.mocked(mockPrisma.transaction.create).mockResolvedValue(mockTransaction as any);

      await service.uploadStatement(file);

      expect(mockPrisma.transaction.create).toHaveBeenCalledWith({
        data: {
          date: expect.any(Date),
          description: 'Debit Transaction',
          amount: 50.0,
        },
        include: {
          bucket: true,
        },
      });
    });

    it('should handle amounts with currency symbols', async () => {
      const csvContent = `Date,Description,Amount
2024-01-15,Store,$50.00`;

      const file = new File([csvContent], 'statement.csv', { type: 'text/csv' });

      const mockTransaction = {
        id: 't1',
        date: new Date('2024-01-15'),
        description: 'Store',
        amount: 50.0,
        bucketId: null,
        createdAt: new Date(),
        bucket: null,
      };

      vi.mocked(mockPrisma.transaction.create).mockResolvedValue(mockTransaction as any);

      await service.uploadStatement(file);

      expect(mockPrisma.transaction.create).toHaveBeenCalledWith({
        data: {
          date: expect.any(Date),
          description: 'Store',
          amount: 50.0,
        },
        include: {
          bucket: true,
        },
      });
    });

    it('should return errors for invalid dates', async () => {
      const csvContent = `Date,Description,Amount
invalid-date,Store,50.00`;

      const file = new File([csvContent], 'statement.csv', { type: 'text/csv' });

      const result = await service.uploadStatement(file);

      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors!.length).toBeGreaterThan(0);
      expect(result.count).toBe(0);
    });

    it('should return errors for invalid amounts', async () => {
      const csvContent = `Date,Description,Amount
2024-01-15,Store,not-a-number`;

      const file = new File([csvContent], 'statement.csv', { type: 'text/csv' });

      const result = await service.uploadStatement(file);

      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors!.length).toBeGreaterThan(0);
      expect(result.count).toBe(0);
    });

    it('should handle empty CSV', async () => {
      const csvContent = `Date,Description,Amount`;

      const file = new File([csvContent], 'statement.csv', { type: 'text/csv' });

      const result = await service.uploadStatement(file);

      expect(result.success).toBe(true);
      expect(result.count).toBe(0);
      expect(result.transactions).toHaveLength(0);
    });

    it('should skip empty lines', async () => {
      const csvContent = `Date,Description,Amount
2024-01-15,Store,50.00

2024-01-16,Gas,40.00`;

      const file = new File([csvContent], 'statement.csv', { type: 'text/csv' });

      const mockTransactions = [
        {
          id: 't1',
          date: new Date('2024-01-15'),
          description: 'Store',
          amount: 50.0,
          bucketId: null,
          createdAt: new Date(),
          bucket: null,
        },
        {
          id: 't2',
          date: new Date('2024-01-16'),
          description: 'Gas',
          amount: 40.0,
          bucketId: null,
          createdAt: new Date(),
          bucket: null,
        },
      ];

      vi.mocked(mockPrisma.transaction.create)
        .mockResolvedValueOnce(mockTransactions[0] as any)
        .mockResolvedValueOnce(mockTransactions[1] as any);

      const result = await service.uploadStatement(file);

      expect(result.success).toBe(true);
      expect(result.count).toBe(2);
      expect(mockPrisma.transaction.create).toHaveBeenCalledTimes(2);
    });
  });
});
