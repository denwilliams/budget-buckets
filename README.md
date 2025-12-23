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

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up the database:
   ```bash
   npx prisma migrate dev
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

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
- **Database**: SQLite with Prisma ORM
- **CSV Parsing**: PapaParse

## License

ISC
