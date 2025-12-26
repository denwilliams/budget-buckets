# Deployment Guide

This guide provides detailed instructions for deploying Budget Buckets to Vercel with Neon serverless Postgres.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Detailed Setup](#detailed-setup)
- [Environment Variables](#environment-variables)
- [Database Migrations](#database-migrations)
- [Troubleshooting](#troubleshooting)
- [Best Practices](#best-practices)

## Prerequisites

Before deploying, ensure you have:

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **Neon Account**: Sign up at [neon.tech](https://neon.tech)
3. **Git Repository**: Your code pushed to GitHub, GitLab, or Bitbucket
4. **Local Environment**: Node.js 18+ and npm installed

## Quick Start

For experienced users, here's the TL;DR:

```bash
# 1. Create Neon database and get connection strings
# 2. Push code to Git
# 3. Import to Vercel and set environment variables:
#    - DATABASE_URL (pooled connection)
#    - DIRECT_URL (direct connection)
#    - NODE_ENV=production
# 4. Run migrations locally with DIRECT_URL
npx prisma migrate deploy
# 5. Deploy on Vercel
```

## Detailed Setup

### Step 1: Create Neon Database

1. Go to [Neon Console](https://console.neon.tech/)
2. Click **"New Project"**
3. Configure your project:
   - **Project name**: budget-buckets (or your preference)
   - **Region**: Choose closest to your users (e.g., US East, Europe)
   - **Postgres version**: 16 (recommended)
4. Click **"Create Project"**

### Step 2: Get Connection Strings

After creating the project, you'll see the connection details:

1. **Pooled Connection** (for application runtime):
   ```
   postgres://username:password@ep-xxxxx-pooler.us-east-1.neon.tech/neondb?sslmode=require
   ```
   - Note: This URL contains `-pooler` in the hostname
   - Use this for `DATABASE_URL` in production

2. **Direct Connection** (for migrations):
   ```
   postgres://username:password@ep-xxxxx.us-east-1.neon.tech/neondb?sslmode=require
   ```
   - Note: This URL does NOT contain `-pooler`
   - Use this for `DIRECT_URL` when running migrations

### Step 3: Push Code to Git

Ensure your latest code is pushed to your Git repository:

```bash
git add .
git commit -m "Add Vercel deployment configuration"
git push origin main
```

### Step 4: Import to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New Project"**
3. Import your Git repository
4. Configure the project:
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `./` (default)
   - **Build Command**: Uses `vercel.json` configuration
   - **Output Directory**: `.next` (default)

### Step 5: Configure Environment Variables

In the Vercel project settings, add these environment variables:

| Variable | Value | Description |
|----------|-------|-------------|
| `DATABASE_URL` | `postgres://...pooler...?sslmode=require` | Pooled connection for runtime |
| `DIRECT_URL` | `postgres://...?sslmode=require` | Direct connection for migrations |
| `NODE_ENV` | `production` | Node environment |
| `NEXT_PUBLIC_APP_URL` | `https://your-app.vercel.app` | Your Vercel app URL |

**Important**:
- Use the **pooled** connection string for `DATABASE_URL`
- Use the **direct** connection string for `DIRECT_URL`
- Both must include `?sslmode=require`

### Step 6: Run Database Migrations

Before deploying, set up the database schema:

1. Create a local `.env` file with your Neon credentials:
   ```bash
   DATABASE_URL=postgres://username:password@ep-xxxxx-pooler.us-east-1.neon.tech/neondb?sslmode=require
   DIRECT_URL=postgres://username:password@ep-xxxxx.us-east-1.neon.tech/neondb?sslmode=require
   ```

2. Run migrations:
   ```bash
   npx prisma migrate deploy
   ```

3. Verify the migration:
   ```bash
   npx prisma studio
   ```

### Step 7: Deploy

1. Click **"Deploy"** in Vercel
2. Wait for the build to complete
3. Vercel will automatically:
   - Install dependencies
   - Run `prisma generate`
   - Build the Next.js application
   - Deploy to production

## Environment Variables

### Required Variables

- **`DATABASE_URL`**: Pooled connection string from Neon
  - Format: `postgres://user:pass@ep-xxx-pooler.region.neon.tech/db?sslmode=require`
  - Used by Prisma Client at runtime
  - Must use the pooled endpoint (`-pooler`)

- **`DIRECT_URL`**: Direct connection string from Neon
  - Format: `postgres://user:pass@ep-xxx.region.neon.tech/db?sslmode=require`
  - Used by Prisma CLI for migrations
  - Does NOT use the pooled endpoint

### Optional Variables

- **`NODE_ENV`**: Environment mode (default: `production`)
- **`NEXT_PUBLIC_APP_URL`**: Public URL of your application
- **`PORT`**: Server port (Vercel manages this automatically)

### Setting Variables in Vercel

1. Go to your project in Vercel Dashboard
2. Navigate to **Settings** > **Environment Variables**
3. Add each variable:
   - Enter the key (e.g., `DATABASE_URL`)
   - Enter the value (the connection string)
   - Select environments: Production, Preview, Development
4. Click **"Save"**

## Database Migrations

### Production Migrations

For production deployments, always use `prisma migrate deploy`:

```bash
# Set DIRECT_URL in your local .env
npx prisma migrate deploy
```

This command:
- Applies pending migrations
- Does not create new migrations
- Is safe for production use
- Uses the `DIRECT_URL` connection

### Development Migrations

For local development with Neon:

```bash
npx prisma migrate dev --name describe_your_changes
```

This command:
- Creates a new migration
- Applies it to your database
- Updates Prisma Client

### Migration Best Practices

1. **Never run migrations in Vercel builds**
   - Migrations should be run separately before deployment
   - Multiple parallel builds could conflict

2. **Use direct connection for migrations**
   - The pooled connection may timeout for long migrations
   - Direct connection is more reliable for schema changes

3. **Test migrations in preview environment**
   - Create a separate Neon branch for preview deployments
   - Test migrations before applying to production

## Troubleshooting

### Connection Pool Exhausted

**Error**: `Can't reach database server at ...`

**Solution**:
- Verify you're using the **pooled** connection string (`-pooler`) for `DATABASE_URL`
- Check Neon dashboard for connection limits
- Ensure Prisma Client is using the singleton pattern (already implemented in `lib/prisma.ts`)

### Migration Timeouts

**Error**: `Migration timed out`

**Solution**:
- Use `DIRECT_URL` for migrations instead of pooled connection
- Check your schema for complex operations
- Consider breaking large migrations into smaller steps

### SSL Connection Error

**Error**: `SSL connection required`

**Solution**:
- Add `?sslmode=require` to the end of your connection string
- Example: `postgres://user:pass@host/db?sslmode=require`

### Environment Variables Not Found

**Error**: `DATABASE_URL is required`

**Solution**:
- Verify variables are set in Vercel dashboard
- Check variable names match exactly (case-sensitive)
- Redeploy after adding new variables

### Build Failures

**Error**: `Prisma Client could not be generated`

**Solution**:
- Ensure `DATABASE_URL` is set in build environment
- Check `vercel.json` includes `prisma generate` in build command
- Verify `postinstall` script in `package.json` runs `prisma generate`

### Cold Start Performance

**Issue**: First request after inactivity is slow

**Explanation**:
- Neon databases scale to zero when inactive
- First connection wakes the database (takes ~1-2 seconds)
- Subsequent requests are fast

**Solutions**:
- Neon Pro plan reduces cold start time
- Implement health check endpoint to keep database warm
- Accept this as normal serverless behavior

## Best Practices

### Database Connection Management

1. **Always use the singleton pattern** (already implemented in `lib/prisma.ts`)
2. **Use pooled connections** for application runtime
3. **Use direct connections** only for migrations and Prisma Studio

### Security

1. **Never commit `.env` files** to Git
2. **Rotate database credentials** periodically
3. **Use environment variables** for all secrets
4. **Enable Neon IP allowlist** if needed for extra security

### Performance

1. **Choose the same region** for Vercel and Neon to reduce latency
2. **Enable Neon autoscaling** for variable workloads
3. **Monitor connection pool usage** in Neon dashboard
4. **Implement database query optimization** as your app grows

### Monitoring

1. **Set up Vercel Analytics** to monitor performance
2. **Enable Neon monitoring** to track database usage
3. **Implement error tracking** (e.g., Sentry)
4. **Monitor cold start times** and optimize as needed

### Database Branching

Neon supports database branching, which is perfect for preview deployments:

1. **Create a branch** for each preview deployment
2. **Use separate connection strings** for preview environments
3. **Automatically clean up** old branches

Example workflow:
```bash
# Create a branch for preview
neonctl branches create --name preview-feature-x

# Use the branch connection string in Vercel preview environment
# Deploy and test

# Delete the branch when done
neonctl branches delete preview-feature-x
```

### Scaling Considerations

As your application grows:

1. **Monitor connection pool usage** - upgrade Neon plan if needed
2. **Implement caching** for frequently accessed data
3. **Consider database indexes** for query performance
4. **Use Neon compute scaling** for variable workloads
5. **Consider Prisma Accelerate** for global deployments

## Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Neon Documentation](https://neon.tech/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Next.js Deployment Guide](https://nextjs.org/docs/deployment)

## Support

If you encounter issues:

1. Check the [Troubleshooting](#troubleshooting) section above
2. Review Vercel deployment logs
3. Check Neon connection logs in the dashboard
4. Open an issue in the project repository
