import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TouchableWithoutFeedback, Keyboard } from 'react-native';
import AuthForm from '../components/AuthForm';
import { useNavigation } from '@react-navigation/native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { BottomTabParamList } from '../../../../src/navigation/BottomTabNavigator';

type LoginScreenNavigationProp = BottomTabScreenProps<BottomTabParamList, 'LoginTab'>['navigation'];

const LoginScreen = () => {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const [isRegisterMode, setIsRegisterMode] = useState(false);

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View className="flex-1 items-center justify-center bg-gray-100 p-4">
        <AuthForm type={isRegisterMode ? "register" : "login"} />

        <TouchableOpacity
          className="mt-6"
          onPress={() => setIsRegisterMode(!isRegisterMode)}
        >
          <Text className="text-blue-600 text-base">
            {isRegisterMode ? (
              <>¿Ya tienes una cuenta? <Text className="font-bold">Inicia Sesión</Text></>
            ) : (
              <>¿No tienes una cuenta? <Text className="font-bold">Regístrate</Text></>
            )}
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableWithoutFeedback>
  );
};

export default LoginScreen;
