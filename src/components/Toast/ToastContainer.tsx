import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useToast } from '../../context/ToastContext';

const ToastContainer = () => {
  const { toasts, hideToast } = useToast();

  return (
    <View className="absolute top-10 left-0 right-0 z-50 items-center px-4 pointer-events-box">
      {toasts.map((toast) => (
        <TouchableOpacity
          key={toast.id}
          className={`w-full max-w-sm p-4 rounded-lg shadow-md mb-3 flex-row items-center justify-between
            ${toast.type === 'success' ? 'bg-green-500' : ''}
            ${toast.type === 'error' ? 'bg-red-500' : ''}
            ${toast.type === 'info' ? 'bg-blue-500' : ''}
            ${toast.type === 'warning' ? 'bg-yellow-500' : ''}
          `}
          onPress={() => hideToast(toast.id)}
          activeOpacity={0.9}
        >
          <View className="flex-1">
            <Text className="text-white font-bold text-lg">{toast.title}</Text>
            {toast.description && (
              <Text className="text-white text-base mt-1">{toast.description}</Text>
            )}
          </View>
          <Text className="text-white text-xl font-bold ml-4">×</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

export default ToastContainer;
