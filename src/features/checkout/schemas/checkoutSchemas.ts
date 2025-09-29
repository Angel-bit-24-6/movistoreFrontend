import { z } from 'zod';
import { orderItemSchema } from '../../orders/schemas/orderSchemas';

export const checkoutSchema = z.object({
  store_id: z.number().int().positive("El ID de la tienda debe ser un número entero positivo"),
  items: z.array(orderItemSchema).min(1, "El carrito no puede estar vacío."),
});

export type CheckoutSchemaType = z.infer<typeof checkoutSchema>;
