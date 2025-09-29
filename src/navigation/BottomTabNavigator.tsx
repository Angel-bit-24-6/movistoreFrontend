import React from 'react';
import { createBottomTabNavigator, BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { CompositeScreenProps } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ProductListScreen from '../features/products/screens/ProductListScreen';
import ProductDetailScreen from '../features/products/screens/ProductDetailScreen';
import HomeScreen from '../screens/HomeScreen';
import StoreListScreen from '../features/stores/screens/StoreListScreen';
import CartScreen from '../features/cart/screens/CartScreen';
import LoginScreen from '../features/auth/screens/LoginScreen';
import { Ionicons } from '@expo/vector-icons'; // Para íconos
import Header from '../components/Layout/Header';
import { useAuth } from '../context/AuthContext'; // Importar useAuth

export type PublicProductStackParamList = {
  ProductList: undefined;
  ProductDetail: { productId: number };
};

const PublicProductStack = createNativeStackNavigator<PublicProductStackParamList>();

const PublicProductStackNavigator = () => {
  return (
    <PublicProductStack.Navigator screenOptions={{ headerShown: false }}>
      <PublicProductStack.Screen name="ProductList" component={ProductListScreen} />
      <PublicProductStack.Screen name="ProductDetail" component={ProductDetailScreen} />
    </PublicProductStack.Navigator>
  );
};

export type BottomTabParamList = {
  HomeTab: undefined;
  ProductsTab: undefined; // Renderizará PublicProductStackNavigator
  StoresTab: undefined;
  CartTab?: undefined; // Opcional
  LoginTab?: undefined; // Opcional
};

const Tab = createBottomTabNavigator<BottomTabParamList>();

// No necesitamos CompositeScreenProps aquí si no estamos componiendo con otro stack fuera de este navegador de pestañas
// La navegación a ProductDetail se hará dentro de PublicProductStackNavigator
type BottomTabNavigatorProps = BottomTabScreenProps<BottomTabParamList, 'HomeTab'>;

const BottomTabNavigator = () => {
  const { isAuthenticated } = useAuth(); // Obtener el estado de autenticación

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: true, // Mostrar header superior para cada tab
        header: ({ navigation, route }) => (
          <Header 
            title={route.name === 'HomeTab' ? 'MoviStore' :
                   route.name === 'ProductsTab' ? 'Productos' :
                   route.name === 'StoresTab' ? 'Sucursales' :
                   route.name === 'CartTab' ? 'Tu Carrito' :
                   route.name === 'LoginTab' ? 'Iniciar Sesión' :
                   'MoviStore'} // Eliminar RegisterTab del switch
            canGoBack={navigation.canGoBack()}
            showDrawerToggleButton={false} // Siempre falso para navegación pública
            // publicNavConfig no se pasa aquí, los tabs son la navegación
          />
        ),
        tabBarActiveTintColor: '#1d4ed8',
        tabBarInactiveTintColor: '#6b7280',
        tabBarStyle: { paddingBottom: 5, paddingTop: 5, height: 60 },
        tabBarLabelStyle: { fontSize: 12 },
      }}
    >
      <Tab.Screen 
        name="HomeTab"
        component={HomeScreen}
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen 
        name="ProductsTab"
        component={PublicProductStackNavigator} // Usa el stack interno para productos
        options={{
          title: 'Productos',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="cube" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen 
        name="StoresTab"
        component={StoreListScreen}
        options={{
          title: 'Sucursales',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="business" color={color} size={size} />
          ),
        }}
      />
      {isAuthenticated && (
        <Tab.Screen 
          name="CartTab"
          component={CartScreen}
          options={{
            title: 'Carrito',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="cart" color={color} size={size} />
            ),
          }}
        />
      )}
      {!isAuthenticated && (
        <Tab.Screen 
          name="LoginTab"
          component={LoginScreen}
          options={{
            title: 'Login',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="person" color={color} size={size} />
            ),
          }}
        />
      )}
    </Tab.Navigator>
  );
};

export default BottomTabNavigator;
