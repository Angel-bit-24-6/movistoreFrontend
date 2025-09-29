import React, { useMemo } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useFormValidation } from '../../../../src/hooks/useFormValidation';
import { createStoreSchema, updateStoreSchema, CreateStoreSchemaType, UpdateStoreSchemaType } from '../schemas/storeSchemas';
import { Store } from '../../../../src/types';
import { z } from 'zod';
import { Picker } from '@react-native-picker/picker';

interface StoreFormProps {
  type: 'create' | 'edit';
  initialData?: Store; // Para el modo de edición
  onSubmit: (data: CreateStoreSchemaType | UpdateStoreSchemaType) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
}

type StoreFormValues = {
  name: string;
  address?: string | null;
  status?: 'active' | 'archived';
};

const StoreForm = ({
  type,
  initialData,
  onSubmit,
  onCancel,
  isLoading: propIsLoading = false,
}: StoreFormProps) => {
  const schema = type === 'create' ? createStoreSchema : updateStoreSchema;

  const defaultInitialData: StoreFormValues = {
    name: '',
    address: null,
    status: 'active',
  };

  const mergedInitialData: StoreFormValues = useMemo(() => {
    return initialData ? {
      ...defaultInitialData,
      name: initialData.name,
      address: initialData.address || null,
      status: initialData.status || 'active',
    } : defaultInitialData;
  }, [initialData]);

  const initialValues = useMemo(() => {
    return type === 'create' ? {
      name: mergedInitialData.name,
      address: mergedInitialData.address,
    } as CreateStoreSchemaType : {
      name: mergedInitialData.name,
      address: mergedInitialData.address,
      status: mergedInitialData.status,
    } as UpdateStoreSchemaType;
  }, [type, mergedInitialData]);

  const { formData, errors, handleChange, handleSubmit, isLoading } = useFormValidation(
    schema,
    onSubmit,
    initialValues
  );

  return (
    <View className="p-4 bg-white rounded-lg">
      <View className="mb-4">
        <Text className="text-lg font-semibold text-gray-700 mb-1">Nombre</Text>
        <TextInput
          className="border border-gray-300 rounded-md p-2 text-gray-800"
          value={formData.name || ''}
          onChangeText={(text) => handleChange('name', text)}
          placeholder="Nombre de la sucursal"
        />
        {errors.name && <Text className="text-red-500 text-sm mt-1">{errors.name}</Text>}
      </View>

      <View className="mb-4">
        <Text className="text-lg font-semibold text-gray-700 mb-1">Dirección</Text>
        <TextInput
          className="border border-gray-300 rounded-md p-2 text-gray-800 h-24"
          value={formData.address || ''}
          onChangeText={(text) => handleChange('address', text)}
          placeholder="Dirección de la sucursal (opcional)"
          multiline
          textAlignVertical="top"
        />
        {errors.address && <Text className="text-red-500 text-sm mt-1">{errors.address}</Text>}
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
            <Text className="text-white font-semibold">{type === 'create' ? 'Crear Sucursal' : 'Guardar Cambios'}</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default StoreForm;
