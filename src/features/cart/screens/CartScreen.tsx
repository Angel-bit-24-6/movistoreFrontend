import React from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { useCart } from '../../../context/CartContext';
import { useStore } from '../../../context/StoreContext'; // Importar useStore
// import { Feather } from '@expo/vector-icons'; // Para íconos como trash, plus, minus
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import { createOrder } from '../../orders/services/ordersService';
import { NativeStackScreenProps, NativeStackNavigationProp } from '@react-navigation/native-stack'; // Importar de @react-navigation/native-stack y NativeStackNavigationProp
import { CompositeScreenProps } from '@react-navigation/native'; // Importar CompositeScreenProps
import { MainStackParamList } from '../../../navigation/MainStack';
import { DrawerParamList } from '../../../navigation/DrawerNavigator';
import { DrawerScreenProps, DrawerNavigationProp } from '@react-navigation/drawer'; // Importar DrawerScreenProps y DrawerNavigationProp
import { BottomTabParamList } from '../../../navigation/BottomTabNavigator'; // Importar BottomTabParamList
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs'; // Importar BottomTabScreenProps

type CartScreenProps = 
  BottomTabScreenProps<BottomTabParamList, 'CartTab'> | // Para cuando se usa en BottomTabNavigator
  DrawerScreenProps<DrawerParamList, 'CartDrawer'>; // Para cuando se usa en DrawerNavigator (autenticado)

const CartScreen = ({ navigation }: CartScreenProps) => {
  const { cartItems, clearCart, removeFromCart, updateCartItemQuantity, totalAmount, isLoading } = useCart();
  const { selectedStoreId } = useStore(); // Obtener selectedStoreId
  const { user } = useAuth(); // Obtener user del AuthContext
  const { showToast } = useToast(); // Obtener showToast del ToastContext
  const [isSubmitting, setIsSubmitting] = React.useState(false); // Nuevo estado de carga

  const handleProceedToCheckout = async () => { // Hacer la función asíncrona
    if (!user?.id) {
      (navigation as unknown as BottomTabScreenProps<BottomTabParamList, 'CartTab'>['navigation']).navigate('LoginTab'); // Navegar a la pestaña de Login
      showToast('info', 'Inicio de Sesión Requerido', 'Debes iniciar sesión para completar tu compra.');
      return;
    }
    if (user?.role === 'admin') {
      showToast('error', 'Error', 'Los administradores no pueden crear órdenes de compra.');
      return;
    }
    if (selectedStoreId === null) {
      showToast('error', 'Error', 'Por favor, selecciona una tienda antes de proceder al pago.');
      return;
    }
    if (cartItems.length === 0) {
      showToast('error', 'Error', 'Tu carrito está vacío.');
      return;
    }

    setIsSubmitting(true);
    try {
      const orderItems = cartItems.map(item => ({
        product_id: item.product.id,
        quantity: item.quantity,
      }));

      console.log('📦 Enviando orden al backend:', { userId: user.id, storeId: selectedStoreId, items: orderItems });
      const newOrder = await createOrder(user.id, selectedStoreId, orderItems);
      showToast('success', 'Orden Creada', `Tu orden #${newOrder.id} ha sido creada exitosamente.`);
      clearCart(); // Limpiar el carrito después de la orden
      (navigation as unknown as DrawerNavigationProp<DrawerParamList>).navigate('OrderListDrawer'); // Usar type assertion a través de unknown
    } catch (error) {
      const errorMessage = (error instanceof Error) ? error.message : 'Error al crear la orden.';
      showToast('error', 'Error', errorMessage);
      console.error('Error al procesar el pago:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) { // Eliminar isLoadingStores
    return (
      <View className="flex-1 items-center justify-center bg-gray-100">
        <ActivityIndicator size="large" color="#0000ff" />
        <Text className="mt-2 text-gray-600">Cargando carrito...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      {cartItems.length === 0 ? (
        <View className="flex-1 items-center justify-center p-4">
          <Text className="text-xl text-gray-600">Tu carrito está vacío.</Text>
          <Text className="text-md text-gray-500 mt-2">¡Añade algunos productos!</Text>
        </View>
      ) : (
        <FlatList
          data={cartItems}
          keyExtractor={(item) => item.product.id.toString()} // Volver al key original
          renderItem={({ item }) => (
            <View className="flex-row items-center bg-white p-4 mb-3 rounded-lg shadow-sm mx-4">
              <Image
                source={{ uri: item.product?.thumbnail_url || 'https://via.placeholder.com/80' }}
                className="w-20 h-20 rounded-md mr-4"
              />
              <View className="flex-1">
                <Text className="text-lg font-semibold text-gray-800" numberOfLines={2}>{item.product.name}</Text>
                <Text className="text-md text-blue-600 mt-1">${item.product.price.toFixed(2)}</Text>
                {/* Eliminar el texto de Sucursal ID */}
                <View className="flex-row items-center mt-2">
                  <TouchableOpacity
                    onPress={() => updateCartItemQuantity(item.product.id, item.quantity - 1)} // Volver a la llamada original
                    className="p-2 bg-gray-200 rounded-l-md"
                  >
                    <Text className="text-gray-700 font-bold text-lg">-</Text>
                  </TouchableOpacity>
                  <Text className="px-4 py-2 bg-gray-100 text-lg font-bold text-gray-800">{item.quantity}</Text>
                  <TouchableOpacity
                    onPress={() => updateCartItemQuantity(item.product.id, item.quantity + 1)} // Volver a la llamada original
                    className="p-2 bg-gray-200 rounded-r-md"
                  >
                    <Text className="text-gray-700 font-bold text-lg">+</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => removeFromCart(item.product.id)} // Volver a la llamada original
                    className="ml-4 p-2 bg-red-500 rounded-md"
                  >
                    <Text className="text-white font-bold">X</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
          contentContainerClassName="py-4"
        />
      )}

      {cartItems.length > 0 && user?.role !== 'admin' && ( // Ocultar el botón para admins
        <View className="border-t border-gray-200 p-4 bg-white shadow-lg">
          <View className="flex-row justify-between mb-3">
            <Text className="text-xl font-bold text-gray-800">Total:</Text>
            <Text className="text-xl font-bold text-blue-600">${totalAmount.toFixed(2)}</Text>
          </View>
          <TouchableOpacity
            onPress={handleProceedToCheckout}
            className={`bg-green-600 p-4 rounded-lg items-center ${isSubmitting ? 'opacity-50' : ''}`}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white text-lg font-bold">Proceder al Pago</Text>
            )}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default CartScreen;
