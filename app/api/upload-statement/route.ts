import { NextRequest, NextResponse } from 'next/server';
import { withContainer } from '@/lib/with-container';
import { Container } from '@/lib/container';
import { handleError } from '@/lib/error-handler';
import { ValidationError } from '@/lib/errors';

async function postHandler(
  request: NextRequest,
  { statementService }: Container
): Promise<NextResponse> {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      throw new ValidationError('No file provided');
    }

    const result = await statementService.uploadStatement(file);

    if (!result.success && result.errors) {
      return NextResponse.json(
        { error: 'Failed to parse statement', details: result.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    return handleError(error);
  }
}

export const POST = withContainer(postHandler);
