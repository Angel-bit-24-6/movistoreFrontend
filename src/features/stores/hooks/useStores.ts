import { useState, useEffect, useCallback } from 'react';
import { getAllStores } from '../services/storesService';
import { Store, StoreListResponse } from '../../../../src/types'; // Importar StoreListResponse y PaginationResult
import { useToast } from '../../../../src/context/ToastContext';

interface UseStoresResult {
  stores: Store[];
  isLoading: boolean;
  error: string | null;
  fetchStores: (includeArchived?: boolean, searchTerm?: string, isAdmin?: boolean) => Promise<void>; // Actualizar la firma
  currentPage: number;
  totalPages: number;
  totalItems: number;
  limit: number;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  searchTerm: string; // Añadir searchTerm a la interfaz
  setSearchTerm: (searchTerm: string) => void;
}

export const useStores = (
  includeArchivedDefault: boolean = false,
  defaultSearchTerm: string = '',
  isAdminDefault: boolean = false, // Añadir isAdminDefault
  initialPage: number = 1,
  initialLimit: number = 10,
): UseStoresResult => {
  const [stores, setStores] = useState<Store[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(initialPage);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [limit, setLimit] = useState<number>(initialLimit);
  const [searchTerm, setSearchTerm] = useState<string>(defaultSearchTerm);
  const { showToast } = useToast();

  const fetchStores = useCallback(async (
    includeArchivedOverride?: boolean,
    searchTermOverride?: string,
    isAdminOverride?: boolean, // Añadir isAdminOverride
  ) => {
    setIsLoading(true);
    setError(null);
    try {
      const pageToFetch = currentPage;
      const limitToFetch = limit;
      const currentSearchTerm = searchTermOverride !== undefined ? searchTermOverride : searchTerm;
      const currentIsAdmin = isAdminOverride ?? isAdminDefault; // Usar isAdminDefault/Override

      const response: StoreListResponse = await getAllStores(
        pageToFetch,
        limitToFetch,
        includeArchivedOverride ?? includeArchivedDefault,
        currentSearchTerm,
        currentIsAdmin // Pasar currentIsAdmin
      );

      setStores(response.stores || []);
      setCurrentPage(response.pagination.currentPage);
      setTotalPages(response.pagination.totalPages);
      setTotalItems(response.pagination.totalItems);
      setLimit(response.pagination.limit);

    } catch (err) {
      const errorMessage = (err instanceof Error) ? err.message : 'Error desconocido al cargar sucursales';
      setError(errorMessage);
      setStores([]);
      showToast('error', 'Error de carga', `No se pudieron cargar las sucursales: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  }, [showToast, includeArchivedDefault, searchTerm, currentPage, limit, isAdminDefault]); // Añadir isAdminDefault a las dependencias

  useEffect(() => {
    fetchStores();
  }, [fetchStores]);

  return {
    stores,
    isLoading,
    error,
    fetchStores: useCallback((incArch, sTerm, isAd) => fetchStores(incArch, sTerm, isAd), [fetchStores]), // Actualizar useCallback
    currentPage,
    totalPages,
    totalItems,
    limit,
    setPage: setCurrentPage,
    setLimit,
    setSearchTerm,
  };
};
