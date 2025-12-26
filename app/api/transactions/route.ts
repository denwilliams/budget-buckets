import { NextRequest, NextResponse } from 'next/server';
import { withContainer } from '@/lib/with-container';
import { Container } from '@/lib/container';
import { handleError } from '@/lib/error-handler';

async function getHandler(
  request: NextRequest,
  { transactionService }: Container
): Promise<NextResponse> {
  try {
    const transactions = await transactionService.getAllTransactions();
    return NextResponse.json(transactions);
  } catch (error) {
    return handleError(error);
  }
}

export const GET = withContainer(getHandler);
