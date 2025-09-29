import React, { createContext, useState, useContext, ReactNode, useCallback, useEffect } from 'react';
import { Product, CartItem } from '../types'; // Necesitarás definir CartItem en types.ts
import { useToast } from './ToastContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './AuthContext'; // Importar useAuth

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: Product, quantity: number) => void;
  removeFromCart: (productId: number) => void;
  updateCartItemQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalAmount: number;
  isLoading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider = ({ children }: CartProviderProps) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { showToast } = useToast();
  const { user, isAuthenticated, isLoading: isLoadingAuth } = useAuth(); // Obtener user, isAuthenticated y isLoadingAuth

  const getCartStorageKey = useCallback(() => {
    return user?.id ? `@movistore_cart_${user.id}` : null;
  }, [user]);

  // Cargar carrito del almacenamiento local al iniciar la app o cuando el usuario cambia
  useEffect(() => {
    const loadCart = async () => {
      if (isLoadingAuth) { // Esperar a que la autenticación haya terminado de cargar
        return;
      }

      const storageKey = getCartStorageKey();

      if (!isAuthenticated || !storageKey) {
        setCartItems([]); // Limpiar carrito si no hay usuario o clave de almacenamiento
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const storedCart = await AsyncStorage.getItem(storageKey);
        console.log(`🔍 Raw data from AsyncStorage for ${storageKey}:`, storedCart);

        if (storedCart) {
          const parsedCart = JSON.parse(storedCart);
          console.log('✅ Cart loaded from storage:', parsedCart);
          setCartItems(parsedCart);
        } else {
          console.log(`⚠️ No hay datos en AsyncStorage para ${storageKey}. Inicializando carrito vacío.`);
          setCartItems([]);
        }
      } catch (error) {
        console.error('❌ Error al cargar el carrito:', error);
        showToast('error', 'Error de Carrito', 'No se pudo cargar el carrito.');
        setCartItems([]); // En caso de error, asegurar que el carrito esté vacío
      } finally {
        setIsLoading(false);
      }
    };

    loadCart();
  }, [isAuthenticated, user, isLoadingAuth, getCartStorageKey, showToast]); // Dependencias actualizadas

  // Guardar carrito en el almacenamiento local cada vez que cambie, si hay un usuario autenticado
  useEffect(() => {
    if (!isLoading && isAuthenticated && user && !isLoadingAuth) {
      const storageKey = getCartStorageKey();
      if (storageKey) {
        AsyncStorage.setItem(storageKey, JSON.stringify(cartItems)).catch((error) => {
          console.error('Error saving cart to AsyncStorage:', error);
          showToast('error', 'Error de Carrito', 'No se pudo guardar el carrito.');
        });
      }
    }
  }, [cartItems, isLoading, isAuthenticated, user, isLoadingAuth, getCartStorageKey, showToast]); // Dependencias actualizadas

  const addToCart = useCallback((product: Product, quantity: number) => {
    if (!isAuthenticated || !user) {
      showToast('error', 'Acceso denegado', 'Debes iniciar sesión para añadir productos al carrito.');
      return;
    }
    setCartItems((prevItems) => {
      const existingItemIndex = prevItems.findIndex((item) => item.product.id === product.id);

      if (existingItemIndex > -1) {
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex].quantity += quantity;
        showToast('success', 'Carrito Actualizado', `Se añadió más de ${product.name} al carrito.`);
        return updatedItems;
      } else {
        showToast('success', 'Producto Añadido', `${product.name} se añadió al carrito.`);
        return [...prevItems, { product, quantity }];
      }
    });
  }, [showToast, isAuthenticated, user]); // Añadir isAuthenticated y user a las dependencias

  const removeFromCart = useCallback((productId: number) => {
    if (!isAuthenticated || !user) {
      showToast('error', 'Acceso denegado', 'Debes iniciar sesión para modificar el carrito.');
      return;
    }
    setCartItems((prevItems) => {
      showToast('info', 'Producto Eliminado', 'El producto ha sido eliminado del carrito.');
      return prevItems.filter((item) => item.product.id !== productId);
    });
  }, [showToast, isAuthenticated, user]); // Añadir isAuthenticated y user a las dependencias

  const updateCartItemQuantity = useCallback((productId: number, quantity: number) => {
    if (!isAuthenticated || !user) {
      showToast('error', 'Acceso denegado', 'Debes iniciar sesión para modificar el carrito.');
      return;
    }
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCartItems((prevItems) => {
      const existingItemIndex = prevItems.findIndex((item) => item.product.id === productId);
      if (existingItemIndex > -1) {
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex].quantity = quantity;
        showToast('info', 'Cantidad Actualizada', 'La cantidad del producto ha sido actualizada.');
        return updatedItems;
      }
      return prevItems;
    });
  }, [removeFromCart, showToast, isAuthenticated, user]); // Añadir isAuthenticated y user a las dependencias

  const clearCart = useCallback(async () => {
    if (!isAuthenticated || !user) {
      showToast('error', 'Acceso denegado', 'Debes iniciar sesión para vaciar el carrito.');
      return;
    }
    setCartItems([]);
    const storageKey = getCartStorageKey();
    if (storageKey) {
      await AsyncStorage.removeItem(storageKey);
      console.log(`🗑️ Cart for ${storageKey} cleared from storage.`);
    }
    showToast('info', 'Carrito Vaciado', 'Todos los productos han sido eliminados del carrito.');
  }, [showToast, isAuthenticated, user, getCartStorageKey]); // Añadir isAuthenticated, user y getCartStorageKey a las dependencias

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateCartItemQuantity,
        clearCart,
        totalItems,
        totalAmount,
        isLoading,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart debe ser usado dentro de un CartProvider');
  }
  return context;
};
