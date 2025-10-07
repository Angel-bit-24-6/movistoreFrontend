import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import DrawerNavigator, { DrawerParamList } from './DrawerNavigator'; // Importar el DrawerNavigator y su ParamList
import ProductDetailScreen from '../features/products/screens/ProductDetailScreen'; // Asegúrate de importar
import OrderDetailScreen from '../features/orders/screens/OrderDetailScreen'; // Asegúrate de importar
import CheckoutScreen from '../features/checkout/screens/CheckoutScreen'; // Importar CheckoutScreen
import ProductAdminDetailScreen from '../features/products/screens/ProductAdminDetailScreen'; // Importar ProductAdminDetailScreen
import Header from '../components/Layout/Header'; // Importar Header
import { useNavigation } from '@react-navigation/native'; // Importar useNavigation
// import BottomTabNavigator, { BottomTabParamList } from './BottomTabNavigator'; // Eliminado: no se usa aquí
// import { useAuth } from '../context/AuthContext'; // Eliminado: no se usa aquí

export type MainStackParamList = {
  Drawer: { screen: keyof DrawerParamList; params?: any } | undefined; // Mantener Drawer como la ruta principal para autenticados
  ProductDetail: { productId: number };
  OrderDetail: { orderId: number };
  ProductAdminDetail: { productId?: number; selectedStoreId?: number | null };
  // Cart: undefined; // Posiblemente ya no sea necesario si CartDrawer es el principal
  Checkout: undefined; 
};

const MainStack = createNativeStackNavigator<MainStackParamList>();

const MainNavigator = () => {
  // const { isAuthenticated } = useAuth(); // Eliminado: la lógica de autenticación se maneja en AppContent

  return (
    <MainStack.Navigator screenOptions={{ headerShown: false }}>
      <MainStack.Screen name="Drawer" component={DrawerNavigator} />
      <MainStack.Screen 
        name="ProductDetail" 
        component={ProductDetailScreen} 
        options={({ route }) => ({
            headerShown: true,
            header: ({ navigation }) => (
              <Header title="Detalle del Producto" canGoBack /> // Título fijo
            ),
          })}
        />
        <MainStack.Screen 
          name="OrderDetail" 
          component={OrderDetailScreen} 
          options={({ route }) => ({
            headerShown: true,
            header: ({ navigation }) => (
              <Header title={route.params.orderId ? `Orden #${route.params.orderId}` : 'Detalle de la Orden'} canGoBack />
            ),
          })}
        />
        <MainStack.Screen 
          name="Checkout" 
          component={CheckoutScreen}
          options={{ 
            headerShown: true,
            header: ({ navigation }) => (
              <Header title="Checkout" canGoBack />
            ),
          }}
        />
        <MainStack.Screen 
          name="ProductAdminDetail" 
          component={ProductAdminDetailScreen} 
          options={({ route }) => ({
            headerShown: true,
            header: ({ navigation }) => (
              <Header title={route.params.productId ? `Editar Producto #${route.params.productId}` : 'Crear Producto'} canGoBack />
            ),
          })}
        />
      </MainStack.Navigator>
    );
};

export default MainNavigator;
