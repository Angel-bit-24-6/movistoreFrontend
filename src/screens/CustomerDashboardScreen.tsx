import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useAuth } from '../context/AuthContext';

const CustomerDashboardScreen = () => {
  const { user, logout } = useAuth();
  
  return (
    <View className="flex-1 bg-white">
      <ScrollView className="p-4">
        {user && (
          <View className="mb-6 bg-blue-50 p-4 rounded-lg shadow-sm">
            <Text className="text-2xl font-bold text-blue-800 mb-2">Bienvenido, {user.name} {user.apellido_paterno} {user.apellido_materno}</Text>
            <Text className="text-gray-600">Aquí puedes gestionar tu cuenta y ver tus actividades.</Text>
          </View>
        )}

        {/* Sección de Términos y Condiciones */}
        <View className="mb-6 p-4 bg-gray-50 rounded-lg shadow-sm">
          <Text className="text-xl font-bold text-gray-800 mb-3">Términos y Condiciones</Text>
          <Text className="text-gray-700 leading-relaxed">
            Al utilizar MoviStore, aceptas nuestros términos y condiciones. Por favor, revísalos cuidadosamente para entender tus derechos y responsabilidades.
            Nos reservamos el derecho de actualizar o modificar estos términos en cualquier momento. El uso continuado de la aplicación después de dichas modificaciones constituye tu aceptación de los nuevos términos.
          </Text>
          <TouchableOpacity className="mt-3 bg-blue-100 px-4 py-2 rounded-md self-start">
            <Text className="text-blue-700 font-semibold">Leer más</Text>
          </TouchableOpacity>
        </View>

        {/* Sección de Términos del Servicio */}
        <View className="mb-6 p-4 bg-gray-50 rounded-lg shadow-sm">
          <Text className="text-xl font-bold text-gray-800 mb-3">Términos del Servicio</Text>
          <Text className="text-gray-700 leading-relaxed">
            Nuestros servicios están diseñados para brindarte la mejor experiencia de compra. Esto incluye el procesamiento de pedidos, gestión de inventario y atención al cliente. 
            Cualquier abuso o uso indebido de la plataforma resultará en la suspensión o terminación de la cuenta.
          </Text>
          <TouchableOpacity className="mt-3 bg-blue-100 px-4 py-2 rounded-md self-start">
            <Text className="text-blue-700 font-semibold">Detalles del Servicio</Text>
          </TouchableOpacity>
        </View>

        {/* Sección de Contáctanos */}
        <View className="mb-6 p-4 bg-gray-50 rounded-lg shadow-sm">
          <Text className="text-xl font-bold text-gray-800 mb-3">Contáctanos</Text>
          <Text className="text-gray-700 leading-relaxed">
            Si tienes alguna pregunta, sugerencia o problema, no dudes en contactar a nuestro equipo de soporte.
            Puedes enviarnos un correo electrónico a soporte@movistore.com o llamarnos al +123 456 7890.
          </Text>
          <TouchableOpacity className="mt-3 bg-blue-100 px-4 py-2 rounded-md self-start">
            <Text className="text-blue-700 font-semibold">Enviar Correo</Text>
          </TouchableOpacity>
        </View>

        {/* Botón de Cerrar Sesión */}
        <TouchableOpacity
          onPress={logout}
          className="bg-red-500 p-4 rounded-lg flex-row items-center justify-center mt-6 mb-10"
        >
          <Text className="text-white text-lg font-bold">Cerrar Sesión</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default CustomerDashboardScreen;
