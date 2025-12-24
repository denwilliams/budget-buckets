import { NextRequest, NextResponse } from 'next/server';
import { withContainer } from '@/lib/with-container';
import Papa from 'papaparse';

async function postHandler(request: NextRequest, { prisma }: { prisma: any }) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    const text = await file.text();

    const result = Papa.parse(text, {
      header: true,
      skipEmptyLines: true,
    });

    const transactions = [];
    for (const row of result.data as any[]) {
      const date = row.Date || row.date || row.DATE;
      const description =
        row.Description || row.description || row.DESCRIPTION || '';
      const amount =
        row.Amount || row.amount || row.AMOUNT || row.Debit || row.debit;

      if (!date || !amount) {
        continue;
      }

      const parsedDate = new Date(date);
      if (isNaN(parsedDate.getTime())) {
        continue;
      }

      const parsedAmount = parseFloat(amount.toString().replace(/[^0-9.-]/g, ''));
      if (isNaN(parsedAmount)) {
        continue;
      }

      const transaction = await prisma.transaction.create({
        data: {
          date: parsedDate,
          description,
          amount: Math.abs(parsedAmount),
        },
      });

      transactions.push(transaction);
    }

    return NextResponse.json({
      success: true,
      count: transactions.length,
      transactions,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload statement' },
      { status: 500 }
    );
  }
}

export const POST = withContainer(postHandler);
