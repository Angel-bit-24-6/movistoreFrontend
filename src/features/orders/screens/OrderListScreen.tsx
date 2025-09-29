import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity, Alert, TextInput } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import ModalForm from '../../../../src/components/Modals/ModalForm';
import { useOrders } from '../hooks/useOrders';
import { useAuth } from '../../../../src/context/AuthContext';
import { useToast } from '../../../../src/context/ToastContext';
import { Order } from '../../../../src/types';
import { updateOrderStatus } from '../services/ordersService';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MainStackParamList } from '../../../../src/navigation/MainStack';
import { DrawerParamList } from '../../../../src/navigation/DrawerNavigator';
import { CompositeScreenProps } from '@react-navigation/native';
import { DrawerScreenProps } from '@react-navigation/drawer';
import Pagination from '../../../../src/components/Layout/Pagination'; // Importar el componente Pagination
import { Ionicons } from '@expo/vector-icons'; // Importar Ionicons
import { useStore } from '../../../../src/context/StoreContext'; // Para el filtro de tiendas

type OrderListScreenProps = CompositeScreenProps<
  DrawerScreenProps<DrawerParamList, 'OrderListDrawer'>,
  NativeStackScreenProps<MainStackParamList>
>;

const OrderListScreen = ({ navigation }: OrderListScreenProps) => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const { showToast } = useToast();

  const [pendingSearchTerm, setPendingSearchTerm] = useState('');
  const [showModal, setShowModal] = useState<boolean>(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const { stores, isLoadingStores, errorStores } = useStore();

  const {
    orders,
    isLoading,
    error,
    fetchOrders,
    currentPage,
    totalPages,
    totalItems,
    limit,
    setPage,
    setLimit,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    storeIdFilter,
    setStoreIdFilter,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
  } = useOrders(); // El hook ahora maneja sus propios estados iniciales

  useEffect(() => {
    // Los filtros ya se gestionan internamente por el hook useOrders cuando sus estados cambian
    // fetchOrders() se llama automáticamente en el useEffect del hook
  }, []); // Dependencias vacías para que este useEffect no cause un loop, el hook ya tiene el suyo

  const handlePendingSearchChange = (text: string) => {
    setPendingSearchTerm(text);
  };

  const handleSearchSubmit = () => {
    setSearchTerm(pendingSearchTerm);
    setPage(1); // Resetear a la primera página en cada nueva búsqueda
  };

  const handleChangeStatus = (itemValue: typeof statusFilter) => {
    setStatusFilter(itemValue);
    setPage(1); // Resetear a la primera página cuando cambia el filtro de estado
  };

  const handleStoreFilterChange = (itemValue: string | null) => {
    setStoreIdFilter(itemValue ? parseInt(itemValue, 10) : null);
    setPage(1); // Resetear a la primera página cuando cambia el filtro de tienda
  };

  const handleOpenChangeStatusModal = (order: Order) => {
    setSelectedOrder(order);
    setShowModal(true);
  };

  const handleCloseChangeStatusModal = () => {
    setSelectedOrder(undefined);
    setShowModal(false);
  };

  const handleUpdateOrderStatus = useCallback(async (newStatus: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled') => {
    if (!selectedOrder?.id) return;

    setIsSubmitting(true);
    try {
      await updateOrderStatus(selectedOrder.id, newStatus);
      showToast('success', 'Estado Actualizado', `El estado de la orden #${selectedOrder.id} ha sido actualizado a ${newStatus}.`);
      fetchOrders(); // Refetch con los filtros y paginación actuales
      handleCloseChangeStatusModal();
    } catch (err) {
      const errorMessage = (err instanceof Error) ? err.message : 'Error al actualizar el estado de la orden.';
      showToast('error', 'Error', errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  }, [selectedOrder, fetchOrders, showToast]);

  if (isLoading || isLoadingStores) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-100">
        <ActivityIndicator size="large" color="#0000ff" />
        <Text className="mt-2 text-gray-600">Cargando órdenes...</Text>
      </View>
    );
  }

  if (error || errorStores) {
    return (
      <View className="flex-1 items-center justify-center bg-red-100 p-4">
        <Text className="text-red-700 text-lg font-bold mb-2">Error al cargar órdenes o tiendas</Text>
        <Text className="text-red-600 text-center">{String(error || '') || String(errorStores)}</Text>
        <TouchableOpacity onPress={() => { setPage(1); fetchOrders(); }} className="mt-4 px-4 py-2 bg-red-500 rounded-lg">
          <Text className="text-white font-bold">Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">

      <View className="p-4 border-b border-gray-200 bg-gray-50">
        {/* Sección de Búsqueda */}
        <View className="flex-row items-center mb-3">
          <TextInput
            className="flex-1 border border-gray-300 rounded-md p-2 text-gray-800 bg-white mr-2"
            placeholder={isAdmin ? "Buscar órdenes (por cliente o tienda)..." : "Buscar órdenes por tienda..."}
            value={pendingSearchTerm}
            onChangeText={handlePendingSearchChange}
            onSubmitEditing={handleSearchSubmit}
            returnKeyType="search"
          />
          <TouchableOpacity
            onPress={handleSearchSubmit}
            className="bg-blue-600 p-2 rounded-md"
            disabled={isLoading}
          >
            <Ionicons name="search" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {/* Filtro por Estado */}
        <Text className="text-lg font-semibold text-gray-700 mb-2">Filtrar por Estado:</Text>
        <View className="border border-gray-300 rounded-md bg-white mb-3">
          <Picker
            selectedValue={statusFilter}
            onValueChange={handleChangeStatus}
          >
            <Picker.Item label="Todos" value="all" />
            <Picker.Item label="Pendiente" value="pending" />
            <Picker.Item label="Procesando" value="processing" />
            <Picker.Item label="Enviado" value="shipped" />
            <Picker.Item label="Entregado" value="delivered" />
            <Picker.Item label="Cancelado" value="cancelled" />
          </Picker>
        </View>

        {/* Filtro por Tienda (Solo para administradores) */}
        {isAdmin && stores.length > 0 && (
          <View className="mb-3">
            <Text className="text-lg font-semibold text-gray-700 mb-2">Filtrar por Tienda:</Text>
            <View className="border border-gray-300 rounded-md bg-white">
              <Picker
                selectedValue={storeIdFilter ? storeIdFilter.toString() : ''}
                onValueChange={handleStoreFilterChange}
              >
                <Picker.Item label="Todas las tiendas" value="" />
                {stores.map(store => (
                  <Picker.Item key={store.id} label={store.name} value={store.id.toString()} />
                ))}
              </Picker>
            </View>
          </View>
        )}

        {/* Aquí se podrían añadir filtros de fecha, si es necesario */}
      </View>

      {orders.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <Text className="text-gray-500 text-lg">No hay órdenes para mostrar.</Text>
          {searchTerm && <Text className="text-gray-500 text-base mt-2">Intenta otra búsqueda.</Text>}
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => navigation.navigate('OrderDetail', { orderId: item.id })}
              className="bg-white p-4 mb-3 rounded-lg shadow-sm mx-4"
            >
              <Text className="text-lg font-bold text-gray-800 mb-1">Orden #{item.id}</Text>
              {item.user_name && <Text className="text-sm text-gray-600">Cliente: {item.user_name}</Text>}
              {item.store_name && <Text className="text-sm text-gray-600">Tienda: {item.store_name}</Text>}
              <Text className="text-sm text-gray-600">Estado: {item.status}</Text>
              <Text className="text-sm text-gray-600">Total: ${item.total.toFixed(2)}</Text>
              <Text className="text-sm text-gray-600">Fecha: {new Date(item.created_at).toLocaleDateString()}</Text>
              {isAdmin && ( // Botón para cambiar estado solo para admins
                <TouchableOpacity
                  onPress={() => handleOpenChangeStatusModal(item)}
                  className="mt-3 bg-blue-500 px-3 py-1 rounded-md self-start"
                >
                  <Text className="text-white text-sm font-semibold">Cambiar Estado</Text>
                </TouchableOpacity>
              )}
            </TouchableOpacity>
          )}
          contentContainerClassName="py-4"
        />
      )}

      {/* Paginación */}
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setPage}
          isLoading={isLoading}
        />
      )}

      <ModalForm
        isVisible={showModal}
        onClose={handleCloseChangeStatusModal}
        title={`Cambiar Estado de Orden #${selectedOrder?.id}`}
      >
        <View className="p-4 bg-white rounded-lg">
          <Text className="text-lg font-semibold text-gray-700 mb-2">Nuevo Estado:</Text>
          <View className="border border-gray-300 rounded-md bg-white mb-4">
            <Picker
              selectedValue={selectedOrder?.status || 'pending'}
              onValueChange={(itemValue: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled') => {
                if (selectedOrder) {
                  setSelectedOrder({ ...selectedOrder, status: itemValue });
                }
              }}
            >
              <Picker.Item label="Pendiente" value="pending" />
              <Picker.Item label="Procesando" value="processing" />
              <Picker.Item label="Enviado" value="shipped" />
              <Picker.Item label="Entregado" value="delivered" />
              <Picker.Item label="Cancelado" value="cancelled" />
            </Picker>
          </View>
          <TouchableOpacity
            onPress={() => selectedOrder && handleUpdateOrderStatus(selectedOrder.status)}
            className={`bg-green-600 px-4 py-2 rounded-md ${isSubmitting ? 'opacity-50' : ''}`}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-semibold text-center">Guardar Cambios</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleCloseChangeStatusModal}
            className="bg-gray-300 px-4 py-2 rounded-md mt-2"
            disabled={isSubmitting}
          >
            <Text className="text-gray-800 font-semibold text-center">Cancelar</Text>
          </TouchableOpacity>
        </View>
      </ModalForm>
    </View>
  );
};

export default OrderListScreen;
