import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity, Alert, Switch, TextInput } from 'react-native'; // Importar TextInput
import ModalForm from '../../../../src/components/Modals/ModalForm';
import CategoryForm from '../components/CategoryForm';
import { useCategories } from '../hooks/useCategories';
import { useAuth } from '../../../../src/context/AuthContext';
import { useToast } from '../../../../src/context/ToastContext';
import { createCategory, updateCategory, softDeleteCategory, restoreCategory } from '../services/categoriesService';
import { Category } from '../../../../src/types';
import { CreateCategorySchemaType, UpdateCategorySchemaType } from '../schemas/categorySchemas';
import Pagination from '../../../../src/components/Layout/Pagination'; // Importar el componente Pagination
import { Ionicons } from '@expo/vector-icons'; // Importar Ionicons

const CategoryListScreen = () => {
  const [showArchived, setShowArchived] = useState(false);
  const [searchTerm, setSearchTerm] = useState(''); // Estado para el término de búsqueda actual
  const [pendingSearchTerm, setPendingSearchTerm] = useState(''); // Estado para el texto en el input de búsqueda

  // Desestructurar las nuevas propiedades de paginación del hook useCategories
  const { categories, isLoading, error, fetchCategories, currentPage, totalPages, totalItems, limit, setPage, setLimit } =
    useCategories(showArchived, searchTerm); // Pasar el searchTerm al hook

  const { user } = useAuth();
  const { showToast } = useToast();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchCategories(showArchived, searchTerm); // El hook gestiona currentPage y limit internamente
  }, [showArchived, searchTerm, fetchCategories]); // Añadir searchTerm como dependencia

  const handleOpenCreateModal = () => {
    setEditingCategory(null);
    setIsModalVisible(true);
  };

  const handleOpenEditModal = (category: Category) => {
    setEditingCategory(category);
    setIsModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
    setEditingCategory(null);
  };

  // Función para manejar el cambio de texto en el input de búsqueda
  const handlePendingSearchChange = (text: string) => {
    setPendingSearchTerm(text);
  };

  // Función para enviar la búsqueda
  const handleSearchSubmit = () => {
    setSearchTerm(pendingSearchTerm); // Actualiza el searchTerm que usa el hook
    setPage(1); // Resetear a la primera página en cada nueva búsqueda
  };

  const handleCreateCategory = async (data: CreateCategorySchemaType) => {
    setIsSubmitting(true);
    try {
      await createCategory(data);
      showToast('success', 'Categoría Creada', 'La categoría ha sido creada exitosamente.');
      fetchCategories(showArchived, searchTerm); // Asegurarse de pasar showArchived y searchTerm
      setPage(1); // Resetear a la primera página si se crea una categoría
      handleCloseModal();
    } catch (err) {
      const errorMessage = (err instanceof Error) ? err.message : 'Error al crear la categoría.';
      showToast('error', 'Error', errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateCategory = async (data: UpdateCategorySchemaType) => {
    if (!editingCategory) return;
    setIsSubmitting(true);
    try {
      await updateCategory(editingCategory.id, data);
      showToast('success', 'Categoría Actualizada', 'La categoría ha sido actualizada exitosamente.');
      fetchCategories(showArchived, searchTerm); // Asegurarse de pasar showArchived y searchTerm
      handleCloseModal();
    } catch (err) {
      const errorMessage = (err instanceof Error) ? err.message : 'Error al actualizar la categoría.';
      showToast('error', 'Error', errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (category: Category) => {
    Alert.alert(
      category.status === 'active' ? 'Archivar Categoría' : 'Restaurar Categoría',
      `¿Estás seguro de que quieres ${category.status === 'active' ? 'archivar' : 'restaurar'} la categoría "${category.name}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: category.status === 'active' ? 'Archivar' : 'Restaurar',
          onPress: async () => {
            setIsSubmitting(true);
            try {
              if (category.status === 'active') {
                await softDeleteCategory(category.id);
                showToast('success', 'Categoría Archivada', `La categoría "${category.name}" ha sido archivada.`);
              } else {
                await restoreCategory(category.id);
                showToast('success', 'Categoría Restaurada', `La categoría "${category.name}" ha sido restaurada.`);
              }
              fetchCategories(showArchived, searchTerm); // Refrescar con la misma página y búsqueda
            } catch (err) {
              const errorMessage = (err instanceof Error) ? err.message : 'Error al cambiar el estado de la categoría.';
              showToast('error', 'Error', errorMessage);
            } finally {
              setIsSubmitting(false);
            }
          },
          style: category.status === 'active' ? 'destructive' : 'default',
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-100">
        <ActivityIndicator size="large" color="#0000ff" />
        <Text className="mt-2 text-gray-600">Cargando categorías...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 items-center justify-center bg-red-100 p-4">
        <Text className="text-red-700 text-lg font-bold mb-2">Error al cargar categorías</Text>
        <Text className="text-red-600 text-center">{error}</Text>
        <TouchableOpacity onPress={() => { setPage(1); fetchCategories(showArchived, searchTerm); }} className="mt-4 px-4 py-2 bg-red-500 rounded-lg">
          <Text className="text-white font-bold">Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const displayedCategories = categories || []; // Ahora categories ya viene filtrado y paginado del hook/servicio

  return (
    <View className="flex-1 bg-white">
      <View className="flex-row justify-between items-center p-4 bg-gray-50 border-b border-gray-200">
        <Text className="text-xl font-bold text-gray-800">Categorías</Text>
        {user?.role === 'admin' && (
          <TouchableOpacity
            onPress={handleOpenCreateModal}
            className="bg-blue-600 px-4 py-2 rounded-md"
            disabled={isSubmitting}
          >
            <Text className="text-white font-semibold">Nueva Categoría</Text>
          </TouchableOpacity>
        )}
      </View>

      <View className="p-4 border-b border-gray-200 bg-gray-50">
        <View className="flex-row items-center mb-3">{/* Contenedor para el TextInput y el botón */}
          <TextInput
            className="flex-1 border border-gray-300 rounded-md p-2 text-gray-800 bg-white mr-2"
            placeholder="Buscar categorías..."
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

        <View className="flex-row items-center justify-end">
          <Text className="text-base text-gray-700 mr-2">Mostrar Archivadas:</Text>
          <Switch
            onValueChange={value => { setShowArchived(value); setPage(1); }} // Resetear página al cambiar filtro
            value={showArchived}
          />
        </View>
      </View>

      {displayedCategories.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <Text className="text-gray-500 text-lg">No hay categorías {showArchived ? 'archivadas' : 'activas'} para mostrar.</Text>
          {searchTerm && <Text className="text-gray-500 text-base mt-2">Intenta otra búsqueda.</Text>}
        </View>
      ) : (
        <FlatList
          data={displayedCategories}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View className="flex-row items-center justify-between bg-white p-4 mb-3 mx-4 rounded-lg shadow-sm border border-gray-100">
              <View className="flex-1">
                <Text className="text-lg font-semibold text-gray-800">{item.name}</Text>
                {item.description && <Text className="text-sm text-gray-600 mt-1" numberOfLines={2}>{item.description}</Text>}
                <Text className="text-xs text-gray-400 mt-1">Estado: {item.status === 'active' ? 'Activa' : 'Archivada'}</Text>
              </View>
              {user?.role === 'admin' && (
                <View className="flex-row ml-4">
                  <TouchableOpacity
                    onPress={() => handleOpenEditModal(item)}
                    className="bg-yellow-500 p-2 rounded-md mr-2"
                    disabled={isSubmitting}
                  >
                    <Text className="text-white font-semibold">Editar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleToggleStatus(item)}
                    className={`p-2 rounded-md ${item.status === 'active' ? 'bg-red-500' : 'bg-green-500'}`}
                    disabled={isSubmitting}
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
        isVisible={isModalVisible}
        onClose={handleCloseModal}
        title={editingCategory ? 'Editar Categoría' : 'Crear Categoría'}
      >
        <CategoryForm
          type={editingCategory ? 'edit' : 'create'}
          initialData={editingCategory || undefined}
          onSubmit={editingCategory ? handleUpdateCategory : handleCreateCategory}
          onCancel={handleCloseModal}
          isLoading={isSubmitting}
        />
      </ModalForm>
    </View>
  );
};

export default CategoryListScreen;
