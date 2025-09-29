import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Header from '../../../../src/components/Layout/Header';
import OrderItem from '../components/OrderItem';
import { getOrderById } from '../services/ordersService';
import { Order } from '../../../../src/types';
import { MainStackParamList } from '../../../../src/navigation/MainStack';
import { useAuth } from '../../../../src/context/AuthContext';
import { useToast } from '../../../../src/context/ToastContext';

type OrderDetailScreenProps = NativeStackScreenProps<MainStackParamList, 'OrderDetail'>;

const OrderDetailScreen = ({ route }: OrderDetailScreenProps) => {
  const { orderId } = route.params;
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { showToast } = useToast();

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const fetchedOrder = await getOrderById(orderId);
        setOrder(fetchedOrder);
      } catch (err) {
        const errorMessage = (err instanceof Error) ? err.message : 'Error al cargar los detalles de la orden.';
        setError(errorMessage);
        showToast('error', 'Error de carga', errorMessage);
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrderDetails();
  }, [orderId, showToast]);

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-100">
        <ActivityIndicator size="large" color="#0000ff" />
        <Text className="mt-2 text-gray-600">Cargando detalles de la orden...</Text>
      </View>
    );
  }

  if (error || !order) {
    return (
      <View className="flex-1 items-center justify-center bg-red-100 p-4">
        <Text className="text-red-700 text-lg font-bold mb-2">Error</Text>
        <Text className="text-red-600 text-center">{error || 'No se encontraron detalles de la orden.'}</Text>
        <TouchableOpacity onPress={() => {}} className="mt-4 px-4 py-2 bg-red-500 rounded-lg">
          <Text className="text-white font-bold">Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <Header title={`Orden #${order.id}`} canGoBack />

      <ScrollView className="p-4">
        <View className="bg-white rounded-lg shadow-md p-4 mb-4">
          <Text className="text-xl font-bold text-gray-800 mb-2">Detalles de la Orden</Text>
          <Text className="text-base text-gray-700 mb-1">Estado: <Text className="font-semibold">{order.status}</Text></Text>
          <Text className="text-base text-gray-700 mb-1">Total: <Text className="font-semibold">${(order.total || 0).toFixed(2)}</Text></Text>
          <Text className="text-base text-gray-700 mb-1">Tienda: <Text className="font-semibold">{order.store_name}</Text></Text>
          {user?.role === 'admin' && order.user_name && (
            <Text className="text-base text-gray-700 mb-1">Cliente: <Text className="font-semibold">{order.user_name}</Text></Text>
          )}
          <Text className="text-base text-gray-700">Fecha: <Text className="font-semibold">{new Date(order.created_at).toLocaleDateString()}</Text></Text>
        </View>

        <Text className="text-xl font-bold text-gray-800 mb-3">Productos en la Orden</Text>
        {order.items && order.items.length > 0 ? (
          order.items.map((item) => (
            <OrderItem 
              key={item.product_id}
              product_name={item.product_name || 'Producto Desconocido'} // Asegurarse de que no sea null
              unit_price={item.unit_price}
              quantity={item.quantity}
            />
          ))
        ) : (
          <Text className="text-gray-500 text-base">No hay productos en esta orden.</Text>
        )}
      </ScrollView>
    </View>
  );
};

export default OrderDetailScreen;
