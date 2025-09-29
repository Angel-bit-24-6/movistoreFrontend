import React from 'react';
import { createNativeStackNavigator, NativeStackScreenProps } from '@react-navigation/native-stack';
import ProductListScreen from '../screens/ProductListScreen';
import ProductDetailScreen from '../screens/ProductDetailScreen';
import ProductAdminDetailScreen from '../screens/ProductAdminDetailScreen';

export type ProductStackParamList = {
  ProductList: undefined;
  ProductDetail: { productId: number };
  ProductAdminDetail: { productId?: number; selectedStoreId?: number | null }; // Añadir selectedStoreId
};

const ProductStack = createNativeStackNavigator<ProductStackParamList>();

const ProductStackNavigator = () => {

  return (
    <ProductStack.Navigator
      screenOptions={{ headerShown: false }} // Asegurar que no muestre su propio header
    >
      <ProductStack.Screen name="ProductList" component={ProductListScreen} />
      <ProductStack.Screen name="ProductDetail" component={ProductDetailScreen} />
      <ProductStack.Screen name="ProductAdminDetail" component={ProductAdminDetailScreen} />
    </ProductStack.Navigator>
  );
};

export default ProductStackNavigator;
