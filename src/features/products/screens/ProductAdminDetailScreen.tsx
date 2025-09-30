import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, ActivityIndicator, Alert, Image, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Header from '../../../../src/components/Layout/Header';
import ProductForm from '../components/ProductForm';
import { CreateProductSchemaType, UpdateProductSchemaType, UpdateProductStockSchemaType } from '../schemas/productSchemas';
import { addProductImage, createProduct, getProductById, removeProductImage, setProductThumbnail, updateProduct, updateProductStock } from '../services/productsService';
import { useToast } from '../../../../src/context/ToastContext';
import { ImageUploadFile, Product, ProductStockByStore, Store } from '../../../../src/types';
import { ProductStackParamList } from '../navigation/ProductStackNavigator';
import { Modal, TextInput, Pressable } from 'react-native';
import { useStores } from '../../stores/hooks/useStores';

type ProductAdminDetailScreenProps = NativeStackScreenProps<ProductStackParamList, 'ProductAdminDetail'>;

interface StockAdjustmentInfo {
  storeId: number;
  storeName: string;
  currentQuantity: number;
}

const ProductAdminDetailScreen = ({ navigation, route }: ProductAdminDetailScreenProps) => {
  const { productId, selectedStoreId } = route.params || {};
  const isEditMode = !!productId;

  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(isEditMode);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();
  const { stores, isLoading: isLoadingStores, error: errorStores } = useStores();

  const [isStockModalVisible, setIsStockModalVisible] = useState(false);
  const [stockAdjustmentData, setStockAdjustmentData] = useState<StockAdjustmentInfo | null>(null);
  const [stockChangeInput, setStockChangeInput] = useState('0');

  useEffect(() => {
    const fetchProductDetails = async () => {
      console.log('ProductAdminDetailScreen: fetchProductDetails iniciado.');
      if (isEditMode && productId) {
        setIsLoading(true);
        try {
          const fetchedProduct = await getProductById(productId, selectedStoreId, true); // Pasar selectedStoreId
          setProduct(fetchedProduct);
          console.log('ProductAdminDetailScreen: Producto fetched. Imágenes existentes:', fetchedProduct.images?.length);
        } catch (err) {
          const errorMessage = (err instanceof Error) ? err.message : 'Error al cargar los detalles del producto.';
          setError(errorMessage);
          showToast('error', 'Error de carga', errorMessage);
        } finally {
          setIsLoading(false);
        }
      }
    };
    fetchProductDetails();
  }, [productId, isEditMode, showToast, selectedStoreId]);

  const handleFormSubmit = useCallback(async (
    data: CreateProductSchemaType | UpdateProductSchemaType,
    imagesToUpload: ImageUploadFile[]
  ) => {
    setIsSubmitting(true);
    setError(null);
    try {
      let updatedProduct: Product;

      if (isEditMode && productId) {
        console.log('ProductAdminDetailScreen: Modo edición. Actualizando producto con datos:', data);
        console.log('ProductAdminDetailScreen: Imágenes *nuevas* a enviar para actualización:', imagesToUpload.length);

        // Aquí, imagesToUpload son solo las imágenes *nuevas* que el usuario ha seleccionado.
        // El servicio updateProduct en el backend ya está preparado para manejar esto:
        // 1. Eliminará todas las imágenes existentes si se le pasa un array `files` con nuevas imágenes.
        // 2. Subirá las nuevas imágenes de `imagesToUpload`.
        updatedProduct = await updateProduct(productId, data as UpdateProductSchemaType, imagesToUpload);
        showToast('success', 'Producto Actualizado', `El producto "${updatedProduct.name}" ha sido actualizado.`);

      } else {
        console.log('ProductAdminDetailScreen: Modo creación. Creando producto con datos:', data);
        console.log('ProductAdminDetailScreen: Imágenes a subir en creación:', imagesToUpload.length);
        updatedProduct = await createProduct(data as CreateProductSchemaType, imagesToUpload);
        showToast('success', 'Producto Creado', `El producto "${updatedProduct.name}" ha sido creado con éxito.`);
      }

      // Esta lógica de bucle para addProductImage es ahora redundante y se elimina,
      // ya que updateProduct en el servicio maneja la actualización completa de imágenes.
      // if (isEditMode && imagesToUpload.length > 0) {
      //   for (let i = 0; i < imagesToUpload.length; i++) {
      //     const imageFile = imagesToUpload[i];
      //     const isThumbnail = (i === 0 && (!product?.images || product.images.length === 0));
      //     console.log(`ProductAdminDetailScreen: Subiendo nueva imagen ${i + 1}/${imagesToUpload.length}. Thumbnail: ${isThumbnail}`);
      //     await addProductImage(updatedProduct.id, imageFile, isThumbnail);
      //   }
      //   showToast('success', 'Imágenes Añadidas', 'Las nuevas imágenes han sido subidas.');
      // }

      if (updatedProduct.id) {
        const refreshedProduct = await getProductById(updatedProduct.id, selectedStoreId, true);
        setProduct(refreshedProduct);
        console.log('ProductAdminDetailScreen: Producto refrescado después del submit. Total imágenes:', refreshedProduct.images?.length);
      }

      navigation.goBack();
    } catch (err) {
      const errorMessage = (err instanceof Error) ? err.message : 'Error al guardar el producto.';
      setError(errorMessage);
      showToast('error', 'Error', errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  }, [isEditMode, productId, showToast, navigation, product, selectedStoreId]);

  const handleRemoveExistingImage = useCallback(async (imageId: number) => {
    if (!productId || !product) return;

    Alert.alert(
      "Eliminar Imagen",
      "¿Estás seguro de que quieres eliminar esta imagen del producto?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            setIsSubmitting(true);
            try {
              console.log('ProductAdminDetailScreen: Eliminando imagen. Product ID:', productId, 'Image ID:', imageId);
              await removeProductImage(productId, imageId);
              showToast('success', 'Imagen Eliminada', 'La imagen ha sido eliminada con éxito.');
              const refreshedProduct = await getProductById(productId, selectedStoreId, true);
              setProduct(refreshedProduct);
              console.log('ProductAdminDetailScreen: Producto refrescado después de eliminar imagen. Total imágenes:', refreshedProduct.images?.length);
            } catch (err) {
              const errorMessage = (err instanceof Error) ? err.message : 'Error al eliminar la imagen.';
              showToast('error', 'Error', errorMessage);
            } finally {
              setIsSubmitting(false);
            }
          },
        },
      ]
    );
  }, [productId, product, showToast, selectedStoreId]);

  const handleSetThumbnail = useCallback(async (imageId: number) => {
    if (!productId || !product) return;

    setIsSubmitting(true);
    try {
      console.log('ProductAdminDetailScreen: Estableciendo miniatura. Product ID:', productId, 'Image ID:', imageId);
      await setProductThumbnail(productId, imageId);
      showToast('success', 'Miniatura Actualizada', 'La miniatura del producto ha sido establecida.');
      const refreshedProduct = await getProductById(productId, selectedStoreId, true);
      setProduct(refreshedProduct);
      console.log('ProductAdminDetailScreen: Producto refrescado después de establecer miniatura. Total imágenes:', refreshedProduct.images?.length);
    } catch (err) {
      const errorMessage = (err instanceof Error) ? err.message : 'Error al establecer la miniatura.';
      showToast('error', 'Error', errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  }, [productId, product, showToast, selectedStoreId]);

  const handleUpdateStock = useCallback(async (storeId: number, change: number, reason: string) => {
    console.log('handleUpdateStock - Recibido:', { productId, storeId, change, reason });
    if (!productId || !product) return;

    setIsSubmitting(true);
    try {
      await updateProductStock(productId, { store_id: storeId, change: change, reason });
      showToast('success', 'Stock Actualizado', 'El stock del producto ha sido actualizado.');
      const refreshedProduct = await getProductById(productId, selectedStoreId, true);
      setProduct(refreshedProduct);
      setIsStockModalVisible(false);
      setStockChangeInput('0');
    } catch (err) {
      const errorMessage = (err instanceof Error) ? err.message : 'Error al actualizar el stock.';
      setError(errorMessage);
      showToast('error', 'Error', errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  }, [productId, product, showToast, selectedStoreId]);

  const openStockAdjustmentModal = useCallback((storeId: number, storeName: string, currentQuantity: number) => {
    setStockAdjustmentData({ storeId, storeName, currentQuantity });
    setStockChangeInput('0');
    setIsStockModalVisible(true);
  }, []);

  const closeStockAdjustmentModal = useCallback(() => {
    setIsStockModalVisible(false);
    setStockAdjustmentData(null);
    setStockChangeInput('0');
  }, []);

  const confirmStockAdjustment = useCallback(() => {
    if (!stockAdjustmentData) return;

    const change = parseInt(stockChangeInput, 10);

    if (isNaN(change)) {
      showToast('error', 'Entrada Inválida', 'Por favor, ingrese un número válido.');
      return;
    }
    if (change === 0) {
      showToast('info', 'Sin Cambios', 'La cantidad de cambio es cero.');
      closeStockAdjustmentModal();
      return;
    }

    if ((stockAdjustmentData.currentQuantity + change) < 0) {
      showToast('error', 'Stock Insuficiente', 'La cantidad resultante no puede ser negativa.');
      return;
    }

    handleUpdateStock(stockAdjustmentData.storeId, change, 'Ajuste manual');
  }, [stockAdjustmentData, stockChangeInput, handleUpdateStock, closeStockAdjustmentModal, showToast]);

  const displayedStockList: ProductStockByStore[] = useMemo(() => {
    if (!product || !stores) return [];

    if (isEditMode && selectedStoreId !== null && selectedStoreId !== undefined) {
      const existingStockForSelectedStore = product.stock_by_store?.find(
        (s) => s.store_id === selectedStoreId
      );

      if (existingStockForSelectedStore) {
        return [existingStockForSelectedStore];
      } else {
        const selectedStoreData = stores.find(s => s.id === selectedStoreId);
        if (selectedStoreData) {
          return [{
            store_id: selectedStoreData.id,
            store_name: selectedStoreData.name,
            quantity: 0,
          }];
        }
      }
    }

    // Si no es modo edición, o si no hay storeId seleccionado o no se encontró la tienda
    return product.stock_by_store || [];
  }, [isEditMode, product, selectedStoreId, stores]);

  if (isLoading || isLoadingStores) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-100">
        <ActivityIndicator size="large" color="#0000ff" />
        <Text className="mt-2 text-gray-600">Cargando producto y tiendas...</Text>
      </View>
    );
  }

  if (error || errorStores) {
    return (
      <View className="flex-1 items-center justify-center bg-red-100 p-4">
        <Text className="text-red-700 text-lg font-bold mb-2">Error</Text>
        <Text className="text-red-600 text-center">{error || errorStores}</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} className="mt-4 px-4 py-2 bg-red-500 rounded-lg">
          <Text className="text-white font-bold">Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <Header title={isEditMode ? "Editar Producto" : "Crear Producto"} canGoBack />
      <ProductForm
        type={isEditMode ? "edit" : "create"}
        initialData={product || undefined}
        onSubmit={handleFormSubmit}
        onCancel={() => navigation.goBack()}
        isLoading={isSubmitting}
      />

      {isEditMode && product && (
        <View className="p-4 border-t border-gray-200 mt-4 bg-gray-50">
          <Text className="text-xl font-bold text-gray-800 mb-4">Gestión de Imágenes (existentes)</Text>
          <View className="flex-row flex-wrap">
            {product.images?.map((img) => (
              <View key={img.id} className="relative mr-2 mb-2 w-24 h-24">
                <Image source={{ uri: img.secure_url }} className="w-full h-full rounded-md" />
                <TouchableOpacity
                  onPress={() => handleRemoveExistingImage(img.id)}
                  className="absolute top-0 right-0 bg-red-500 rounded-full p-1 z-10"
                >
                  <Text className="text-white text-xs font-bold">X</Text>
                </TouchableOpacity>
                {!img.is_thumbnail && (
                  <TouchableOpacity
                    onPress={() => handleSetThumbnail(img.id)}
                    className="absolute bottom-0 left-0 bg-blue-600 px-1 py-0.5 rounded-br-md"
                  >
                    <Text className="text-white text-xs">Miniatura</Text>
                  </TouchableOpacity>
                )}
                {img.is_thumbnail && (
                  <View className="absolute bottom-0 left-0 bg-green-600 px-1 py-0.5 rounded-br-md">
                    <Text className="text-white text-xs">Actual</Text>
                  </View>
                )}
              </View>
            ))}
          </View>

          <Text className="text-xl font-bold text-gray-800 mt-6 mb-4">Gestión de Stock</Text>
          {displayedStockList.length === 0 ? (
            <Text className="text-gray-500 mb-3">No hay stock registrado para este producto en la tienda seleccionada.</Text>
          ) : (
            displayedStockList.map(s => (
              <View key={s.store_id} className="flex-row items-center justify-between mb-2 p-2 bg-white rounded-md shadow-sm">
                <Text className="text-base text-gray-700 font-semibold w-1/3">{s.store_name}:</Text>
                <Text className="text-lg text-gray-800 font-bold w-1/4">{s.quantity}</Text>
                <TouchableOpacity
                  onPress={() => openStockAdjustmentModal(s.store_id, s.store_name, s.quantity)}
                  className="bg-blue-500 px-3 py-1 rounded-md ml-4"
                >
                  <Text className="text-white text-sm font-semibold">Ajustar</Text>
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>
      )}

      <Modal
        animationType="slide"
        transparent={true}
        visible={isStockModalVisible}
        onRequestClose={isSubmitting ? () => {} : closeStockAdjustmentModal} // Bloquear cierre si está en submit
      >
        <Pressable
          className="flex-1 justify-center items-center bg-black/50"
          onPress={isSubmitting ? () => {} : closeStockAdjustmentModal} // Bloquear cierre si está en submit
        >
          <View className="bg-white p-6 rounded-lg w-11/12 max-w-md shadow-xl">
            <Text className="text-2xl font-bold text-gray-800 mb-4">Ajustar Stock: {stockAdjustmentData?.storeName}</Text>
            <Text className="text-lg text-gray-700 mb-4">Stock actual: {stockAdjustmentData?.currentQuantity}</Text>

            <TextInput
              className="border border-gray-300 rounded-md p-3 mb-4 text-lg text-gray-800"
              placeholder="Ingrese cantidad de cambio (+/-)"
              placeholderTextColor="#6B7280" // Añadido para visibilidad
              keyboardType="numeric"
              value={stockChangeInput}
              onChangeText={setStockChangeInput}
            />

            <View className="flex-row justify-end">
              <TouchableOpacity
                onPress={closeStockAdjustmentModal}
                className="bg-gray-300 px-5 py-2 rounded-md mr-3"
              >
                <Text className="text-gray-800 text-lg font-semibold">Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={confirmStockAdjustment}
                className="bg-blue-600 px-5 py-2 rounded-md"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-white text-lg font-semibold">Confirmar</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};

export default ProductAdminDetailScreen;
