import React from 'react';
import { View, Text } from 'react-native';

const HomeScreen = () => {
  return (
    <View className="flex-1 bg-white">
      <View className="flex-1 items-center justify-center">
        <Text className="text-2xl font-bold">Bienvenido a MoviStore</Text>
        {/* Aquí irá el contenido específico de la Home Screen */}
      </View>
    </View>
  );
};

export default HomeScreen;
