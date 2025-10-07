import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity, Alert, Switch, TextInput, TouchableWithoutFeedback, Keyboard, Platform } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { Picker } from '@react-native-picker/picker';
import { useProducts } from '../hooks/useProducts';
import ProductCard from '../components/ProductCard';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import { useStore } from '../../../context/StoreContext';
import { softDeleteProduct, restoreProduct } from '../services/productsService';
import { Product } from '../../../types';
import { useCategories } from '../../categories/hooks/useCategories';
import CategorySelector from '../../categories/components/CategorySelector';
import Pagination from '../../../components/Layout/Pagination';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';

type ProductListScreenProps = NativeStackScreenProps<any>;

const ProductListScreen = ({ navigation }: ProductListScreenProps) => {
  const [showArchived, setShowArchived] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [pendingSearchTerm, setPendingSearchTerm] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  
  // 🔥 NUEVOS ESTADOS PARA PREVENIR RACE CONDITIONS
  const [isTogglingArchived, setIsTogglingArchived] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isMountedRef = useRef(true);
  const debounceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { products, isLoading, error, fetchProducts, currentPage, totalPages, totalItems, limit, setPage, setLimit } = useProducts(showArchived, searchTerm, selectedCategoryId);

  const { user } = useAuth();
  const { showToast } = useToast();
  const { stores, selectedStoreId, setSelectedStoreId, isLoadingStores, errorStores, fetchStores } = useStore();
  const { categories, isLoading: isLoadingCategories, error: errorCategories, fetchCategories } = useCategories();

  // 🔥 CLEANUP AL DESMONTAR
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  // 🔥 DEBOUNCE PARA FILTROS - EVITA RENDERIZADOS EXCESIVOS
  const debouncedFetchProducts = useCallback((archived: boolean, search: string, categoryId: number | null) => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    
    debounceTimeoutRef.current = setTimeout(() => {
      if (isMountedRef.current) {
        fetchProducts(archived, search, categoryId);
      }
    }, 300); // 300ms de delay
  }, [fetchProducts]);

  // 🔥 useEffect OPTIMIZADO
  useEffect(() => {
    debouncedFetchProducts(showArchived, searchTerm, selectedCategoryId);
  }, [showArchived, searchTerm, selectedCategoryId, debouncedFetchProducts]);

  // 🔥 useFocusEffect SIMPLIFICADO - SOLO CARGA INICIAL
  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const loadInitialData = async () => {
        try {
          if (isActive) {
            await Promise.all([
              fetchStores(),
              fetchCategories(false, '')
            ]);
          }
        } catch (error) {
          if (isActive) {
            console.error('Error loading initial data:', error);
          }
        }
      };

      loadInitialData();

      return () => {
        isActive = false;
      };
    }, [fetchStores, fetchCategories]) // 🔥 AGREGAR DEPENDENCIAS NECESARIAS
  );

  const handlePendingSearchChange = (text: string) => {
    setPendingSearchTerm(text);
  };

  const handleSearchSubmit = useCallback(() => {
    setSearchTerm(pendingSearchTerm);
    setPage(1);
    Keyboard.dismiss();
  }, [pendingSearchTerm, setPage]);

  const handleStoreChange = useCallback((itemValue: string | null) => {
    setSelectedStoreId(itemValue ? parseInt(itemValue, 10) : null);
    setPage(1);
  }, [setSelectedStoreId, setPage]);

  const handleSelectCategory = useCallback((categoryId: number | null) => {
    setSelectedCategoryId(categoryId);
    setPage(1);
  }, [setPage]);

  // 🔥 TOGGLE ARCHIVADOS CON PROTECCIÓN
  const handleToggleArchived = useCallback(async (value: boolean) => {
    if (isTogglingArchived || isLoading) {
      return; // 🔥 PREVENIR MÚLTIPLES CLICKS
    }

    try {
      setIsTogglingArchived(true);
      setShowArchived(value);
      
      // 🔥 PEQUEÑO DELAY PARA EVITAR RACE CONDITIONS
      await new Promise(resolve => setTimeout(resolve, 100));
      
    } catch (error) {
      console.error('Error toggling archived:', error);
      setShowArchived(!value); // Revertir en caso de error
    } finally {
      if (isMountedRef.current) {
        setIsTogglingArchived(false);
      }
    }
  }, [isTogglingArchived, isLoading]);

  const handleEditProduct = useCallback((product: Product) => {
    navigation.navigate('ProductAdminDetail', { productId: product.id, selectedStoreId: selectedStoreId });
  }, [navigation, selectedStoreId]);

  const handleCreateProduct = useCallback(() => {
    navigation.navigate('ProductAdminDetail', {});
  }, [navigation]);

  const handleToggleProductStatus = useCallback((product: Product) => {
    if (isSubmitting) return; // 🔥 PREVENIR MÚLTIPLES OPERACIONES

    Alert.alert(
      product.status === 'active' ? 'Archivar Producto' : 'Restaurar Producto',
      `¿Estás seguro de que quieres ${product.status === 'active' ? 'archivar' : 'restaurar'} el producto "${product.name}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: product.status === 'active' ? 'Archivar' : 'Restaurar', onPress: async () => {
          if (isSubmitting) return;
          
          setIsSubmitting(true);
          try {
            if (product.status === 'active') {
              await softDeleteProduct(product.id);
              showToast('success', 'Producto Archivado', `El producto "${product.name}" ha sido archivado.`);
            } else {
              await restoreProduct(product.id);
              showToast('success', 'Producto Restaurado', `El producto "${product.name}" ha sido restaurado.`);
            }
            
            // 🔥 REFRESH CONTROLADO
            if (isMountedRef.current) {
              fetchProducts(showArchived, searchTerm, selectedCategoryId);
            }
          } catch (err) {
            const errorMessage = (err instanceof Error) ? err.message : 'Error al cambiar el estado del producto.';
            showToast('error', 'Error', errorMessage);
          } finally {
            if (isMountedRef.current) {
              setIsSubmitting(false);
            }
          }
        }, style: product.status === 'active' ? 'destructive' : 'default'
        },
      ]
    );
  }, [isSubmitting, showArchived, searchTerm, selectedCategoryId, fetchProducts, showToast]);

  if (isLoading || isLoadingCategories) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-100">
        <ActivityIndicator size="large" color="#0000ff" />
        <Text className="mt-2 text-gray-600">Cargando productos y categorías...</Text>
      </View>
    );
  }

  if (error || errorCategories) {
    return (
      <View className="flex-1 items-center justify-center bg-red-100 p-4">
        <Text className="text-red-700 text-lg font-bold mb-2">Error al cargar productos o categorías</Text>
        <Text className="text-red-600 text-center">{String(error || '') || String(errorCategories)}</Text>
        <TouchableOpacity onPress={() => { setPage(1); fetchProducts(showArchived, searchTerm, selectedCategoryId); }} className="mt-4 px-4 py-2 bg-red-500 rounded-lg">
          <Text className="text-white font-bold">Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const displayedProducts = products || [];

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View className="flex-1 bg-white">

        <View className="p-4 border-b border-gray-200 bg-gray-50">
        <View className="flex-row items-center mb-3">
          <TextInput
            className="flex-1 border border-gray-300 rounded-md p-2 text-gray-800 bg-white mr-2"
            placeholder="Buscar productos..."
            placeholderTextColor="#6B7280" // Un gris medio, similar a text-gray-500
            value={pendingSearchTerm}
            onChangeText={handlePendingSearchChange}
            onSubmitEditing={handleSearchSubmit}
            returnKeyType="search"
          />
          <TouchableOpacity
            onPress={handleSearchSubmit}
            className="bg-blue-600 p-2 rounded-md"
            disabled={isLoading}
          >
            <Ionicons name="search" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {isLoadingStores ? (
          <ActivityIndicator size="small" color="#0000ff" />
        ) : errorStores ? (
          <Text className="text-red-500 mb-3">Error al cargar tiendas: {errorStores}</Text>
        ) : (stores.length > 0 && selectedStoreId !== null) ? (
          <View className="mb-3">
            <Text className="text-base text-gray-700 mb-1">Seleccionar Sucursal:</Text>
            <View className={`border border-gray-300 rounded-md bg-white ${
              Platform.OS === 'ios' ? 'h-12' : 'h-auto'
            }`}>
              <Picker
                selectedValue={selectedStoreId ? selectedStoreId.toString() : null}
                onValueChange={handleStoreChange}
                style={{
                  height: Platform.OS === 'ios' ? 48 : 50,
                  width: '100%',
                  color: '#374151',
                  ...(Platform.OS === 'ios' && {
                    marginVertical: 0,
                    paddingVertical: 0,
                  })
                }}
                dropdownIconColor="#6B7280"
                itemStyle={Platform.OS === 'ios' ? {
                  height: 48,
                  fontSize: 16,
                  color: '#374151'
                } : undefined}
              >
                {stores.map((store) => (
                  <Picker.Item 
                    key={store.id} 
                    label={store.name} 
                    value={store.id.toString()}
                    color={Platform.OS === 'ios' ? '#374151' : undefined}
                  />
                ))}
              </Picker>
            </View>
          </View>
        ) : (stores.length === 0 && !isLoadingStores && !errorStores) ? (
          <Text className="text-gray-500 mb-3">No hay sucursales disponibles.</Text>
        ) : null}

        {isLoadingCategories ? (
          <ActivityIndicator size="small" color="#0000ff" className="mt-3" />
        ) : errorCategories ? (
          <Text className="text-red-500 mb-3">Error al cargar categorías: {errorCategories}</Text>
        ) : categories.length > 0 ? (
          <CategorySelector
            categories={categories}
            selectedCategoryId={selectedCategoryId}
            onSelectCategory={handleSelectCategory}
          />
        ) : (
          <Text className="text-gray-500 mt-3">No hay categorías disponibles.</Text>
        )}

        {user?.role === 'admin' && (
          <View className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-3 mt-4">
            <Text className="text-xl font-bold text-gray-800 mb-2 sm:mb-0">Administrar Productos</Text>
            <View className="flex flex-col sm:flex-row items-center">
              <View className="flex-row items-center mb-2 sm:mb-0 sm:mr-4">
                <Text className="text-base text-gray-700 mr-2">Mostrar Archivados:</Text>
                {/* 🔥 SWITCH PROTEGIDO */}
                <View className="flex-row items-center">
                  <Switch
                    onValueChange={handleToggleArchived}
                    value={showArchived}
                    disabled={isTogglingArchived || isLoading} // 🔥 DESHABILITAR DURANTE CARGA
                  />
                  {isTogglingArchived && (
                    <ActivityIndicator size="small" color="#0000ff" style={{ marginLeft: 8 }} />
                  )}
                </View>
              </View>
                <TouchableOpacity
                  onPress={handleCreateProduct}
                  className="bg-blue-600 px-4 py-2 rounded-md w-full sm:w-auto"
                  disabled={isSubmitting || isTogglingArchived}
                >
                  <Text className="text-white font-semibold text-center">Nuevo Producto</Text>
                </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      {displayedProducts.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <Text className="text-gray-500 text-lg">No hay productos {showArchived ? 'archivados' : 'activos'} para mostrar.</Text>
          {searchTerm && <Text className="text-gray-500 text-base mt-2">Intenta otra búsqueda.</Text>}
        </View>
      ) : (
          <FlatList
            data={displayedProducts}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <ProductCard
                product={item}
                onPress={() => navigation.navigate('ProductDetail', { productId: item.id })}
                onEdit={user?.role === 'admin' ? handleEditProduct : undefined}
                onToggleStatus={user?.role === 'admin' ? handleToggleProductStatus : undefined}
                selectedStoreId={selectedStoreId}
              />
            )}
            contentContainerClassName="p-4"
            numColumns={2}
            columnWrapperClassName="justify-between mb-4"
            keyboardDismissMode="on-drag"
            removeClippedSubviews={true} // 🔥 OPTIMIZACIÓN DE MEMORIA
            maxToRenderPerBatch={10} // 🔥 RENDERIZADO POR LOTES
            updateCellsBatchingPeriod={50} // 🔥 OPTIMIZACIÓN DE ACTUALIZACIONES
          />
      )}

      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setPage}
          isLoading={isLoading}
        />
      )}
      </View>
    </TouchableWithoutFeedback>
  );
};

export default ProductListScreen;
