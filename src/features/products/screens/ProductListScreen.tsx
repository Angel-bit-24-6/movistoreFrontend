import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity, Alert, Switch, TextInput } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Picker } from '@react-native-picker/picker';
import { useProducts } from '../hooks/useProducts';
import ProductCard from '../components/ProductCard';
import { ProductStackParamList } from '../navigation/ProductStackNavigator';
import { useAuth } from '../../../../src/context/AuthContext';
import { useToast } from '../../../../src/context/ToastContext';
import { useStore } from '../../../../src/context/StoreContext';
import { softDeleteProduct, restoreProduct } from '../services/productsService';
import { Product } from '../../../../src/types';
import { useCategories } from '../../categories/hooks/useCategories';
import CategorySelector from '../../categories/components/CategorySelector';
import Pagination from '../../../../src/components/Layout/Pagination';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native'; // Importar useFocusEffect

type ProductListScreenProps = NativeStackScreenProps<ProductStackParamList, 'ProductList'>;

const ProductListScreen = ({ navigation }: ProductListScreenProps) => {
  const [showArchived, setShowArchived] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [pendingSearchTerm, setPendingSearchTerm] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);

  const { products, isLoading, error, fetchProducts, currentPage, totalPages, totalItems, limit, setPage, setLimit } = useProducts(showArchived, searchTerm, selectedCategoryId);

  const { user } = useAuth();
  const { showToast } = useToast();
  const { stores, selectedStoreId, setSelectedStoreId, isLoadingStores, errorStores, fetchStores } = useStore(); // Asume que useStore expone fetchStores
  const { categories, isLoading: isLoadingCategories, error: errorCategories, fetchCategories } = useCategories(); // Asume que useCategories expone fetchCategories
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchProducts(showArchived, searchTerm, selectedCategoryId);
  }, [showArchived, searchTerm, selectedCategoryId, fetchProducts]);

  useFocusEffect(
    useCallback(() => {
      // Refrescar tiendas, categorías y productos cuando la pantalla se enfoca
      fetchStores();
      fetchCategories(false, ''); // Pasar los parámetros por defecto si no son relevantes para el refresco inicial
      fetchProducts(showArchived, searchTerm, selectedCategoryId); // Refrescar productos

      // Opcional: limpiar cualquier estado al desenfocar
      return () => {
        // Por ejemplo, puedes resetear filtros o términos de búsqueda si lo deseas
      };
    }, [fetchStores, fetchCategories, fetchProducts, showArchived, searchTerm, selectedCategoryId]) // Añadir fetchProducts y sus dependencias
  );

  const handlePendingSearchChange = (text: string) => {
    setPendingSearchTerm(text);
  };

  const handleSearchSubmit = () => {
    setSearchTerm(pendingSearchTerm);
    setPage(1);
  };

  const handleStoreChange = (itemValue: string | null) => {
    setSelectedStoreId(itemValue ? parseInt(itemValue, 10) : null);
    setPage(1);
  };

  const handleSelectCategory = (categoryId: number | null) => {
    setSelectedCategoryId(categoryId);
    setPage(1);
  };

  const handleEditProduct = (product: Product) => {
    navigation.navigate('ProductAdminDetail', { productId: product.id, selectedStoreId: selectedStoreId });
  };

  const handleCreateProduct = () => {
    navigation.navigate('ProductAdminDetail', {});
  };

  const handleToggleProductStatus = (product: Product) => {
    Alert.alert(
      product.status === 'active' ? 'Archivar Producto' : 'Restaurar Producto',
      `¿Estás seguro de que quieres ${product.status === 'active' ? 'archivar' : 'restaurar'} el producto "${product.name}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: product.status === 'active' ? 'Archivar' : 'Restaurar', onPress: async () => {
            setIsSubmitting(true);
            try {
              if (product.status === 'active') {
                await softDeleteProduct(product.id);
                showToast('success', 'Producto Archivado', `El producto "${product.name}" ha sido archivado.`);
              } else {
                await restoreProduct(product.id);
                showToast('success', 'Producto Restaurado', `El producto "${product.name}" ha sido restaurado.`);
              }
              fetchProducts(showArchived, searchTerm, selectedCategoryId);
            } catch (err) {
              const errorMessage = (err instanceof Error) ? err.message : 'Error al cambiar el estado del producto.';
              showToast('error', 'Error', errorMessage);
            } finally {
              setIsSubmitting(false);
            }
          }, style: product.status === 'active' ? 'destructive' : 'default'
        },
      ]
    );
  };

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
            <View className="border border-gray-300 rounded-md bg-white">
              <Picker
                selectedValue={selectedStoreId ? selectedStoreId.toString() : null}
                onValueChange={handleStoreChange}
                style={{ height: 50, width: '100%', color: '#374151' }} // Añade color aquí para el texto del valor seleccionado
                dropdownIconColor="#6B7280" // Un color para el icono del dropdown, si quieres cambiarlo
              >
                {stores.map((store) => (
                  <Picker.Item key={store.id} label={store.name} value={store.id.toString()} />
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
                <Switch
                  onValueChange={value => setShowArchived(value)}
                  value={showArchived}
                />
              </View>
              <TouchableOpacity
                onPress={handleCreateProduct}
                className="bg-blue-600 px-4 py-2 rounded-md w-full sm:w-auto"
                disabled={isSubmitting}
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
  );
};

export default ProductListScreen;
