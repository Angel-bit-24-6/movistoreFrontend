import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import DrawerNavigator from './DrawerNavigator'; // Importar el DrawerNavigator
import ProductDetailScreen from '../features/products/screens/ProductDetailScreen'; // Asegúrate de importar
import OrderDetailScreen from '../features/orders/screens/OrderDetailScreen'; // Asegúrate de importar
import CheckoutScreen from '../features/checkout/screens/CheckoutScreen'; // Importar CheckoutScreen
import { DrawerParamList } from './DrawerNavigator'; // Importar DrawerParamList

export type MainStackParamList = {
  Drawer: { screen: keyof DrawerParamList; params?: any } | undefined;
  ProductDetail: { productId: number };
  OrderDetail: { orderId: number };
  Cart: undefined;
  Checkout: undefined; // Añadir Checkout a MainStackParamList
  // Añade aquí los parámetros para otras pantallas si es necesario
};

const MainStack = createNativeStackNavigator<MainStackParamList>();

const MainNavigator = () => {
  return (
    <MainStack.Navigator screenOptions={{ headerShown: false }}>
      <React.Fragment>
        <MainStack.Screen name="Drawer" component={DrawerNavigator} />
        <MainStack.Screen name="ProductDetail" component={ProductDetailScreen} />
        <MainStack.Screen name="OrderDetail" component={OrderDetailScreen} />
        <MainStack.Screen name="Checkout" component={CheckoutScreen} />
      </React.Fragment>
    </MainStack.Navigator>
  );
};

export default MainNavigator;
