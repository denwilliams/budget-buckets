/**
 * Next.js Instrumentation Hook
 * This file runs once when the server starts
 * https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */

export async function register() {
  // Only run on server side
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { validateConfig } = await import('./lib/config');

    // Validate environment variables on startup
    // This will throw an error and prevent the app from starting if config is invalid
    try {
      validateConfig();
      console.log('✓ Environment configuration validated successfully');
    } catch (error) {
      console.error('✗ Environment configuration validation failed:');
      console.error(error instanceof Error ? error.message : error);
      throw error;
    }
  }
}
