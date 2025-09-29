import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Image, ScrollView, Alert } from 'react-native';
import { useFormValidation } from '../../../../src/hooks/useFormValidation';
import { createProductSchema, updateProductSchema, CreateProductSchemaType, UpdateProductSchemaType, StockSchemaType, imageUploadFileSchema } from '../schemas/productSchemas'; // Importar imageUploadFileSchema
import { Category, Product, Store, ImageUploadFile, ProductImage } from '../../../../src/types';
import { useToast } from '../../../../src/context/ToastContext';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { useCategories } from '../../categories/hooks/useCategories';
import { useStores } from '../../stores/hooks/useStores';
import { Picker } from '@react-native-picker/picker';

interface ProductFormProps {
  type: 'create' | 'edit';
  initialData?: Product; // Para el modo de edición
  onSubmit: (data: CreateProductSchemaType | UpdateProductSchemaType, imagesToUpload: ImageUploadFile[]) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
}

// Tipo unificado para los valores del formulario de producto
type ProductFormValues = {
  name: string;
  description?: string;
  price: number;
  sku?: string;
  category_id?: number | null; // MODIFICADO: Ahora puede ser number, null o undefined
  initial_stock?: StockSchemaType[];
  images?: ImageUploadFile[]; // Reintroducido para Zod
  status?: 'active' | 'archived';
};

