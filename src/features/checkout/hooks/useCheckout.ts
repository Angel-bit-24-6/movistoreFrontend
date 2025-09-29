import { useState, useCallback } from 'react';
import { useToast } from '../../../../src/context/ToastContext';
import { useCart } from '../../../../src/context/CartContext';
import { processCheckout } from '../services/checkoutService';
import { CheckoutSchemaType, checkoutSchema } from '../schemas/checkoutSchemas';
import { Order } from '../../../../src/types';
import { z } from 'zod';

interface UseCheckoutResult {
  isLoading: boolean;
  error: string | null;
  handleCheckout: (storeId: number) => Promise<Order | undefined>;
}

export const useCheckout = (): UseCheckoutResult => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();
  const { cartItems, clearCart } = useCart();

  const handleCheckout = useCallback(async (storeId: number): Promise<Order | undefined> => {
    setIsLoading(true);
    setError(null);

    try {
      if (cartItems.length === 0) {
        showToast('error', 'Carrito Vacío', 'No hay productos en tu carrito para realizar el checkout.');
        return undefined;
      }

      const orderItems = cartItems.map(item => ({
        product_id: item.product.id,
        quantity: item.quantity,
      }));

      const checkoutData = {
        store_id: storeId,
        items: orderItems,
      };

      // Validar con Zod antes de enviar al servicio
      checkoutSchema.parse(checkoutData);

      const newOrder = await processCheckout(checkoutData);
      showToast('success', 'Checkout Exitoso', 'Tu orden ha sido procesada con éxito!');
      clearCart();
      return newOrder;
    } catch (err) {
      if (err instanceof z.ZodError) {
        const formattedErrors = err.errors.map(e => e.message).join('; ');
        setError(formattedErrors);
        showToast('error', 'Error de Validación', formattedErrors);
      } else {
        const errorMessage = (err instanceof Error) ? err.message : 'Error desconocido al procesar el checkout.';
        setError(errorMessage);
        showToast('error', 'Error de Checkout', errorMessage);
      }
      return undefined;
    } finally {
      setIsLoading(false);
    }
  }, [cartItems, clearCart, showToast]);

  return {
    isLoading,
    error,
    handleCheckout,
  };
};
