import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { AppError, ValidationError } from './errors';
import { Prisma } from '@prisma/client';

export function handleError(error: unknown): NextResponse {
  console.error('Error:', error);

  // Handle Zod validation errors
  if (error instanceof ZodError) {
    const errors: Record<string, string[]> = {};
    error.issues.forEach((err) => {
      const path = err.path.join('.');
      if (!errors[path]) {
        errors[path] = [];
      }
      errors[path].push(err.message);
    });

    return NextResponse.json(
      {
        error: 'Validation failed',
        code: 'VALIDATION_ERROR',
        errors,
      },
      { status: 400 }
    );
  }

  // Handle custom app errors
  if (error instanceof AppError) {
    return NextResponse.json(
      {
        error: error.message,
        code: error.code,
        ...(error instanceof ValidationError && error.errors
          ? { errors: error.errors }
          : {}),
      },
      { status: error.statusCode }
    );
  }

  // Handle Prisma errors
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2002') {
      return NextResponse.json(
        {
          error: 'A record with this unique field already exists',
          code: 'DUPLICATE_ERROR',
        },
        { status: 409 }
      );
    }
    if (error.code === 'P2025') {
      return NextResponse.json(
        {
          error: 'Record not found',
          code: 'NOT_FOUND',
        },
        { status: 404 }
      );
    }
  }

  // Generic error
  return NextResponse.json(
    {
      error: 'An unexpected error occurred',
      code: 'INTERNAL_ERROR',
    },
    { status: 500 }
  );
}