const ProductForm = ({
  type,
  initialData,
  onSubmit,
  onCancel,
  isLoading: propIsLoading = false,
}: ProductFormProps) => {
  const { showToast } = useToast();
  const { categories } = useCategories();
  const { stores } = useStores();

  const schema = type === 'create' ? createProductSchema : updateProductSchema;

  const defaultInitialData: ProductFormValues = {
    name: '',
    description: '',
    price: 0,
    sku: '',
    category_id: undefined,
    initial_stock: [],
    images: [], // Inicialmente vacío para la validación de Zod
    status: 'active',
  };

  const mergedInitialData: ProductFormValues = useMemo(() => {
    return initialData ? {
      ...defaultInitialData,
      name: initialData.name,
      description: initialData.description || '',
      price: initialData.price,
      sku: initialData.sku || '',
      category_id: initialData.category_id,
      initial_stock: initialData.stock_by_store?.map(s => ({ store_id: s.store_id, quantity: s.quantity })) || [],
      images: initialData.images?.map(img => ({ uri: img.secure_url, name: img.public_id, type: img.resource_type === 'video' ? 'video/mp4' : 'image/jpeg' })) || [], // Mapear imágenes existentes para Zod
      status: initialData.status || 'active',
    } : defaultInitialData;
  }, [initialData]);

  const initialValues = useMemo(() => {
    return type === 'create' ? {
      name: mergedInitialData.name,
      description: mergedInitialData.description,
      price: mergedInitialData.price,
      sku: mergedInitialData.sku,
      category_id: mergedInitialData.category_id,
      initial_stock: mergedInitialData.initial_stock,
      images: [],
    } as CreateProductSchemaType : {
      name: mergedInitialData.name,
      description: mergedInitialData.description,
      price: mergedInitialData.price,
      sku: mergedInitialData.sku,
      category_id: mergedInitialData.category_id,
      status: mergedInitialData.status,
      images: mergedInitialData.images,
    } as UpdateProductSchemaType;
  }, [type, mergedInitialData]);

  const { formData, errors, handleChange, handleSubmit, isLoading } = useFormValidation(
    schema,
    async (data) => {
      console.log('ProductForm: Enviando formulario. Datos:', data);
      const imagesToSubmit = selectedImages.filter(img => !initialData?.images?.some(existingImg => existingImg.secure_url === img.uri));

      const dataToSend: any = { ...data };
      if (dataToSend.images !== undefined) {
        delete dataToSend.images;
      }
      await onSubmit(dataToSend, imagesToSubmit);
    },
    initialValues
  );

  const [selectedImages, setSelectedImages] = useState<ImageUploadFile[]>([]); // Solo imágenes NUEVAS seleccionadas
  const [existingImages, setExistingImages] = useState<ProductImage[]>([]); // Inicializado como vacío, se actualiza en useEffect
  const [priceInput, setPriceInput] = useState(String(mergedInitialData.price || '')); // Reintroducido para manejar input de precio

  const MAX_ALLOWED_IMAGES_IN_UI = 7; // Límite de imágenes que se pueden seleccionar en la UI

  // useEffect principal para sincronizar estados locales con initialData y formData
  useEffect(() => {
    if (initialData?.images) {
      setExistingImages(initialData.images);
      const allImagesForZod = [
        ...initialData.images.map(img => ({ uri: img.secure_url, name: img.public_id, type: img.resource_type === 'video' ? 'video/mp4' : 'image/jpeg' })),
        ...selectedImages
      ];
      handleChange('images', allImagesForZod, { shouldClearError: false });
    } else {
      setExistingImages([]);
      handleChange('images', selectedImages, { shouldClearError: false });
    }
  }, [initialData?.images, initialData?.price, selectedImages, handleChange]);

  // NUEVO useEffect para sincronizar priceInput con formData.price
  useEffect(() => {
    const currentFormDataPrice = formData.price;

    // Si formData.price no es un número válido (ej. undefined, null, NaN), no intentamos sincronizarlo desde formData.
    // priceInput debe retener el valor que el usuario está tecleando.
    if (typeof currentFormDataPrice !== 'number' || isNaN(currentFormDataPrice)) {
      // Si formData.price es inválido y priceInput está vacío, podemos asegurarnos de que se muestre vacío.
      // De lo contrario, permitimos que priceInput mantenga la entrada del usuario (ej. "10.").
      if (priceInput === '') {
          setPriceInput('');
      }
      return;
    }

    const currentPriceInputNumber = parseFloat(priceInput);

    // Lógica para sincronizar priceInput con formData.price, evitando interrupciones al teclear decimales.
    // Solo actualizamos priceInput si la representación numérica de formData.price
    // es diferente de lo que parseFloat(priceInput) nos da Y
    // priceInput no está en un estado de "edición decimal" (ej., terminando en '.')
    if (currentFormDataPrice !== currentPriceInputNumber && !priceInput.endsWith('.')) {
      setPriceInput(String(currentFormDataPrice));
    } else if (currentFormDataPrice === 0 && priceInput !== '0' && priceInput !== '') {
      setPriceInput('0');
    }
  }, [formData.price, priceInput]); // Añadir priceInput a las dependencias para reaccionar a la entrada del usuario.


  const pickImage = async () => {
    console.log('ProductForm: Iniciando selección de imágenes...');
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      allowsMultipleSelection: true,
    });

    if (!result.canceled && result.assets) {
      const currentTotalImages = existingImages.length + selectedImages.length;
      const availableSlots = MAX_ALLOWED_IMAGES_IN_UI - currentTotalImages;
      
      if (availableSlots <= 0) {
        showToast('error', 'Límite de Imágenes Excedido', `Solo puedes seleccionar hasta ${MAX_ALLOWED_IMAGES_IN_UI - 2} imágenes en total.`);
        return; 
      }

      const imagesToProcess = result.assets.slice(0, availableSlots);

      const processedImagePromises = imagesToProcess.map(async (asset) => {
        try {
          const manipulatedImage = await ImageManipulator.manipulateAsync(
            asset.uri, 
            [{ resize: { width: 800 } }],
            { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
          );
          return {
            uri: manipulatedImage.uri,
            name: asset.fileName || `image-${Date.now()}.jpeg`,
            type: asset.mimeType || 'image/jpeg',
          };
        } catch (error) {
          console.error("Error manipulando la imagen:", error);
          showToast('error', 'Error de Imagen', 'Hubo un problema al procesar una imagen.');
          return null;
        }
      });

      const newImages = (await Promise.all(processedImagePromises)).filter(Boolean) as ImageUploadFile[];

      setSelectedImages(prev => {
        const updatedImages = [...prev, ...newImages];
        console.log('ProductForm: Imágenes seleccionadas añadidas. Total de nuevas imágenes:', updatedImages.length);

        const allImagesForZod = [...existingImages.map(img => ({ uri: img.secure_url, name: img.public_id, type: img.resource_type === 'video' ? 'video/mp4' : 'image/jpeg' })), ...updatedImages];
        handleChange('images', allImagesForZod);
        return updatedImages;
      });
    }
  };

  const removeSelectedImage = (index: number) => {
    Alert.alert(
      "Eliminar imagen",
      "¿Estás seguro de que quieres eliminar esta imagen?",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Eliminar", style: "destructive", onPress: () => {
          setSelectedImages(prev => {
            const updatedImages = prev.filter((_, i) => i !== index);
            console.log('ProductForm: Imagen seleccionada eliminada. Total de nuevas imágenes:', updatedImages.length);
            const allImagesForZod = [...existingImages.map(img => ({ uri: img.secure_url, name: img.public_id, type: img.resource_type === 'video' ? 'video/mp4' : 'image/jpeg' })), ...updatedImages];
            handleChange('images', allImagesForZod);
            return updatedImages;
          });
        }},
      ]
    );
  };

  const removeExistingImage = (imageId: number) => {
    Alert.alert(
      "Eliminar imagen existente",
      "¿Estás seguro de que quieres eliminar esta imagen del producto?",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Eliminar", style: "destructive", onPress: () => {
          showToast('info', 'Funcionalidad Pendiente', 'La eliminación de imágenes existentes se gestiona en la pantalla de detalle del administrador.');
        }},
      ]
    );
  };

  const handleStockChange = (storeId: number, quantity: string) => {
    const createFormData = formData as CreateProductSchemaType;
    const newStock = createFormData.initial_stock ? [...createFormData.initial_stock] : [];
    const index = newStock.findIndex((s: StockSchemaType) => s.store_id === storeId);
    const parsedQuantity = parseInt(quantity, 10);

    if (index > -1) {
      newStock[index].quantity = isNaN(parsedQuantity) ? 0 : parsedQuantity;
    } else {
      newStock.push({ store_id: storeId, quantity: isNaN(parsedQuantity) ? 0 : parsedQuantity });
    }
    handleChange('initial_stock', newStock);
  };

  const getStockQuantity = (storeId: number): string => {
    const createFormData = formData as CreateProductSchemaType;
    const stockItem = createFormData.initial_stock?.find((s: StockSchemaType) => s.store_id === storeId);
    return stockItem ? String(stockItem.quantity) : '0';
  };

  return (
    <ScrollView className="p-4 bg-white rounded-lg">
      <View className="mb-4">
        <Text className="text-lg font-semibold text-gray-700 mb-1">Nombre</Text>
        <TextInput
          className="border border-gray-300 rounded-md p-2 text-gray-800"
          value={formData.name || ''}
          onChangeText={(text) => handleChange('name', text)}
          placeholder="Nombre del producto"
        />
        {errors.name && <Text className="text-red-500 text-sm mt-1">{errors.name}</Text>}
      </View>

      <View className="mb-4">
        <Text className="text-lg font-semibold text-gray-700 mb-1">Descripción</Text>
        <TextInput
          className="border border-gray-300 rounded-md p-2 text-gray-800 h-24"
          value={formData.description || ''}
          onChangeText={(text) => handleChange('description', text)}
          placeholder="Descripción del producto (opcional)"
          multiline
          textAlignVertical="top"
        />
        {errors.description && <Text className="text-red-500 text-sm mt-1">{errors.description}</Text>}
      </View>

      <View className="mb-4">
        <Text className="text-lg font-semibold text-gray-700 mb-1">Precio</Text>
        <TextInput
          className="border border-gray-300 rounded-md p-2 text-gray-800"
          value={priceInput}
          onChangeText={(text) => {
            setPriceInput(text); // Actualiza el estado local del string inmediatamente
            // Intenta parsear a flotante, si es inválido (ej. solo '.'), Zod lo validará
            const numericValue = parseFloat(text);
            // Envía 0 si el texto está vacío, NaN si no es un número válido (ej. solo '.'), o el número parseado
            handleChange('price', text === '' ? 0 : (isNaN(numericValue) ? NaN : numericValue));
          }}
          keyboardType="numeric"
          placeholder="0.00"
        />
        {errors.price && <Text className="text-red-500 text-sm mt-1">{errors.price}</Text>}
      </View>

      <View className="mb-4">
        <Text className="text-lg font-semibold text-gray-700 mb-1">SKU (opcional)</Text>
        <TextInput
          className="border border-gray-300 rounded-md p-2 text-gray-800"
          value={formData.sku || ''}
          onChangeText={(text) => handleChange('sku', text)}
          placeholder="Código de referencia"
        />
        {errors.sku && <Text className="text-red-500 text-sm mt-1">{errors.sku}</Text>}
      </View>

      <View className="mb-4">
        <Text className="text-lg font-semibold text-gray-700 mb-1">Categoría</Text>
        <View className="border border-gray-300 rounded-md p-2">
          {categories.length > 0 ? (
            <Picker
              selectedValue={formData.category_id}
              onValueChange={(itemValue: number | null) => handleChange('category_id', itemValue)}
            >
              <Picker.Item label="Seleccione una categoría" value={null} />
              {categories.map((cat) => (
                <Picker.Item key={cat.id} label={cat.name} value={cat.id} />
              ))}
            </Picker>
          ) : (
            <Text className="text-gray-500">Cargando categorías...</Text>
          )}
        </View>
        {errors.category_id && <Text className="text-red-500 text-sm mt-1">{errors.category_id}</Text>}
      </View>

      {type === 'create' && (
        <View className="mb-4">
          <Text className="text-lg font-semibold text-gray-700 mb-1">Stock por Sucursal</Text>
          {stores.length > 0 ? (
            stores.map((store) => (
              <View key={store.id} className="flex-row items-center justify-between mb-2">
                <Text className="text-base text-gray-800 w-1/2">{store.name}:</Text>
                <TextInput
                  className="border border-gray-300 rounded-md p-2 text-gray-800 w-1/2"
                  value={getStockQuantity(store.id)}
                  onChangeText={(text) => handleStockChange(store.id, text)}
                  keyboardType="numeric"
                />
              </View>
            ))
          ) : (
            <Text className="text-gray-500">Cargando sucursales...</Text>
          )}
          {errors.initial_stock && <Text className="text-red-500 text-sm mt-1">{errors.initial_stock}</Text>}
        </View>
      )}

      <View className="mb-4">
        <Text className="text-lg font-semibold text-gray-700 mb-1">Imágenes (nuevas)</Text>
        <TouchableOpacity
          onPress={pickImage}
          className="bg-gray-200 p-3 rounded-md flex-row items-center justify-center mb-3"
        >
          <Text className="text-blue-600 font-semibold">Seleccionar Imágenes</Text>
        </TouchableOpacity>
        <ScrollView horizontal className="flex-row mb-4">
          {existingImages.map((img, index) => (
            <View key={img.id} className="relative mr-2">
              <Image source={{ uri: img.secure_url }} className="w-24 h-24 rounded-md" />
              <TouchableOpacity
                onPress={() => removeExistingImage(img.id)}
                className="absolute top-0 right-0 bg-red-500 rounded-full p-1"
              >
                <Text className="text-white text-xs font-bold">X</Text>
              </TouchableOpacity>
              {img.is_thumbnail && <Text className="absolute bottom-0 left-0 bg-blue-500 text-white text-xs px-1 rounded-br-md">Miniatura</Text>}
            </View>
          ))}
          {selectedImages.map((img, index) => (
            <View key={index} className="relative mr-2">
              <Image source={{ uri: img.uri }} className="w-24 h-24 rounded-md" />
              <TouchableOpacity
                onPress={() => removeSelectedImage(index)}
                className="absolute top-0 right-0 bg-red-500 rounded-full p-1"
              >
                <Text className="text-white text-xs font-bold">X</Text>
              </TouchableOpacity>
              <Text className="absolute bottom-0 left-0 bg-purple-500 text-white text-xs px-1 rounded-br-md">Nueva</Text>
            </View>
          ))}
        </ScrollView>
        {errors.images && <Text className="text-red-500 text-sm mt-1">{errors.images}</Text>}
      </View>

      <View className="flex-row justify-end mt-4">
        {onCancel && (
          <TouchableOpacity
            onPress={onCancel}
            className="bg-gray-300 px-4 py-2 rounded-md mr-2"
            disabled={isLoading || propIsLoading}
          >
            <Text className="text-gray-800 font-semibold">Cancelar</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          onPress={handleSubmit}
          className={`bg-blue-600 px-4 py-2 rounded-md ${isLoading || propIsLoading ? 'opacity-50' : ''}`}
          disabled={isLoading || propIsLoading}
        >
          {isLoading || propIsLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-semibold">{type === 'create' ? 'Crear Producto' : 'Guardar Cambios'}</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default ProductForm;
