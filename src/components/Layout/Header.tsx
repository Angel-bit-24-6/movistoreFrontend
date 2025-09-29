import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native'; // Importar ScrollView
import { useNavigation, DrawerActions } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
// import { Feather } from '@expo/vector-icons'; // Descomentado si se usan íconos

interface HeaderProps {
  title: string;
  canGoBack?: boolean;
  showDrawerToggleButton?: boolean;
}

const Header = ({ title, canGoBack, showDrawerToggleButton }: HeaderProps) => {
  const navigation = useNavigation();

  return (
    <SafeAreaView className="bg-blue-600 pt-4 pb-3 shadow-md flex-row items-center px-4">
      {canGoBack && (
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4 p-2 rounded-full bg-blue-700">
          {/* <Feather name="arrow-left" size={24} color="white" /> */}
          <Text className="text-white text-lg">←</Text>
        </TouchableOpacity>
      )}
      <View className="flex-1">
        <Text className="text-white text-xl font-bold text-center">{title}</Text>
      </View>
      {!canGoBack && showDrawerToggleButton && (
        <TouchableOpacity onPress={() => navigation.dispatch(DrawerActions.openDrawer())} className="ml-4 p-2 rounded-full bg-blue-700">
          {/* <Feather name="menu" size={24} color="white" /> */}
          <Text className="text-white text-lg">☰</Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
};

export default Header;
