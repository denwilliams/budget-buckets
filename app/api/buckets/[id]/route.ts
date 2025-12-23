import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, size, period } = body;

    if (period && period !== 'monthly' && period !== 'yearly') {
      return NextResponse.json(
        { error: 'Period must be either "monthly" or "yearly"' },
        { status: 400 }
      );
    }

    const bucket = await prisma.bucket.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(size && { size: parseFloat(size) }),
        ...(period && { period }),
      },
    });

    return NextResponse.json(bucket);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update bucket' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.bucket.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete bucket' },
      { status: 500 }
    );
  }
}
