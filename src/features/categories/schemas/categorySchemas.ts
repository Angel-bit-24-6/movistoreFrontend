import { z } from 'zod';

export const createCategorySchema = z.object({
  name: z.string().min(3, "El nombre debe tener al menos 3 caracteres").max(100, "El nombre no puede exceder los 100 caracteres"),
  description: z.string().max(1000, "La descripción no puede exceder los 1000 caracteres").optional(),
});

export const updateCategorySchema = z.object({
  name: z.string().min(3, "El nombre debe tener al menos 3 caracteres").max(100, "El nombre no puede exceder los 100 caracteres").optional(),
  description: z.string().max(1000, "La descripción no puede exceder los 1000 caracteres").optional(),
  status: z.enum(['active', 'archived']).optional(),
});

export type CreateCategorySchemaType = z.infer<typeof createCategorySchema>;
export type UpdateCategorySchemaType = z.infer<typeof updateCategorySchema>;
