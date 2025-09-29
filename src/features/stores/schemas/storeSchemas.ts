import { z } from 'zod';

export const createStoreSchema = z.object({
  name: z.string().min(3, "El nombre debe tener al menos 3 caracteres").max(100, "El nombre no puede exceder los 100 caracteres"),
  address: z.string().max(500, "La dirección no puede exceder los 500 caracteres").optional().nullable(),
});

export const updateStoreSchema = z.object({
  name: z.string().min(3, "El nombre debe tener al menos 3 caracteres").max(100, "El nombre no puede exceder los 100 caracteres").optional(),
  address: z.string().max(500, "La dirección no puede exceder los 500 caracteres").optional().nullable(),
  status: z.enum(['active', 'archived']).optional(),
});

export type CreateStoreSchemaType = z.infer<typeof createStoreSchema>;
export type UpdateStoreSchemaType = z.infer<typeof updateStoreSchema>;
