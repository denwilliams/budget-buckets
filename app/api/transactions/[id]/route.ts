import { NextRequest, NextResponse } from 'next/server';
import { withContainerAndParams } from '@/lib/with-container';

async function putHandler(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
  { prisma }: { prisma: any }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { bucketId } = body;

    const transaction = await prisma.transaction.update({
      where: { id },
      data: {
        bucketId: bucketId || null,
      },
    });

    return NextResponse.json(transaction);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update transaction' },
      { status: 500 }
    );
  }
}

export const PUT = withContainerAndParams(putHandler);
