import { z } from 'zod';

export const SortOptionEnum = z.enum([
  'rating_desc',
  'rating_asc',
  'fees_asc',
  'fees_desc',
  'name_asc',
  'name_desc',
  'rank_asc',
]);

export type SortOption = z.infer<typeof SortOptionEnum>;

export const collegeQuerySchema = z
  .object({
    search: z.string().optional(),
    location: z.string().optional(),
    minFees: z.coerce.number().int().min(0, 'minFees must be non-negative').optional(),
    maxFees: z.coerce.number().int().min(0, 'maxFees must be non-negative').optional(),
    minRating: z.coerce.number().min(0, 'minRating must be at least 0').max(5, 'minRating cannot exceed 5').optional(),
    sort: SortOptionEnum.default('rating_desc'),
    page: z.coerce.number().int().min(1, 'page must be at least 1').default(1),
    limit: z.coerce.number().int().min(1, 'limit must be at least 1').max(50, 'limit cannot exceed 50').default(12),
  })
  .refine(
    (data) => {
      if (data.minFees !== undefined && data.maxFees !== undefined) {
        return data.minFees <= data.maxFees;
      }
      return true;
    },
    {
      message: 'minFees cannot be greater than maxFees',
      path: ['minFees'],
    }
  );

export const compareQuerySchema = z
  .string()
  .min(1, 'ids query parameter is required')
  .transform((val) => val.split(',').map((id) => id.trim()).filter(Boolean))
  .refine((ids) => ids.length >= 2, {
    message: 'Comparison requires at least 2 colleges',
  })
  .refine((ids) => ids.length <= 3, {
    message: 'Comparison supports a maximum of 3 colleges',
  })
  .refine((ids) => new Set(ids).size === ids.length, {
    message: 'Duplicate college IDs are not permitted for comparison',
  });

export const saveCollegeSchema = z.object({
  collegeId: z.string().min(1, 'collegeId is required'),
  notes: z.string().max(1000, 'notes cannot exceed 1000 characters').optional(),
});

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const saveComparisonSchema = z.object({
  name: z.string().max(100, 'Comparison name cannot exceed 100 characters').optional(),
  collegeIds: z
    .array(z.string().min(1, 'College ID cannot be empty'))
    .min(2, 'Comparison requires at least 2 colleges')
    .max(3, 'Comparison supports a maximum of 3 colleges')
    .refine((ids) => new Set(ids).size === ids.length, {
      message: 'Duplicate college IDs are not permitted',
    }),
});

