# Database Migrations

## Running Migrations on Live Deployments

This project includes an API endpoint to run Prisma migrations on live deployments without needing direct database access.

### Endpoint

```
POST /api/admin/migrate
```

### Authentication

The endpoint requires a secret token to prevent unauthorized access.

1. **Set the environment variable** `MIGRATION_SECRET` in your deployment environment:
   ```bash
   # Generate a secure random secret
   openssl rand -base64 32
   ```

2. **Add to your deployment** (e.g., Vercel):
   ```
   MIGRATION_SECRET=your-secure-random-secret-here
   ```

### Usage

#### Using curl

```bash
curl -X POST https://your-domain.com/api/admin/migrate \
  -H "Authorization: Bearer your-secure-random-secret-here"
```

#### Using fetch

```javascript
const response = await fetch('https://your-domain.com/api/admin/migrate', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer your-secure-random-secret-here'
  }
});

const result = await response.json();
console.log(result);
```

### Response

#### Success Response (200)
```json
{
  "success": true,
  "message": "Migrations applied successfully",
  "output": "Prisma Migrate applied the following migration(s):\n\nmigrations/\n  └─ 20251224051252_init_postgresql/\n    └─ migration.sql\n\n✔ Generated Prisma Client"
}
```

#### Error Response (401 - Unauthorized)
```json
{
  "error": "Unauthorized"
}
```

#### Error Response (500 - Migration Failed)
```json
{
  "success": false,
  "error": "Migration failed",
  "stdout": "...",
  "stderr": "..."
}
```

### When to Use

Call this endpoint:
- After deploying new code that includes database schema changes
- When you've added new migration files to the `prisma/migrations/` directory
- As part of your CI/CD pipeline after deployment

### Security Considerations

- ✅ Endpoint requires authentication via `MIGRATION_SECRET`
- ✅ Uses `DIRECT_URL` environment variable for migrations (required for Neon)
- ✅ Returns detailed error messages for debugging
- ⚠️ Keep your `MIGRATION_SECRET` secure and never commit it to version control
- ⚠️ Consider IP allowlisting or additional security measures for production

### Local Development

For local development, you can still use the standard Prisma CLI:

```bash
# Create a new migration
npx prisma migrate dev --name description_of_changes

# Apply pending migrations
npx prisma migrate deploy

# Reset database (WARNING: deletes all data)
npx prisma migrate reset
```

### Troubleshooting

#### "Migration endpoint not configured"
- Make sure `MIGRATION_SECRET` is set in your environment variables

#### "Unauthorized"
- Verify the `Authorization` header matches your `MIGRATION_SECRET`
- Check that the header format is `Bearer <secret>`

#### Migration fails with connection error
- Ensure `DIRECT_URL` is set correctly (required for Neon)
- Verify database is accessible from your deployment environment
- Check that the database user has sufficient permissions

#### Migration already applied
- This is normal - Prisma tracks which migrations have been applied
- The endpoint will show "No pending migrations" in the output
