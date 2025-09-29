import React from 'react';
import { View, Text, Image } from 'react-native';
import { Product } from '../../../../src/types';

interface OrderItemProps {
  product_name: string;
  unit_price: number;
  quantity: number;
  // thumbnail_url?: string; // Opcional si se quiere mostrar imagen
}

const OrderItem = ({ product_name, unit_price, quantity }: OrderItemProps) => {
  // const imageUrl = product.images?.[0]?.secure_url || 'https://via.placeholder.com/80';

  return (
    <View className="flex-row items-center bg-white p-3 mb-2 rounded-lg shadow-sm">
      {/* <Image source={{ uri: thumbnail_url || 'https://via.placeholder.com/80' }} className="w-16 h-16 rounded-md mr-3" /> */}
      <View className="flex-1">
        <Text className="text-md font-semibold text-gray-800" numberOfLines={2}>{product_name}</Text>
        <Text className="text-sm text-blue-600 mt-1">${(unit_price || 0).toFixed(2)} x {quantity}</Text>
        <Text className="text-base font-bold text-gray-700">Subtotal: ${((unit_price || 0) * quantity).toFixed(2)}</Text>
      </View>
    </View>
  );
};

export default OrderItem;
