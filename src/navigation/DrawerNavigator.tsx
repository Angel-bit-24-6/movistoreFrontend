import React from 'react';
import { createDrawerNavigator, DrawerScreenProps } from '@react-navigation/drawer';
import { CompositeScreenProps } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import HomeScreen from '../screens/HomeScreen';
import CategoryListScreen from '../features/categories/screens/CategoryListScreen';
import StoreListScreen from '../features/stores/screens/StoreListScreen';
import OrderListScreen from '../features/orders/screens/OrderListScreen';
import AdminDashboardScreen from '../screens/AdminDashboardScreen';
import CustomerDashboardScreen from '../screens/CustomerDashboardScreen';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Layout/Header';
import CartScreen from '../features/cart/screens/CartScreen';
import ProductStackNavigator from '../features/products/navigation/ProductStackNavigator';

export type DrawerParamList = {
  HomeDrawer: undefined;
  Products: undefined; // Aquí se renderizará el ProductStackNavigator
  CategoryListDrawer: undefined;
  StoreListDrawer: undefined;
  OrderListDrawer: undefined; // Aquí se renderizará el OrderStackNavigator
  CartDrawer: undefined;
  AdminDashboardDrawer?: undefined; // Opcional para administradores
  CustomerDashboardDrawer?: undefined; // Opcional para clientes
};

const Drawer = createDrawerNavigator<DrawerParamList>();

// Definir un tipo para DrawerScreenProps combinado con MainStackParamList si fuera necesario
// type DrawerCompositeScreenProps<RouteName extends keyof DrawerParamList> = CompositeScreenProps<
//   DrawerScreenProps<DrawerParamList, RouteName>,
//   NativeStackScreenProps<MainStackParamList>
// >;

const DrawerNavigator = () => {
  const { user } = useAuth();

  return (
    <Drawer.Navigator
      screenOptions={{
        drawerActiveBackgroundColor: '#bfdbfe',
        drawerActiveTintColor: '#1d4ed8',
        drawerInactiveTintColor: '#374151',
        drawerLabelStyle: { marginLeft: -20, fontSize: 15 },
      }}
    >
      <Drawer.Screen
        name="HomeDrawer"
        component={HomeScreen}
        options={{
          title: 'MoviStore',
          headerShown: true,
          header: ({ navigation, route }) => <Header title="MoviStore" showDrawerToggleButton={true} />,
        }}
      />
      <Drawer.Screen
        name="Products" // Nombre que coincide con DrawerParamList
        component={ProductStackNavigator}
        options={{
          title: 'Productos',
          headerShown: true,
          header: ({ navigation, route }) => <Header title="Productos" showDrawerToggleButton={true} />,
        }}
      />
      {user && user.role === 'admin' && (
        <Drawer.Screen
          name="CategoryListDrawer"
          component={CategoryListScreen}
          options={{
            title: 'Categorías',
            headerShown: true,
            header: ({ navigation, route }) => <Header title="Categorías" canGoBack showDrawerToggleButton={true} />,
          }}
        />
      )}
      <Drawer.Screen
        name="StoreListDrawer"
        component={StoreListScreen}
        options={{
          title: 'Sucursales',
          headerShown: true,
          header: ({ navigation, route }) => <Header title="Sucursales" canGoBack showDrawerToggleButton={true} />,
        }}
      />
      <Drawer.Screen
        name="OrderListDrawer"
        component={OrderListScreen}
        options={{
          title: user?.role === 'admin' ? 'Órdenes' : 'Mis Órdenes',
          headerShown: true,
          header: ({ navigation, route }) => <Header title={user?.role === 'admin' ? 'Órdenes' : 'Mis Órdenes'} showDrawerToggleButton={true} />,
        }}
      />
      <Drawer.Screen
        name="CartDrawer"
        component={CartScreen}
        options={{
          title: 'Carrito',
          headerShown: true,
          header: ({ navigation, route }) => <Header title="Tu Carrito" showDrawerToggleButton={true} />,
        }}
      />

      {user && (
        <React.Fragment>
          {user.role === 'admin' && (
            <Drawer.Screen
              name="AdminDashboardDrawer"
              component={AdminDashboardScreen}
              options={{
                title: 'Panel de Admin',
                headerShown: true,
                header: ({ navigation, route }) => <Header title="Panel de Administración" showDrawerToggleButton={true} />,
              }}
            />
          )}
          {user.role === 'customer' && (
            <Drawer.Screen
              name="CustomerDashboardDrawer"
              component={CustomerDashboardScreen}
              options={{
                title: 'Account',
                headerShown: true,
                header: ({ navigation, route }) => <Header title="Settings Account" showDrawerToggleButton={true} />,
              }}
            />
          )}
        </React.Fragment>
      )}
    </Drawer.Navigator>
  );
};

export default DrawerNavigator;
