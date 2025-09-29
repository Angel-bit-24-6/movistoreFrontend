import React from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { useAuth } from './context/AuthContext';
import DrawerNavigator from './navigation/DrawerNavigator';
import MainNavigator from './navigation/MainStack'; // Importar MainNavigator
import BottomTabNavigator from './navigation/BottomTabNavigator';

const AppContent = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#0000ff" />
        <Text className="mt-2 text-gray-600">Cargando...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? <MainNavigator /> : <BottomTabNavigator />}
    </NavigationContainer>
  );
};

export default AppContent;
