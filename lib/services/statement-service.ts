import { PrismaClient } from '@prisma/client';
import Papa from 'papaparse';
import { TransactionWithBucket } from '../types';

export interface ParsedTransaction {
  date: Date;
  description: string;
  amount: number;
}

export interface StatementUploadResult {
  success: boolean;
  count: number;
  transactions: TransactionWithBucket[];
  errors?: string[];
}

export class StatementService {
  constructor(private prisma: PrismaClient) {}

  async uploadStatement(file: File): Promise<StatementUploadResult> {
    const text = await file.text();
    const parsed = this.parseCSV(text);

    if (parsed.errors.length > 0) {
      return {
        success: false,
        count: 0,
        transactions: [],
        errors: parsed.errors,
      };
    }

    const transactions = await this.saveTransactions(parsed.transactions);

    return {
      success: true,
      count: transactions.length,
      transactions,
    };
  }

  private parseCSV(text: string): {
    transactions: ParsedTransaction[];
    errors: string[];
  } {
    const result = Papa.parse(text, {
      header: true,
      skipEmptyLines: true,
    });

    const transactions: ParsedTransaction[] = [];
    const errors: string[] = [];

    for (const row of result.data as any[]) {
      try {
        const transaction = this.parseRow(row);
        if (transaction) {
          transactions.push(transaction);
        }
      } catch (error) {
        errors.push(error instanceof Error ? error.message : 'Unknown parsing error');
      }
    }

    return { transactions, errors };
  }

  private parseRow(row: any): ParsedTransaction | null {
    const date = row.Date || row.date || row.DATE;
    const description =
      row.Description || row.description || row.DESCRIPTION || '';
    const amount =
      row.Amount || row.amount || row.AMOUNT || row.Debit || row.debit;

    if (!date || !amount) {
      return null;
    }

    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      throw new Error(`Invalid date: ${date}`);
    }

    const parsedAmount = parseFloat(amount.toString().replace(/[^0-9.-]/g, ''));
    if (isNaN(parsedAmount)) {
      throw new Error(`Invalid amount: ${amount}`);
    }

    return {
      date: parsedDate,
      description,
      amount: Math.abs(parsedAmount),
    };
  }

  private async saveTransactions(
    transactions: ParsedTransaction[]
  ): Promise<TransactionWithBucket[]> {
    const savedTransactions: TransactionWithBucket[] = [];

    for (const transaction of transactions) {
      const saved = await this.prisma.transaction.create({
        data: {
          date: transaction.date,
          description: transaction.description,
          amount: transaction.amount,
        },
        include: {
          bucket: true,
        },
      });
      savedTransactions.push(saved);
    }

    return savedTransactions;
  }
}
