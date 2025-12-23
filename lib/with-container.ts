import { NextRequest, NextResponse } from 'next/server';
import { Container, createRequestContainer } from './container';

type RouteHandler = (
  request: NextRequest,
  context: { params: Promise<any> },
  container: Container
) => Promise<NextResponse>;

type SimpleRouteHandler = (
  request: NextRequest,
  container: Container
) => Promise<NextResponse>;

export function withContainer(handler: SimpleRouteHandler) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const container = createRequestContainer();
    try {
      return await handler(request, container);
    } finally {
      await container.prisma.$disconnect();
    }
  };
}

export function withContainerAndParams(handler: RouteHandler) {
  return async (
    request: NextRequest,
    context: { params: Promise<any> }
  ): Promise<NextResponse> => {
    const container = createRequestContainer();
    try {
      return await handler(request, context, container);
    } finally {
      await container.prisma.$disconnect();
    }
  };
}
