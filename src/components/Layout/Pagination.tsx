import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // Para iconos, asumiendo que ya está instalado

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean; // Para deshabilitar botones durante la carga
}

const Pagination = ({ currentPage, totalPages, onPageChange, isLoading = false }: PaginationProps) => {
  const isFirstPage = currentPage === 1;
  const isLastPage = currentPage === totalPages;

  const handlePrevious = () => {
    if (!isFirstPage && !isLoading) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (!isLastPage && !isLoading) {
      onPageChange(currentPage + 1);
    }
  };

  // Puedes añadir lógica para mostrar un rango de números de página aquí si es necesario
  const renderPageNumbers = () => {
    const pages = [];
    const maxPageNumbers = 5; // Mostrar un máximo de 5 números de página
    let startPage = Math.max(1, currentPage - Math.floor(maxPageNumbers / 2));
    let endPage = Math.min(totalPages, startPage + maxPageNumbers - 1);

    if (endPage - startPage + 1 < maxPageNumbers) {
      startPage = Math.max(1, endPage - maxPageNumbers + 1);
    }

    if (startPage > 1) {
      pages.push(
        <Text key="firstEllipsis" className="text-gray-600 mx-1">...</Text>
      );
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <TouchableOpacity
          key={i}
          onPress={() => onPageChange(i)}
          disabled={isLoading}
          className={`px-3 py-1 mx-1 rounded-md ${
            currentPage === i ? 'bg-blue-600' : 'bg-gray-200'
          }`}
        >
          <Text className={`${currentPage === i ? 'text-white' : 'text-gray-700'}`}>
            {i}
          </Text>
        </TouchableOpacity>
      );
    }

    if (endPage < totalPages) {
      pages.push(
        <Text key="lastEllipsis" className="text-gray-600 mx-1">...</Text>
      );
    }

    return pages;
  };

  return (
    <View className="flex-row items-center justify-center py-4 bg-white border-t border-gray-200">
      <TouchableOpacity
        onPress={handlePrevious}
        disabled={isFirstPage || isLoading}
        className={`px-4 py-2 rounded-md ${
          isFirstPage || isLoading ? 'bg-gray-300' : 'bg-blue-500'
        } flex-row items-center`}
      >
        <Ionicons name="chevron-back" size={20} color={isFirstPage || isLoading ? "#a0aec0" : "white"} />
        <Text className={`ml-1 font-semibold ${isFirstPage || isLoading ? 'text-gray-500' : 'text-white'}`}>
          Anterior
        </Text>
      </TouchableOpacity>

      <View className="flex-row mx-2">
        {renderPageNumbers()}
      </View>

      <TouchableOpacity
        onPress={handleNext}
        disabled={isLastPage || isLoading}
        className={`px-4 py-2 rounded-md ${
          isLastPage || isLoading ? 'bg-gray-300' : 'bg-blue-500'
        } flex-row items-center`}
      >
        <Text className={`mr-1 font-semibold ${isLastPage || isLoading ? 'text-gray-500' : 'text-white'}`}>
          Siguiente
        </Text>
        <Ionicons name="chevron-forward" size={20} color={isLastPage || isLoading ? "#a0aec0" : "white"} />
      </TouchableOpacity>
    </View>
  );
};

export default Pagination;
