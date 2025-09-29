import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useAuth } from '../context/AuthContext';

const AdminDashboardScreen = () => {
  const { user, logout } = useAuth();
  const currentDate = new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <View className="flex-1 bg-white">
      <ScrollView className="p-4">
        {user && (
          <View className="mb-6 bg-green-50 p-4 rounded-lg shadow-sm">
            <Text className="text-2xl font-bold text-green-800 mb-2">Administrador: {user.name} {user.apellido_paterno} {user.apellido_materno}</Text>
            <Text className="text-gray-600 mb-2">Fecha Actual: {currentDate}</Text>
            <Text className="text-gray-600">Bienvenido al panel de administración. Aquí puedes gestionar todos los aspectos de tu tienda.</Text>
          </View>
        )}

        {/* Aquí puedes añadir más secciones para el admin */}
        <View className="mb-6 p-4 bg-gray-50 rounded-lg shadow-sm">
          <Text className="text-xl font-bold text-gray-800 mb-3">Gestión Rápida</Text>
          <Text className="text-gray-700 leading-relaxed">
            Utiliza el menú lateral para acceder a la gestión de Productos, Categorías, Sucursales y Órdenes.
          </Text>
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

export default AdminDashboardScreen;
