import { useState, useEffect, useCallback } from 'react';
import { getAllCategories } from '../services/categoriesService';
import { Category, CategoryListResponse } from '../../../types'; // Importar CategoryListResponse
import { useToast } from '../../../context/ToastContext';

interface UseCategoriesResult {
  categories: Category[];
  isLoading: boolean;
  error: string | null;
  fetchCategories: (
    includeArchived?: boolean,
    searchTerm?: string
  ) => Promise<void>;
  currentPage: number;
  totalPages: number;
  totalItems: number;
  limit: number;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
}

export const useCategories = (
  includeArchivedDefault: boolean = false,
  defaultSearchTerm: string = '',
  initialPage: number = 1,
  initialLimit: number = 10
): UseCategoriesResult => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(initialPage);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [limit, setLimit] = useState<number>(initialLimit);
  const { showToast } = useToast();

  const fetchCategories = useCallback(async (
    includeArchivedOverride?: boolean,
    searchTermOverride?: string
  ) => {
    setIsLoading(true);
    setError(null);
    try {
      const pageToFetch = currentPage;
      const limitToFetch = limit;
      const currentSearchTerm = searchTermOverride !== undefined ? searchTermOverride : defaultSearchTerm;

      const response: CategoryListResponse = await getAllCategories(
        pageToFetch,
        limitToFetch,
        includeArchivedOverride ?? includeArchivedDefault,
        currentSearchTerm
      );
      
      setCategories(response.categories || []);
      setCurrentPage(response.pagination.currentPage);
      setTotalPages(response.pagination.totalPages);
      setTotalItems(response.pagination.totalItems);
      setLimit(response.pagination.limit);

    } catch (err) {
      const errorMessage = (err instanceof Error) ? err.message : 'Error desconocido';
      setError(errorMessage);
      setCategories([]);
      showToast('error', 'Error de carga', `No se pudieron cargar las categorías: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  }, [showToast, includeArchivedDefault, defaultSearchTerm, currentPage, limit]); // Añadir currentPage y limit como dependencias

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]); // Disparar fetchCategories cuando cambian sus dependencias

  return {
    categories,
    isLoading,
    error,
    fetchCategories: useCallback((incArch, sTerm) => fetchCategories(incArch, sTerm), [fetchCategories]),
    currentPage,
    totalPages,
    totalItems,
    limit,
    setPage: setCurrentPage,
    setLimit,
  };
};
