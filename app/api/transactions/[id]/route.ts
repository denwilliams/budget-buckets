import { NextRequest, NextResponse } from 'next/server';
import { withContainerAndParams } from '@/lib/with-container';
import { Container } from '@/lib/container';
import { updateTransactionSchema } from '@/lib/validation';
import { handleError } from '@/lib/error-handler';

async function putHandler(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
  { transactionService }: Container
): Promise<NextResponse> {
  try {
    const { id } = await params;
    const body = await request.json();
    const validatedData = updateTransactionSchema.parse(body);
    const transaction = await transactionService.updateTransaction(id, validatedData);
    return NextResponse.json(transaction);
  } catch (error) {
    return handleError(error);
  }
}

export const PUT = withContainerAndParams(putHandler);
