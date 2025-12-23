import { NextRequest, NextResponse } from 'next/server';
import { withContainer } from '@/lib/with-container';
import { Container } from '@/lib/container';
import { createBucketSchema } from '@/lib/validation';
import { handleError } from '@/lib/error-handler';

async function getHandler(
  request: NextRequest,
  { bucketService }: Container
): Promise<NextResponse> {
  try {
    const buckets = await bucketService.getAllBuckets();
    return NextResponse.json(buckets);
  } catch (error) {
    return handleError(error);
  }
}

async function postHandler(
  request: NextRequest,
  { bucketService }: Container
): Promise<NextResponse> {
  try {
    const body = await request.json();
    const validatedData = createBucketSchema.parse(body);
    const bucket = await bucketService.createBucket(validatedData);
    return NextResponse.json(bucket, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}

export const GET = withContainer(getHandler);
export const POST = withContainer(postHandler);
