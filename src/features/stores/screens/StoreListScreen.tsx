import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity, Alert, Switch, TextInput } from 'react-native'; // Importar TextInput
import ModalForm from '../../../../src/components/Modals/ModalForm';
import StoreForm from '../components/StoreForm';
import { useStores } from '../hooks/useStores';
import { useAuth } from '../../../../src/context/AuthContext';
import { useToast } from '../../../../src/context/ToastContext';
import { createStore, updateStore, softDeleteStore, restoreStore } from '../services/storesService';
import { Store } from '../../../../src/types';
import { CreateStoreSchemaType, UpdateStoreSchemaType } from '../schemas/storeSchemas';
import Pagination from '../../../../src/components/Layout/Pagination'; // Importar el componente Pagination
import { Ionicons } from '@expo/vector-icons'; // Importar Ionicons

const StoreListScreen = () => {
  const [showModal, setShowModal] = useState<boolean>(false);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [selectedStore, setSelectedStore] = useState<Store | undefined>(undefined);
  const [showArchived, setShowArchived] = useState<boolean>(false);
  const [pendingSearchTerm, setPendingSearchTerm] = useState(''); // Estado para el texto en el input
  const [searchTerm, setSearchTerm] = useState(''); // Estado local para el término de búsqueda actual

  const { user } = useAuth();
  const isAdmin = user?.role === 'admin'; // Determinar si el usuario es admin

  const { stores, isLoading, error, fetchStores, currentPage, totalPages, totalItems, limit, setPage, setLimit } =
    useStores(showArchived, searchTerm, isAdmin); // Pasar el searchTerm local al hook useStores

  const { showToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    fetchStores(showArchived, searchTerm, isAdmin); // Usar el searchTerm local para las dependencias
  }, [showArchived, searchTerm, isAdmin, fetchStores]); // Usar el searchTerm local aquí

  const handleCreateStore = () => {
    setIsEditMode(false);
    setSelectedStore(undefined);
    setShowModal(true);
  };

  const handleEditStore = (store: Store) => {
    setIsEditMode(true);
    setSelectedStore(store);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedStore(undefined);
    setIsEditMode(false);
  };

  const handlePendingSearchChange = (text: string) => {
    setPendingSearchTerm(text);
  };

  const handleSearchSubmit = () => {
    setSearchTerm(pendingSearchTerm); // Actualiza el searchTerm local
    setPage(1);
  };

  const handleFormSubmit = useCallback(async (
    data: CreateStoreSchemaType | UpdateStoreSchemaType
  ) => {
    setIsSubmitting(true);
    try {
      if (isEditMode && selectedStore?.id) {
        await updateStore(selectedStore.id, data as UpdateStoreSchemaType);
        showToast('success', 'Tienda Actualizada', `La tienda "${data.name}" ha sido actualizada.`);
      } else {
        await createStore(data as CreateStoreSchemaType);
        showToast('success', 'Tienda Creada', `La tienda "${data.name}" ha sido creada.`);
      }
      fetchStores(showArchived, searchTerm, isAdmin); // Pasar isAdmin
      setPage(1);
      handleCloseModal();
    } catch (err) {
      const errorMessage = (err instanceof Error) ? err.message : 'Error al guardar la tienda.';
      showToast('error', 'Error', errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  }, [isEditMode, selectedStore, fetchStores, showToast, showArchived, searchTerm, setPage, isAdmin]); // Usar searchTerm local como dependencia aquí

  const handleToggleStoreStatus = (store: Store) => {
    Alert.alert(
      store.status === 'active' ? 'Archivar Tienda' : 'Restaurar Tienda',
      `¿Estás seguro de que quieres ${store.status === 'active' ? 'archivar' : 'restaurar'} la tienda "${store.name}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: store.status === 'active' ? 'Archivar' : 'Restaurar',
          onPress: async () => {
            setIsSubmitting(true);
            try {
              if (store.status === 'active') {
                await softDeleteStore(store.id);
                showToast('success', 'Tienda Archivada', `La tienda "${store.name}" ha sido archivada.`);
              } else {
                await restoreStore(store.id);
                showToast('success', 'Tienda Restaurada', `La tienda "${store.name}" ha sido restaurada.`);
              }
              fetchStores(showArchived, searchTerm, isAdmin); // Pasar isAdmin
              setPage(1);
            } catch (err) {
              const errorMessage = (err instanceof Error) ? err.message : 'Error al cambiar el estado de la tienda.';
              showToast('error', 'Error', errorMessage);
            } finally {
              setIsSubmitting(false);
            }
          },
          style: store.status === 'active' ? 'destructive' : 'default',
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-100">
        <ActivityIndicator size="large" color="#0000ff" />
        <Text className="mt-2 text-gray-600">Cargando tiendas...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 items-center justify-center bg-red-100 p-4">
        <Text className="text-red-700 text-lg font-bold mb-2">Error al cargar tiendas</Text>
        <Text className="text-red-600 text-center">{error}</Text>
        <TouchableOpacity onPress={() => { setPage(1); fetchStores(showArchived, searchTerm, isAdmin); }} className="mt-4 px-4 py-2 bg-red-500 rounded-lg">
          <Text className="text-white font-bold">Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const displayedStores = stores || [];

  return (
    <View className="flex-1 bg-white">
      {isAdmin && ( // Usar isAdmin directamente aquí
        <View className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-4 bg-gray-50 border-b border-gray-200">
          <Text className="text-xl font-bold text-gray-800 mb-2 sm:mb-0">Gestión de Sucursales</Text>
          <View className="flex flex-col sm:flex-row items-center">
            <View className="flex-row items-center mb-2 sm:mb-0 sm:mr-4">{/* Agrupar Switch y texto */}
              <Text className="text-base text-gray-700 mr-2">Mostrar Archivados:</Text>
              <Switch
                onValueChange={value => { setShowArchived(value); setPage(1); }} // Resetear página al cambiar filtro
                value={showArchived}
              />
            </View>
            <TouchableOpacity
              onPress={handleCreateStore}
              className="bg-blue-600 px-4 py-2 rounded-md w-full sm:w-auto" // Botón de ancho completo en móvil, auto en sm
              disabled={isSubmitting}
            >
              <Text className="text-white font-semibold text-center">Nueva Sucursal</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Sección de Búsqueda */}
      <View className="p-4 border-b border-gray-200 bg-gray-50">
        <View className="flex-row items-center mb-3">
          <TextInput
            className="flex-1 border border-gray-300 rounded-md p-2 text-gray-800 bg-white mr-2"
            placeholder="Buscar sucursales..."
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
      </View>

      {displayedStores.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <Text className="text-gray-500 text-lg">No hay tiendas {showArchived ? 'archivadas' : 'activas'} para mostrar.</Text>
          {searchTerm && <Text className="text-gray-500 text-base mt-2">Intenta otra búsqueda.</Text>}
        </View>
      ) : (
        <FlatList
          data={displayedStores}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View className="flex-row items-center justify-between bg-white p-4 mb-3 rounded-lg shadow-sm mx-4">
              <View className="flex-1 mr-4">
                <Text className="text-lg font-semibold text-gray-800">{item.name}</Text>
                {item.address && <Text className="text-sm text-gray-500 mt-1" numberOfLines={2}>{item.address}</Text>}
                {item.status === 'archived' && (
                  <Text className="text-sm text-red-500 font-bold mt-1">ARCHIVADA</Text>
                )}
              </View>
              {isAdmin && ( // Usar isAdmin directamente aquí
                <View className="flex-row">
                  <TouchableOpacity
                    onPress={() => handleEditStore(item)}
                    className="bg-yellow-500 px-3 py-2 rounded-md mr-2"
                  >
                    <Text className="text-white font-semibold">Editar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleToggleStoreStatus(item)}
                    className={`px-3 py-2 rounded-md ${item.status === 'active' ? 'bg-red-500' : 'bg-green-500'}`}
                  >
                    <Text className="text-white font-semibold">{item.status === 'active' ? 'Archivar' : 'Restaurar'}</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
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
        onClose={handleCloseModal}
        title={isEditMode ? "Editar Tienda" : "Crear Nueva Tienda"}
      >
        <StoreForm
          type={isEditMode ? "edit" : "create"}
          initialData={selectedStore}
          onSubmit={handleFormSubmit}
          onCancel={handleCloseModal}
          isLoading={isSubmitting}
        />
      </ModalForm>
    </View>
  );
};

export default StoreListScreen;
