# Budget Buckets

A budget planning application that allows you to organize your expenses into buckets, upload credit card statements, and track your spending against time.

## Features

- **Budget Buckets**: Create monthly or yearly budget buckets with custom sizes
- **Statement Upload**: Upload credit card statements in CSV format
- **Smart Dashboard**: View all buckets with color-coded status indicators
  - Green: Spending is on track or below expected rate
  - Yellow: Spending is slightly ahead of schedule
  - Red: Spending is significantly ahead of schedule
- **Transaction Management**: Assign transactions to buckets and track spending

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- PostgreSQL 14+

### Installation

1. Clone the repository

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   Then edit `.env` and configure your database connection:
   ```
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/budget_buckets"
   NODE_ENV="development"
   ```

4. Start PostgreSQL using Docker Compose (recommended):
   ```bash
   docker-compose up -d
   ```

5. Set up the database:
   ```bash
   npx prisma migrate dev
   ```

6. Run the development server:
   ```bash
   npm run dev
   ```

7. Open [http://localhost:3000](http://localhost:3000) in your browser

### Environment Variables

The application validates required environment variables on startup. See `.env.example` for all available configuration options:

- `DATABASE_URL` (required): PostgreSQL connection string
- `NODE_ENV` (optional): Environment mode (development, production, test)
- `PORT` (optional): Server port
- `NEXT_PUBLIC_APP_URL` (optional): Public URL for the application

The application will fail to start if required environment variables are missing or invalid.

## Usage

1. **Create Buckets**: Navigate to the Buckets page and create your budget categories (e.g., Groceries, Entertainment)
2. **Upload Statements**: Go to Upload Statement and upload your credit card CSV file
3. **Assign Transactions**: Visit the Transactions page to assign each transaction to a bucket
4. **Monitor Dashboard**: Check the Dashboard to see your spending progress

## CSV Format

Your credit card statement CSV should include these columns (case-insensitive):
- Date
- Description
- Amount

Example:
```csv
Date,Description,Amount
2024-01-15,Grocery Store,125.50
2024-01-16,Gas Station,45.00
2024-01-17,Restaurant,67.30
```

## Technology Stack

- **Frontend**: Next.js 16, React 19, TypeScript
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL with Prisma ORM
- **CSV Parsing**: PapaParse
- **Validation**: Zod for runtime validation
- **Testing**: Vitest for unit tests
- **Architecture**:
  - Service Layer pattern for business logic
  - Dependency Injection for testability
  - Centralized error handling
  - Type-safe configuration validation

## Development

### Running Tests

```bash
npm test              # Run tests once
npm run test:ui       # Interactive test UI
npm run test:coverage # Coverage report
```

### Building

```bash
npm run build         # Production build
npm run start         # Start production server
```

### Architecture

See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed information about the codebase structure, patterns, and best practices.

## License

ISC
