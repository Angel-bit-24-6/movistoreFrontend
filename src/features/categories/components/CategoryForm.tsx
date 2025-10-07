import React from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { useFormValidation } from '../../../hooks/useFormValidation';
import { createCategorySchema, updateCategorySchema, CreateCategorySchemaType } from '../schemas/categorySchemas';
import { Category } from '../../../types';
import { z } from 'zod';

interface CategoryFormProps {
  type: 'create' | 'edit';
  initialData?: Category; // Para el modo de edición
  onSubmit: (data: any) => Promise<void>; // Tipo flexible para manejar ambos esquemas
  onCancel?: () => void;
  isLoading?: boolean;
}

const CategoryForm = ({
  type,
  initialData,
  onSubmit,
  onCancel,
  isLoading: propIsLoading = false,
}: CategoryFormProps) => {
  const schema = type === 'create' ? createCategorySchema : updateCategorySchema;

  const { formData, errors, handleChange, handleSubmit: originalHandleSubmit, isLoading } = useFormValidation(
    schema,
    onSubmit,
    initialData as any // Castear a any para mayor flexibilidad
  );

  // 🔥 GESTIÓN DEL TECLADO - Wrapper para handleSubmit
  const handleSubmit = () => {
    Keyboard.dismiss();
    originalHandleSubmit();
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View className="p-4 bg-white rounded-lg">
      <View className="mb-4">
        <Text className="text-lg font-semibold text-gray-700 mb-1">Nombre</Text>
        <TextInput
          className="border border-gray-300 rounded-md p-2 text-gray-800"
          value={formData.name || ''}
          onChangeText={(text) => handleChange('name', text)}
          placeholder="Nombre de la categoría"
          placeholderTextColor="#6B7280"
          onSubmitEditing={handleSubmit}
          returnKeyType="done"
        />
        {errors.name && <Text className="text-red-500 text-sm mt-1">{errors.name}</Text>}
      </View>

      <View className="mb-4">
        <Text className="text-lg font-semibold text-gray-700 mb-1">Descripción</Text>
        <TextInput
          className="border border-gray-300 rounded-md p-2 text-gray-800 h-24"
          value={formData.description || ''}
          onChangeText={(text) => handleChange('description', text)}
          placeholder="Descripción de la categoría (opcional)"
          placeholderTextColor="#6B7280"
          multiline
          textAlignVertical="top"
          blurOnSubmit={true}
        />
        {errors.description && <Text className="text-red-500 text-sm mt-1">{errors.description}</Text>}
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
            <Text className="text-white font-semibold">{type === 'create' ? 'Crear' : 'Guardar Cambios'}</Text>
          )}
        </TouchableOpacity>
      </View>
      </View>
    </TouchableWithoutFeedback>
  );
};

export default CategoryForm;
