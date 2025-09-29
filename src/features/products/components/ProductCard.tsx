import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { Product } from '../../../types';
import { useCart } from '../../../context/CartContext'; // Importar el hook useCart
import { useAuth } from '../../../context/AuthContext'; // Importar useAuth
import { useNavigation } from '@react-navigation/native'; // Importar useNavigation
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs'; // Importar BottomTabScreenProps
import { BottomTabParamList } from '../../../navigation/BottomTabNavigator'; // Importar BottomTabParamList

const NotFoundImage = require('../../../../assets/NotFoundImage-100.png');

interface ProductCardProps {
  product: Product;
  onPress: () => void;
  onEdit?: (product: Product) => void; // Nueva prop para editar
  onToggleStatus?: (product: Product) => void; // Nueva prop para cambiar estado (archivar/restaurar)
  selectedStoreId?: number | null; // Añadir selectedStoreId como prop
}

// Definir el tipo de navegación para la pestaña pública
type ProductCardNavigationProp = BottomTabScreenProps<BottomTabParamList, 'ProductsTab'>['navigation'];

const ProductCard: React.FC<ProductCardProps> = ({ product, onPress, onEdit, onToggleStatus, selectedStoreId }) => {
  // --- INICIO DE MODIFICACIÓN ---
  const imageSource = product.thumbnail_url ? { uri: product.thumbnail_url } : NotFoundImage;
  // --- FIN DE MODIFICACIÓN ---
  const { addToCart } = useCart(); // Usar el hook useCart
  const { isAuthenticated, user } = useAuth(); // Obtener el usuario autenticado y el estado de autenticación
  const navigation = useNavigation<ProductCardNavigationProp>(); // Obtener la navegación

  // Usar directamente product.stock_in_selected_store que viene del backend
  const stockInSelectedStore = product.stock_in_selected_store !== undefined && product.stock_in_selected_store !== null
    ? product.stock_in_selected_store
    : null;

  let stockTextForCustomer: string;
  if (selectedStoreId === null) {
    // Si no hay tienda seleccionada, mostrar el stock total como fallback
    stockTextForCustomer = `Stock Total: ${product.total_stock !== undefined && product.total_stock !== null ? product.total_stock : 'N/A'}`;
  } else if (stockInSelectedStore !== null) {
    stockTextForCustomer = `Stock: ${stockInSelectedStore}`;
  } else {
    stockTextForCustomer = 'Stock: N/A';
  }

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      addToCart(product, 1);
      navigation.navigate('LoginTab'); // Redirigir a la pantalla de Login si no está autenticado
      return;
    }
    addToCart(product, 1); // Añadir al carrito si está autenticado
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      className={`w-[48%] bg-white rounded-lg shadow-md overflow-hidden mb-4 ${product.status === 'archived' ? 'opacity-60' : ''}`}
    >
      <Image source={imageSource} className="w-full h-36 object-cover" resizeMode="cover" />
      <View className="p-3">
        <Text className="text-base font-semibold text-gray-800" numberOfLines={1}>{product.name}</Text>
        {product.status === 'archived' && (
          <Text className="text-sm text-red-500 font-bold mt-1">ARCHIVADO</Text>
        )}
        <Text className="text-sm text-gray-500 mt-1" numberOfLines={2}>{product.description}</Text>
        <Text className="text-lg font-bold text-blue-600 mt-2">${product.price.toFixed(2)}</Text>
        
        {user?.role === 'admin' && (
          <Text className="text-xs text-gray-400 mt-1">Stock x sucursales totales: {product.total_stock}</Text>
        )}
        <Text className="text-xs text-gray-400 mt-1">{stockTextForCustomer}</Text>

        {user?.role === 'admin' ? (
          <View className="flex-row justify-between mt-3">
            <TouchableOpacity
              onPress={() => onEdit && onEdit(product)}
              className="bg-yellow-500 py-2 px-3 rounded-md flex-1 mr-1 items-center"
            >
                <Text className="text-white font-semibold">Editar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => onToggleStatus && onToggleStatus(product)}
              className={`py-2 px-3 rounded-md flex-1 ml-1 items-center ${product.status === 'active' ? 'bg-red-500' : 'bg-green-500'}`}
            >
                <Text className="text-white font-semibold">{product.status === 'active' ? 'Archivar' : 'Restaurar'}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            onPress={handleAddToCart}
            className={`mt-3 py-2 rounded-md items-center ${selectedStoreId === null || stockInSelectedStore === null || stockInSelectedStore <= 0 || product.status === 'archived' ? 'bg-red-500' : 'bg-blue-500'}`}
            disabled={selectedStoreId === null || stockInSelectedStore === null || stockInSelectedStore <= 0 || product.status === 'archived'}
          >
            <Text className="text-white font-semibold">{selectedStoreId === null || stockInSelectedStore === null || stockInSelectedStore <= 0 || product.status === 'archived' ? 'Agotado!' : 'Añadir al Carrito'}</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
};

export default ProductCard;
