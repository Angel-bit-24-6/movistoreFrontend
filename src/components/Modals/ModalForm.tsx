import React, { ReactNode } from 'react';
import { Modal, View, Text, TouchableOpacity } from 'react-native';

interface ModalFormProps {
  isVisible: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

const ModalForm = ({ isVisible, onClose, title, children }: ModalFormProps) => {
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-center items-center bg-black/50 p-4">
        <View className="w-full max-w-lg bg-white rounded-lg shadow-xl p-6 relative">
          {/* Botón de cerrar */}
          <TouchableOpacity
            className="absolute top-3 right-3 p-2 rounded-full bg-gray-200"
            onPress={onClose}
          >
            <Text className="text-gray-600 text-xl font-bold">×</Text>
          </TouchableOpacity>

          {/* Título del Modal */}
          <Text className="text-2xl font-bold text-gray-800 text-center mb-6">
            {title}
          </Text>

          {/* Contenido del Modal */}
          <View className="mt-4">{children}</View>
        </View>
      </View>
    </Modal>
  );
};

export default ModalForm;
