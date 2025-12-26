import { NextRequest, NextResponse } from 'next/server';
import { execSync } from 'child_process';
import { withContainer } from '@/lib/with-container';
import { Container } from '@/lib/container';
import { handleError } from '@/lib/error-handler';

/**
 * POST /api/admin/migrate
 *
 * Runs pending Prisma migrations on the database.
 * This endpoint should be called after deployment to apply schema changes.
 *
 * Security:
 * - Requires MIGRATION_SECRET environment variable to be set
 * - Request must include Authorization header with matching secret
 */
async function postHandler(
  request: NextRequest,
  { prisma }: Container
): Promise<NextResponse> {
  try {
    // Authentication check
    const migrationSecret = process.env.MIGRATION_SECRET;
    if (!migrationSecret) {
      return NextResponse.json(
        { error: 'Migration endpoint not configured. Set MIGRATION_SECRET environment variable.' },
        { status: 500 }
      );
    }

    const authHeader = request.headers.get('authorization');
    const providedSecret = authHeader?.replace('Bearer ', '');

    if (providedSecret !== migrationSecret) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Run migrations
    console.log('Starting database migration...');

    const output = execSync('npx prisma migrate deploy', {
      encoding: 'utf-8',
      env: {
        ...process.env,
        // Ensure we use the direct connection URL for migrations
        DATABASE_URL: process.env.DIRECT_URL || process.env.DATABASE_URL,
      },
    });

    console.log('Migration completed successfully');
    console.log(output);

    return NextResponse.json({
      success: true,
      message: 'Migrations applied successfully',
      output: output,
    });
  } catch (error) {
    console.error('Migration failed:', error);

    if (error instanceof Error && 'stdout' in error) {
      const execError = error as { stdout: Buffer; stderr: Buffer; status: number };
      return NextResponse.json(
        {
          success: false,
          error: 'Migration failed',
          stdout: execError.stdout?.toString(),
          stderr: execError.stderr?.toString(),
        },
        { status: 500 }
      );
    }

    return handleError(error);
  }
}

export const POST = withContainer(postHandler);
