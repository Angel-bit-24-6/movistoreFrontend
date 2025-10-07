import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, Image, ActivityIndicator, TouchableOpacity, Dimensions } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Header from '../../../components/Layout/Header';
import { getProductById } from '../services/productsService';
import { Product } from '../../../types';
import { MainStackParamList } from '../../../navigation/MainStack'; // Importar MainStackParamList
import { BottomTabParamList } from '../../../navigation/BottomTabNavigator'; // Importar BottomTabParamList

import { useToast } from '../../../context/ToastContext';
import { useCart } from '../../../context/CartContext';
import { useStore } from '../../../context/StoreContext';
import { useAuth } from '../../../context/AuthContext'; // Importar useAuth
import PagerView from 'react-native-pager-view'; // Importar PagerView
import { useNavigation } from '@react-navigation/native'; // Importar useNavigation
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs'; // Importar BottomTabScreenProps
import { CompositeScreenProps } from '@react-navigation/native'; // Importar CompositeScreenProps


type ProductDetailScreenProps = NativeStackScreenProps<MainStackParamList, 'ProductDetail'>;

// Definir el tipo de navegación para la pestaña pública
type ProductDetailScreenNavigationProp = CompositeScreenProps<
  NativeStackScreenProps<MainStackParamList>,
  BottomTabScreenProps<BottomTabParamList, 'ProductsTab'>
>['navigation'];

const { width } = Dimensions.get('window'); // Obtener el ancho de la ventana para las imágenes

const ProductDetailScreen = ({ route }: ProductDetailScreenProps) => {
  const { productId } = route.params;
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();
  const { addToCart } = useCart();
  const { selectedStoreId } = useStore();
  const [currentPage, setCurrentPage] = useState(0); // Estado para la página actual del carrusel
  const { user, isAuthenticated } = useAuth(); // Obtener el usuario autenticado y el estado de autenticación
  const navigation = useNavigation<ProductDetailScreenNavigationProp>(); // Obtener la navegación

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setIsLoading(true);
        const data = await getProductById(productId, selectedStoreId, user?.role === 'admin');
        setProduct(data);
        setCurrentPage(0); // Resetear la página a 0 cuando se carga un nuevo producto
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
        setError(errorMessage);
        showToast('error', 'Error de carga', `No se pudo cargar el producto: ${errorMessage}`, 3000);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [productId, showToast, selectedStoreId, user?.role]);

  const handlePageScroll = useCallback((e: any) => {
    setCurrentPage(e.nativeEvent.position);
  }, []);

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f3f4f6' }}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={{ marginTop: 8, color: '#4b5563' }}>Cargando detalles del producto...</Text>
      </View>
    );
  }

  if (error || !product) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fee2e2', padding: 16 }}>
        <Text style={{ color: '#b91c1c', fontSize: 18, fontWeight: 'bold', marginBottom: 8 }}>Error al cargar producto</Text>
        <Text style={{ color: '#dc2626', textAlign: 'center' }}>{error || 'Producto no encontrado.'}</Text>
      </View>
    );
  }

  let stockInSelectedStore: number | null = null;

  if (selectedStoreId !== null && product.stock_by_store && Array.isArray(product.stock_by_store) && product.stock_by_store.length > 0) {
    stockInSelectedStore = product.stock_by_store[0].quantity;
  }

  const stockInCurrentStoreText = (selectedStoreId !== null && stockInSelectedStore !== null)
    ? `Stock en esta sucursal: ${stockInSelectedStore}`
    : ``;

  const totalStockDetailText = `Stock Total: ${product.total_stock !== undefined && product.total_stock !== null ? product.total_stock : 'N/A'}`;

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      addToCart(product, 1);
      navigation.navigate('LoginTab'); // Redirigir a la pantalla de Login si no está autenticado
      return;
    }
    addToCart(product, 1); // Añadir al carrito si está autenticado
  };

  return (
    <View style={{ flex: 1, backgroundColor: 'white' }}>
      {/* <Header title={product.name} canGoBack /> */}{/* Eliminado el Header directo de la pantalla */}
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {product.images && product.images.length > 0 ? (
          <View style={{ width: '100%', height: 240, borderRadius: 8, marginBottom: 16, overflow: 'hidden', position: 'relative' }}>
            <PagerView style={{ flex: 1 }} initialPage={0} onPageSelected={handlePageScroll}>
              {product.images
                .filter(img => img.secure_url)
                .map((img) => {
                  return (
                    <View key={img.id} style={{ flex: 1 }}>
                      <Image
                        source={{ uri: img.secure_url }}
                        style={{ width: '100%', height: '100%' }}
                        resizeMode="cover"
                      />
                    </View>
                  );
                })}
            </PagerView>
            {/* Indicadores de página personalizados */}
            <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 8, position: 'absolute', bottom: 8, width: '100%' }}>
              {product.images
                .filter(img => img.secure_url)
                .map((_, index) => (
                  <View
                    key={index}
                    style={{ 
                      width: 8, 
                      height: 8, 
                      borderRadius: 4, 
                      marginHorizontal: 4, 
                      backgroundColor: index === currentPage ? '#3b82f6' : '#d1d5db'
                    }}
                  />
                ))}
            </View>
          </View>
        ) : (
          <View style={{ width: '100%', height: 240, backgroundColor: '#e5e7eb', borderRadius: 8, marginBottom: 16, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ color: '#6b7280' }}>No hay imagen disponible</Text>
          </View>
        )}

        <Text style={{ fontSize: 30, fontWeight: 'bold', color: '#1f2937', marginBottom: 8 }}>{product.name}</Text>
        <Text style={{ fontSize: 20, fontWeight: '600', color: '#2563eb', marginBottom: 16 }}>${product.price.toFixed(2)}</Text>

        <Text style={{ fontSize: 16, color: '#374151', lineHeight: 24, marginBottom: 16 }}>{product.description || 'Sin descripción disponible.'}</Text>

        <View style={{ marginBottom: 16 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#1f2937' }}>Stock Disponible:</Text>
          <Text style={{ fontSize: 16, color: '#4b5563', marginLeft: 8 }}>{stockInCurrentStoreText}</Text>
          {user?.role === 'admin' && (
            <Text style={{ fontSize: 16, color: '#4b5563', marginLeft: 8 }}>{totalStockDetailText}</Text>
          )}
          {(selectedStoreId === null || stockInSelectedStore === null) && (
            <Text style={{ fontSize: 14, color: '#ef4444', marginLeft: 8, marginTop: 4 }}>No hay stock en la sucursal seleccionada.</Text>
          )}
        </View>

        <TouchableOpacity
          onPress={handleAddToCart}
          style={{
            backgroundColor: selectedStoreId === null || stockInSelectedStore === null || stockInSelectedStore <= 0 ? '#ef4444' : '#22c55e',
            padding: 16,
            borderRadius: 8,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: 24
          }}
          disabled={selectedStoreId === null || stockInSelectedStore === null || stockInSelectedStore <= 0}
        >
          <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold', marginLeft: 8 }}>
            {selectedStoreId === null || stockInSelectedStore === null || stockInSelectedStore <= 0 ? 'Agotado!' : 'Añadir al Carrito'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default ProductDetailScreen;
