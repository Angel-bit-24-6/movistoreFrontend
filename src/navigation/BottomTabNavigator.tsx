import React from 'react';
import { createBottomTabNavigator, BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { CompositeScreenProps } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import StoreListScreen from '../features/stores/screens/StoreListScreen';
import CartScreen from '../features/cart/screens/CartScreen';
import LoginScreen from '../features/auth/screens/LoginScreen';
import { Ionicons } from '@expo/vector-icons'; // Para íconos
import Header from '../components/Layout/Header';
import { useAuth } from '../context/AuthContext'; // Importar useAuth
import ProductListScreen from '../features/products/screens/ProductListScreen'; // Re-importar ProductListScreen
import ProductDetailScreen from '../features/products/screens/ProductDetailScreen'; // Re-importar ProductDetailScreen

export type PublicProductStackParamList = {
  ProductList: undefined;
  ProductDetail: { productId: number };
};

const PublicProductStack = createNativeStackNavigator<PublicProductStackParamList>();

const PublicProductStackNavigator = () => {
  return (
    <PublicProductStack.Navigator screenOptions={{ headerShown: false }}>
      <PublicProductStack.Screen name="ProductList" component={ProductListScreen} />
      <PublicProductStack.Screen 
        name="ProductDetail" 
        component={ProductDetailScreen} 
        options={({ route }) => ({
          headerShown: true,
          header: ({ navigation }) => (
            <Header title="Detalle del Producto" canGoBack />
          ),
        })}
      />
    </PublicProductStack.Navigator>
  );
};

export type BottomTabParamList = {
  HomeTab: undefined;
  ProductsTab: undefined; // Reintroducido
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
        headerShown: false, // Desactivar el header para la navegación por pestañas
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
        component={PublicProductStackNavigator}
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
