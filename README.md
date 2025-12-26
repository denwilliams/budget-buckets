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

## Deployment

### Deploy to Vercel with Neon Postgres

This application is optimized for deployment on Vercel with Neon serverless Postgres.

#### Prerequisites

1. A [Vercel](https://vercel.com) account
2. A [Neon](https://neon.tech) account

#### Step-by-Step Deployment

1. **Create a Neon Database**
   - Go to [Neon Console](https://console.neon.tech/)
   - Create a new project
   - Note your connection strings (you'll need both):
     - **Pooled connection** (ends with `-pooler.region.neon.tech`) - for application runtime
     - **Direct connection** (ends with `.region.neon.tech`) - for migrations

2. **Deploy to Vercel**
   - Push your code to GitHub
   - Import your repository in Vercel
   - Configure environment variables in Vercel dashboard:
     ```
     DATABASE_URL=postgres://username:password@ep-xxxxx-pooler.us-east-1.neon.tech/dbname?sslmode=require
     DIRECT_URL=postgres://username:password@ep-xxxxx.us-east-1.neon.tech/dbname?sslmode=require
     NODE_ENV=production
     NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
     ```

3. **Run Database Migrations**
   - Locally, set your `DIRECT_URL` in `.env`:
     ```bash
     DIRECT_URL=postgres://username:password@ep-xxxxx.us-east-1.neon.tech/dbname?sslmode=require
     ```
   - Run migrations:
     ```bash
     npx prisma migrate deploy
     ```

4. **Deploy**
   - Vercel will automatically deploy your application
   - The build process will run `prisma generate` automatically

#### Important Notes

- **Connection Pooling**: The app uses Prisma's singleton pattern to prevent connection exhaustion in serverless environments
- **Pooled vs Direct URLs**: Always use the pooled connection (`-pooler`) for `DATABASE_URL` in production
- **SSL Mode**: Neon requires `?sslmode=require` in the connection string
- **Regions**: Consider deploying to the same region as your Neon database for lower latency

#### Vercel Configuration

The project includes a `vercel.json` with optimized settings for Next.js and Prisma:
- Automatic Prisma client generation during build
- Region configuration
- Environment variable handling

## License

MIT
