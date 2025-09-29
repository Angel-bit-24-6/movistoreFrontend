import { z } from 'zod';

export const orderItemSchema = z.object({
  product_id: z.number().int().positive("El ID del producto debe ser un número entero positivo"),
  quantity: z.number().int().min(1, "La cantidad debe ser al menos 1"),
});

export const createOrderSchema = z.object({
  store_id: z.number().int().positive("El ID de la tienda debe ser un número entero positivo"),
  items: z.array(orderItemSchema).min(1, "La orden debe contener al menos un producto"),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(['pending', 'processing', 'shipped', 'delivered', 'cancelled'], "Estado de orden inválido"),
});

export type OrderItemSchemaType = z.infer<typeof orderItemSchema>;
export type CreateOrderSchemaType = z.infer<typeof createOrderSchema>;
export type UpdateOrderStatusSchemaType = z.infer<typeof updateOrderStatusSchema>;
