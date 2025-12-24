import { NextRequest, NextResponse } from 'next/server';
import { withContainerAndParams } from '@/lib/with-container';
import { Container } from '@/lib/container';
import { updateBucketSchema } from '@/lib/validation';
import { handleError } from '@/lib/error-handler';

async function putHandler(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
  { bucketService }: Container
): Promise<NextResponse> {
  try {
    const { id } = await params;
    const body = await request.json();
    const validatedData = updateBucketSchema.parse(body);
    const bucket = await bucketService.updateBucket(id, validatedData);
    return NextResponse.json(bucket);
  } catch (error) {
    return handleError(error);
  }
}

async function deleteHandler(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
  { bucketService }: Container
): Promise<NextResponse> {
  try {
    const { id } = await params;
    await bucketService.deleteBucket(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return handleError(error);
  }
}

export const PUT = withContainerAndParams(putHandler);
export const DELETE = withContainerAndParams(deleteHandler);
