import { NextRequest, NextResponse } from 'next/server';
import { withContainer } from '@/lib/with-container';
import { Container } from '@/lib/container';
import { handleError } from '@/lib/error-handler';

async function getHandler(
  request: NextRequest,
  { dashboardService }: Container
): Promise<NextResponse> {
  try {
    const dashboardData = await dashboardService.getDashboardData();
    return NextResponse.json(dashboardData);
  } catch (error) {
    return handleError(error);
  }
}

export const GET = withContainer(getHandler);
