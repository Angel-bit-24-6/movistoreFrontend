import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Picker } from '@react-native-picker/picker';
import { CompositeScreenProps } from '@react-navigation/native';
import { DrawerScreenProps } from '@react-navigation/drawer';
import { DrawerParamList } from '../../../../src/navigation/DrawerNavigator';
import { StackActions } from '@react-navigation/native'; // Importar StackActions

import Header from '../../../../src/components/Layout/Header';
import { useCart } from '../../../../src/context/CartContext';
import { useToast } from '../../../../src/context/ToastContext';
import { useStores } from '../../stores/hooks/useStores'; // Para la selección de tiendas
import { MainStackParamList } from '../../../../src/navigation/MainStack';
import { createOrder } from '../../orders/services/ordersService'; // Usaremos este servicio por ahora
import { OrderItemSchemaType } from '../../orders/schemas/orderSchemas';
import { useAuth } from '../../../../src/context/AuthContext';

type CheckoutScreenProps = NativeStackScreenProps<MainStackParamList, 'Checkout'>;

const CheckoutScreen = ({ navigation }: CheckoutScreenProps) => {
  const { cartItems, totalAmount, clearCart, isLoading: isCartLoading } = useCart();
  const { showToast } = useToast();
  const { stores, isLoading: isStoresLoading, error: storesError, fetchStores } = useStores(false);
  const { user } = useAuth();

  const [selectedStoreId, setSelectedStoreId] = useState<number | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    fetchStores();
  }, [fetchStores]);

  useEffect(() => {
    if (stores && stores.length > 0 && selectedStoreId === undefined) {
      setSelectedStoreId(stores[0].id); // Seleccionar la primera tienda por defecto
    }
  }, [stores, selectedStoreId]);

  const handleConfirmOrder = async () => {
    if (!user?.id) {
      showToast('error', 'Error', 'Debes iniciar sesión para realizar un pedido.');
      navigation.dispatch(StackActions.replace('Auth')); // Usar StackActions.replace para el Auth Stack
      return;
    }

    if (!selectedStoreId) {
      showToast('error', 'Error', 'Por favor, selecciona una tienda.');
      return;
    }

    if (cartItems.length === 0) {
      showToast('error', 'Carrito Vacío', 'No hay productos en tu carrito para proceder con la compra.');
      return;
    }

    setIsSubmitting(true);
    try {
      const orderItems: OrderItemSchemaType[] = cartItems.map(item => ({
        product_id: item.product.id,
        quantity: item.quantity,
      }));

      const orderData = {
        store_id: selectedStoreId,
        items: orderItems,
      };

      await createOrder(orderData);
      showToast('success', 'Orden Confirmada', 'Tu pedido ha sido realizado con éxito!');
      clearCart();
      navigation.navigate('Drawer', { screen: 'OrderListDrawer' }); // Redirigir a la lista de órdenes a través del Drawer
    } catch (err) {
      const errorMessage = (err instanceof Error) ? err.message : 'Error al confirmar la orden.';
      showToast('error', 'Error', errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isCartLoading || isStoresLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-100">
        <ActivityIndicator size="large" color="#0000ff" />
        <Text className="mt-2 text-gray-600">Cargando...</Text>
      </View>
    );
  }

  if (storesError) {
    return (
      <View className="flex-1 items-center justify-center bg-red-100 p-4">
        <Text className="text-red-700 text-lg font-bold mb-2">Error al cargar tiendas</Text>
        <Text className="text-red-600 text-center">{storesError}</Text>
        <TouchableOpacity onPress={() => fetchStores()} className="mt-4 px-4 py-2 bg-red-500 rounded-lg">
          <Text className="text-white font-bold">Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (cartItems.length === 0) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-100">
        <Text className="text-gray-500 text-xl">Tu carrito está vacío.</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Drawer', { screen: 'Products' })} className="mt-4 px-6 py-3 bg-blue-600 rounded-lg">
          <Text className="text-white text-lg font-bold">Explorar Productos</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <Header title="Checkout" canGoBack />

      <ScrollView className="flex-1 p-4">
        <Text className="text-2xl font-bold text-gray-800 mb-4">Resumen de la Orden</Text>

        {cartItems.map((item) => (
          <View key={item.product.id} className="flex-row items-center bg-white p-3 mb-3 rounded-lg shadow-sm">
            <Text className="flex-1 text-base text-gray-800">{item.product.name} ({item.quantity}x)</Text>
            <Text className="text-base font-semibold text-blue-600">${(item.product.price * item.quantity).toFixed(2)}</Text>
          </View>
        ))}

        <View className="mt-6 p-4 bg-gray-50 rounded-lg">
          <Text className="text-xl font-bold text-gray-800 mb-3">Seleccionar Tienda</Text>
          <View className="border border-gray-300 rounded-md bg-white">
            <Picker
              selectedValue={selectedStoreId}
              onValueChange={(itemValue: number | undefined) => setSelectedStoreId(itemValue)}
            >
              {stores.map(store => (
                <Picker.Item key={store.id} label={store.name} value={store.id} />
              ))}
            </Picker>
          </View>
        </View>

        <View className="mt-6 border-t border-gray-200 pt-4">
          <View className="flex-row justify-between mb-4">
            <Text className="text-xl font-bold text-gray-800">Total a Pagar:</Text>
            <Text className="text-xl font-bold text-blue-600">${totalAmount.toFixed(2)}</Text>
          </View>

          <TouchableOpacity
            onPress={handleConfirmOrder}
            className={`bg-green-600 p-4 rounded-lg items-center ${isSubmitting ? 'opacity-50' : ''}`}
            disabled={isSubmitting || cartItems.length === 0 || !selectedStoreId}
          >
            {isSubmitting ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white text-lg font-bold">Confirmar Compra</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

export default CheckoutScreen;
