import { NextRequest, NextResponse } from 'next/server';
import { withContainer } from '@/lib/with-container';

async function getHandler(request: NextRequest, { prisma }: { prisma: any }) {
  try {
    const transactions = await prisma.transaction.findMany({
      include: {
        bucket: true,
      },
      orderBy: {
        date: 'desc',
      },
    });
    return NextResponse.json(transactions);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch transactions' },
      { status: 500 }
    );
  }
}

export const GET = withContainer(getHandler);
