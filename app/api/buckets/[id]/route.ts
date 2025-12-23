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

async function deleteHandler(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
  { prisma }: { prisma: any }
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

export const PUT = withContainerAndParams(putHandler);
export const DELETE = withContainerAndParams(deleteHandler);
