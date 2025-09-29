import { z } from 'zod';

export const stockSchema = z.object({
  store_id: z.number().int().positive("El ID de la sucursal debe ser un número positivo"),
  quantity: z.number().int().min(0, "La cantidad debe ser al menos 0"),
});

export const imageUploadFileSchema = z.object({
  uri: z.string().url("La URL de la imagen debe ser válida"),
  name: z.string().min(1, "El nombre de la imagen es requerido"),
  type: z.string().min(1, "El tipo de archivo de la imagen es requerido"),
});

export const createProductSchema = z.object({
  name: z.string().min(3, "El nombre debe tener al menos 3 caracteres").max(200, "El nombre no puede exceder los 200 caracteres"),
  description: z.string().max(2000, "La descripción no puede exceder los 2000 caracteres").optional(),
  price: z.number().positive("El precio debe ser un número positivo"),
  sku: z.string().max(80, "El SKU no puede exceder los 80 caracteres").optional(),
  category_id: z.number().int().positive("El ID de la categoría debe ser un número positivo")
    .nullable()
    .refine(val => val !== null, "La categoría es obligatoria"),
  initial_stock: z.array(stockSchema).min(1, "Debe especificar al menos un stock inicial para una sucursal"),
  images: z.array(imageUploadFileSchema).max(5, "Solo se permiten hasta 5 imágenes por producto").optional(), // Ahora valida objetos ImageUploadFile
});

export const updateProductSchema = z.object({
  name: z.string().min(3, "El nombre debe tener al menos 3 caracteres").max(200, "El nombre no puede exceder los 200 caracteres").optional(),
  description: z.string().max(2000, "La descripción no puede exceder los 2000 caracteres").optional(),
  price: z.number().positive("El precio debe ser un número positivo").optional(),
  sku: z.string().max(80, "El SKU no puede exceder los 80 caracteres").optional(),
  category_id: z.number().int().positive("El ID de la categoría debe ser un número positivo")
    .nullable()
    .refine(val => val !== null, "La categoría es obligatoria"), // MODIFICADO: Obligatorio, pero permite null inicialmente y luego lo rechaza
  status: z.enum(['active', 'archived']).optional(),
  images: z.array(imageUploadFileSchema).max(5, "Solo se permiten hasta 5 imágenes por producto").optional(),
});

export const updateProductStockSchema = z.object({
  store_id: z.number().int().positive("El ID de la sucursal debe ser un número positivo"),
  change: z.number().int("El cambio en la cantidad debe ser un número entero").refine(val => val !== 0, "El cambio en la cantidad no puede ser cero"),
  reason: z.string().min(3, "La razón debe tener al menos 3 caracteres").max(500, "La razón no puede exceder los 500 caracteres"),
});

export type StockSchemaType = z.infer<typeof stockSchema>;
export type CreateProductSchemaType = z.infer<typeof createProductSchema>;
export type UpdateProductSchemaType = z.infer<typeof updateProductSchema>;
export type UpdateProductStockSchemaType = z.infer<typeof updateProductStockSchema>;
