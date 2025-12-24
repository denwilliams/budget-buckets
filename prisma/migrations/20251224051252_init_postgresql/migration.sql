-- CreateTable
CREATE TABLE "Bucket" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "size" DOUBLE PRECISION NOT NULL,
    "period" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Bucket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "description" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "bucketId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_bucketId_fkey" FOREIGN KEY ("bucketId") REFERENCES "Bucket"("id") ON DELETE SET NULL ON UPDATE CASCADE;

