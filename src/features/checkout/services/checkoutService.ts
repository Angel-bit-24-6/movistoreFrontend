import { createOrder } from '../../orders/services/ordersService';
import { CreateOrderSchemaType, OrderItemSchemaType } from '../../orders/schemas/orderSchemas';
import { Order } from '../../../../src/types';

interface CheckoutData {
  store_id: number;
  items: OrderItemSchemaType[];
}

export const processCheckout = async (checkoutData: CheckoutData): Promise<Order> => {
  try {
    // Aquí puedes añadir cualquier lógica adicional de pre-procesamiento si fuera necesario
    // Por ahora, simplemente llamamos al servicio de creación de órdenes
    const newOrder = await createOrder(checkoutData);
    return newOrder;
  } catch (error) {
    // @ts-ignore
    throw new Error(error.response?.data?.message || 'Error al procesar el checkout.');
  }
};
