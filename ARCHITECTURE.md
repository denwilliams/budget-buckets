# Architecture & Best Practices

## Project Structure

```
budget-buckets/
├── app/
│   ├── api/              # API routes (thin controllers)
│   └── [pages]/          # Next.js pages
├── lib/
│   ├── services/         # Business logic (testable)
│   │   ├── bucket-service.ts
│   │   ├── transaction-service.ts
│   │   ├── dashboard-service.ts
│   │   └── __tests__/    # Unit tests
│   ├── container.ts      # Dependency injection container
│   ├── with-container.ts # DI wrapper for routes
│   ├── types.ts          # TypeScript type definitions
│   ├── validation.ts     # Zod validation schemas
│   ├── errors.ts         # Custom error classes
│   ├── error-handler.ts  # Centralized error handling
│   └── prisma.ts         # Prisma client factory
└── prisma/
    └── schema.prisma     # Database schema
```

## Dependency Injection Pattern

### Container (`lib/container.ts`)

The DI container manages all dependencies:

```typescript
export interface Container {
  prisma: PrismaClient;
  bucketService: BucketService;
  transactionService: TransactionService;
  dashboardService: DashboardService;
}
```

### Usage in Routes

```typescript
// app/api/buckets/route.ts
import { withContainer } from '@/lib/with-container';
import { Container } from '@/lib/container';

async function getHandler(
  request: NextRequest,
  { bucketService }: Container
) {
  const buckets = await bucketService.getAllBuckets();
  return NextResponse.json(buckets);
}

export const GET = withContainer(getHandler);
```

## Service Layer

Business logic is extracted into service classes for testability:

### BucketService
- `getAllBuckets()`: Fetch all buckets with transactions
- `getBucketById(id)`: Fetch single bucket
- `createBucket(data)`: Create new bucket
- `updateBucket(id, data)`: Update bucket
- `deleteBucket(id)`: Delete bucket

### DashboardService
- `getDashboardData()`: Calculate dashboard metrics
- Private methods for date calculations, status determination

### Benefits
- ✅ **Testable in isolation** with mocked dependencies
- ✅ **Single responsibility** - each service has one job
- ✅ **Reusable** - can be used from any route or background job
- ✅ **Type safe** - proper TypeScript types throughout

## Validation with Zod

Input validation happens before business logic:

```typescript
// lib/validation.ts
export const createBucketSchema = z.object({
  name: z.string().min(1).max(100),
  size: z.number().positive(),
  period: z.enum(['monthly', 'yearly']),
});

// In route
const validatedData = createBucketSchema.parse(body); // throws if invalid
```

Benefits:
- ✅ **Type inference** - TypeScript types from schemas
- ✅ **Clear error messages** - user-friendly validation errors
- ✅ **Runtime safety** - catches invalid data before it reaches DB

## Error Handling

### Custom Error Classes

```typescript
throw new NotFoundError('Bucket', id);
throw new ValidationError('Invalid input', errors);
```

### Centralized Handler

All errors are handled consistently:

```typescript
// lib/error-handler.ts
export function handleError(error: unknown): NextResponse {
  // Handles: Zod errors, Prisma errors, custom AppErrors
  // Returns proper HTTP status codes
}
```

## Testing Strategy

### Unit Tests (Services)

```typescript
// Mock Prisma client
const mockPrisma = {
  bucket: { findMany: vi.fn() }
} as unknown as PrismaClient;

// Test service in isolation
const service = new BucketService(mockPrisma);
```

### Running Tests

```bash
npm test              # Run once
npm run test:ui       # Interactive UI
npm run test:coverage # Coverage report
```

## Type Safety

### Prisma-Generated Types

```typescript
import { Bucket, Transaction } from '@prisma/client';

// Relationships
type BucketWithTransactions = Bucket & {
  transactions: Transaction[];
};
```

### Custom Domain Types

```typescript
// lib/types.ts
export type DashboardBucket = {
  id: string;
  name: string;
  status: 'good' | 'warning' | 'critical';
  // ...
};
```

## Next Steps (Recommended)

### High Priority

1. **Finish Refactoring Routes**
   - Update remaining API routes to use services
   - Add validation to all routes
   - Replace remaining 'any' types

2. **Add More Tests**
   - BucketService tests
   - TransactionService tests
   - Integration tests for API routes

3. **Create Migration**
   ```bash
   npx prisma migrate dev --name init_postgresql
   ```

### Medium Priority

4. **Repository Pattern** (Optional)
   - Abstract database operations further
   - Makes switching databases easier

5. **Logging**
   - Structured logging with context
   - Production-ready logging (Winston, Pino)

6. **Configuration Management**
   - Type-safe config loading
   - Environment-specific configs

### Nice to Have

7. **API Documentation**
   - OpenAPI/Swagger spec
   - Auto-generated from types

8. **E2E Tests**
   - Playwright for full user flows
   - Test against real database

## Best Practices

### Do's ✅
- Keep routes thin (validation → service → response)
- Test business logic in services
- Use proper TypeScript types (no 'any')
- Validate all external inputs
- Handle errors with custom classes

### Don'ts ❌
- Don't put business logic in routes
- Don't use 'any' types
- Don't skip validation
- Don't use global singletons
- Don't catch and ignore errors

## Testing Examples

See `lib/services/__tests__/dashboard-service.test.ts` for:
- Mocking Prisma client
- Testing service methods
- Testing edge cases
- Testing date calculations

## Questions?

This architecture supports:
- Easy unit testing
- Clear separation of concerns
- Type safety throughout
- Consistent error handling
- Scalable codebase growth
