import { z } from 'zod';

export const createBucketSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  size: z.number().positive('Size must be positive').or(
    z.string().transform((val) => {
      const num = parseFloat(val);
      if (isNaN(num)) throw new Error('Invalid number');
      return num;
    })
  ),
  period: z.enum(['monthly', 'yearly']),
});

export const updateBucketSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  size: z.number().positive().or(
    z.string().transform((val) => {
      const num = parseFloat(val);
      if (isNaN(num)) throw new Error('Invalid number');
      return num;
    })
  ).optional(),
  period: z.enum(['monthly', 'yearly']).optional(),
});

export const updateTransactionSchema = z.object({
  bucketId: z.string().uuid().nullable(),
});

export type CreateBucketInput = z.infer<typeof createBucketSchema>;
export type UpdateBucketInput = z.infer<typeof updateBucketSchema>;
export type UpdateTransactionInput = z.infer<typeof updateTransactionSchema>;
