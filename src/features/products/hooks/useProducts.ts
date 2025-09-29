import { useState, useEffect, useCallback } from 'react';
import { getAllProducts } from '../services/productsService';
import { Product, ProductListResponse } from '../../../types'; // Asegúrate de que PaginationResult esté definido en types.ts
import { useToast } from '../../../context/ToastContext';
import { useStore } from '../../../context/StoreContext';

interface UseProductsResult {
  products: Product[];
  isLoading: boolean;
  error: string | null;
  fetchProducts: (
    includeArchived?: boolean,
    searchTerm?: string,
    categoryId?: number | null
  ) => Promise<void>;
  currentPage: number;
  totalPages: number;
  totalItems: number;
  limit: number;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
}

export const useProducts = (
  includeArchivedDefault: boolean = false,
  defaultSearchTerm: string = '',
  defaultCategoryId: number | null = null,
  initialPage: number = 1,
  initialLimit: number = 10,
): UseProductsResult => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(initialPage);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [limit, setLimit] = useState<number>(initialLimit);

  const { showToast } = useToast();
  const { selectedStoreId } = useStore();

  const fetchProducts = useCallback(async (
    includeArchivedOverride?: boolean,
    searchTermOverride?: string,
    categoryIdOverride?: number | null
  ) => {
    setIsLoading(true);
    setError(null);
    try {
      const pageToFetch = currentPage; // Usar la página actual del estado
      const limitToFetch = limit; // Usar el límite actual del estado
      const currentSearchTerm = searchTermOverride !== undefined ? searchTermOverride : defaultSearchTerm;
      const currentCategoryId = categoryIdOverride !== undefined ? categoryIdOverride : defaultCategoryId;

      const response: ProductListResponse = await getAllProducts(
        pageToFetch,
        limitToFetch,
        includeArchivedOverride ?? includeArchivedDefault,
        currentSearchTerm,
        selectedStoreId,
        currentCategoryId
      );
      
      setProducts(response.products || []);
      setCurrentPage(response.pagination.currentPage);
      setTotalPages(response.pagination.totalPages);
      setTotalItems(response.pagination.totalItems);
      setLimit(response.pagination.limit);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido al cargar productos';
      setError(errorMessage);
      setProducts([]);
      showToast('error', 'Error de carga', errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [showToast, includeArchivedDefault, defaultSearchTerm, selectedStoreId, defaultCategoryId, currentPage, limit]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]); // Disparar fetchProducts cuando cambian sus dependencias

  return {
    products,
    isLoading,
    error,
    fetchProducts: useCallback((incArch, sTerm, catId) => fetchProducts(incArch, sTerm, catId), [fetchProducts]), // Envolver fetchProducts en useCallback para la interfaz
    currentPage,
    totalPages,
    totalItems,
    limit,
    setPage: setCurrentPage,
    setLimit,
  };
};
