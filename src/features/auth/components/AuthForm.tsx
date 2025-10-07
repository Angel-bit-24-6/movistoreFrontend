import React from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, TouchableWithoutFeedback, Keyboard, ScrollView } from 'react-native';
import { useFormValidation } from '../../../../src/hooks/useFormValidation'; // Necesitarás implementar este hook
import { loginSchema, registerSchema } from '../schemas/authSchemas'; // Necesitarás implementar estos esquemas
import { useAuth } from '../../../../src/context/AuthContext';
import { LoginCredentials, RegisterData } from '../../../../src/types';
import { ZodTypeAny } from 'zod'; // Necesitarás instalar zod

interface AuthFormProps {
  type: 'login' | 'register';
  onSuccess?: () => void;
}

const AuthForm = ({ type, onSuccess }: AuthFormProps) => {
  const { login, register, isLoading: authLoading } = useAuth();

  const schema: ZodTypeAny = type === 'login' ? loginSchema : registerSchema;

  const { formData, errors, handleChange, handleSubmit, resetForm, isLoading: formLoading } = useFormValidation(schema, async (data) => {
    try {
      Keyboard.dismiss(); // Ocultar teclado al enviar formulario
      if (type === 'login') {
        await login(data as LoginCredentials);
      } else {
        await register(data as RegisterData);
      }
      onSuccess && onSuccess();
      resetForm();
    } catch (error) {
      // Los errores ya son manejados por useAuth y useToast
    }
  });

  const isLoading = authLoading || formLoading;

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View className="w-full max-w-sm">
        <ScrollView 
          className="bg-white rounded-lg shadow-md"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: 24 }}
        >
          <Text className="text-3xl font-bold text-center text-gray-800 mb-6">
            {type === 'login' ? 'Iniciar Sesión' : 'Registrarse'}
          </Text>

      {type === 'register' && (
        <View className="mb-4">
          <Text className="text-lg font-semibold text-gray-700 mb-1">Nombre</Text>
          <TextInput
            className="w-full p-3 border border-gray-300 rounded-md text-base text-gray-700"
            placeholder="Nombre"
            placeholderTextColor="#6B7280" // Añadido para visibilidad
            value={formData.name || ''}
            onChangeText={(text) => handleChange('name', text)}
            autoCapitalize="words"
          />
          {errors.name && <Text className="text-red-500 text-sm mt-1">{errors.name}</Text>}
        </View>
      )}

      {type === 'register' && (
        <View className="mb-4">
          <Text className="text-lg font-semibold text-gray-700 mb-1">Apellido Paterno</Text>
          <TextInput
            className="w-full p-3 border border-gray-300 rounded-md text-base text-gray-700"
            placeholder="Apellido Paterno"
            placeholderTextColor="#6B7280" // Añadido para visibilidad
            value={formData.apellido_paterno || ''}
            onChangeText={(text) => handleChange('apellido_paterno', text)}
            autoCapitalize="words"
          />
          {errors.apellido_paterno && <Text className="text-red-500 text-sm mt-1">{errors.apellido_paterno}</Text>}
        </View>
      )}

      {type === 'register' && (
        <View className="mb-4">
          <Text className="text-lg font-semibold text-gray-700 mb-1">Apellido Materno</Text>
          <TextInput
            className="w-full p-3 border border-gray-300 rounded-md text-base text-gray-700"
            placeholder="Apellido Materno"
            placeholderTextColor="#6B7280" // Añadido para visibilidad
            value={formData.apellido_materno || ''}
            onChangeText={(text) => handleChange('apellido_materno', text)}
            autoCapitalize="words"
          />
          {errors.apellido_materno && <Text className="text-red-500 text-sm mt-1">{errors.apellido_materno}</Text>}
        </View>
      )}

      <View className="mb-4">
        <Text className="text-lg font-semibold text-gray-700 mb-1">Correo Electrónico</Text>
        <TextInput
          className="w-full p-3 border border-gray-300 rounded-md text-base text-gray-700"
          placeholder="Correo Electrónico"
          placeholderTextColor="#6B7280" // Añadido para visibilidad
          value={formData.email || ''}
          onChangeText={(text) => handleChange('email', text)}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        {errors.email && <Text className="text-red-500 text-sm mt-1">{errors.email}</Text>}
      </View>

      <View className="mb-6">
        <Text className="text-lg font-semibold text-gray-700 mb-1">Contraseña</Text>
        <TextInput
          className="w-full p-3 border border-gray-300 rounded-md text-base text-gray-700"
          placeholder="Contraseña"
          placeholderTextColor="#6B7280" // Añadido para visibilidad
          value={formData.password || ''}
          onChangeText={(text) => handleChange('password', text)}
          secureTextEntry
        />
        {errors.password && <Text className="text-red-500 text-sm mt-1">{errors.password}</Text>}
      </View>

          <TouchableOpacity
            className="w-full bg-blue-600 p-3 rounded-md items-center justify-center"
            onPress={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white text-lg font-semibold">
                {type === 'login' ? 'Ingresar' : 'Crear Cuenta'}
              </Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </View>
    </TouchableWithoutFeedback>
  );
};

export default AuthForm;
