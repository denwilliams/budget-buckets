import { z } from 'zod';

/**
 * Environment variable validation schema
 * Ensures all required configuration is present at startup
 */
const envSchema = z.object({
  // Database
  DATABASE_URL: z
    .string()
    .min(1, 'DATABASE_URL is required')
    .refine(
      (url) => url.startsWith('postgresql://'),
      'DATABASE_URL must be a valid PostgreSQL connection string'
    ),

  // Node environment
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),

  // Optional: Port configuration
  PORT: z.string().optional(),

  // Optional: Public app URL
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
});

export type Env = z.infer<typeof envSchema>;

/**
 * Validates environment variables and returns typed config
 * @throws {Error} If required environment variables are missing or invalid
 */
export function validateConfig(): Env {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.issues
        .map((err) => `  - ${err.path.join('.')}: ${err.message}`)
        .join('\n');

      throw new Error(
        `Environment validation failed:\n${missingVars}\n\nPlease check your .env file against .env.example`
      );
    }
    throw error;
  }
}

/**
 * Get validated configuration
 * Cached after first call
 */
let cachedConfig: Env | null = null;

export function getConfig(): Env {
  if (!cachedConfig) {
    cachedConfig = validateConfig();
  }
  return cachedConfig;
}
