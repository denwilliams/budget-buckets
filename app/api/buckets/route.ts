import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const buckets = await prisma.bucket.findMany({
      include: {
        transactions: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    return NextResponse.json(buckets);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch buckets' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, size, period } = body;

    if (!name || !size || !period) {
      return NextResponse.json(
        { error: 'Name, size, and period are required' },
        { status: 400 }
      );
    }

    if (period !== 'monthly' && period !== 'yearly') {
      return NextResponse.json(
        { error: 'Period must be either "monthly" or "yearly"' },
        { status: 400 }
      );
    }

    const bucket = await prisma.bucket.create({
      data: {
        name,
        size: parseFloat(size),
        period,
      },
    });

    return NextResponse.json(bucket, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create bucket' },
      { status: 500 }
    );
  }
}
