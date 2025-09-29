import { useState, useEffect, useCallback } from 'react';
import { getAllOrders } from '../services/ordersService';
import { Order, OrderListResponse, PaginationResult } from '../../../../src/types'; // Importar OrderListResponse y PaginationResult
import { useToast } from '../../../../src/context/ToastContext';
import { useAuth } from '../../../../src/context/AuthContext'; // Para obtener el user id si es customer

interface UseOrdersResult {
  orders: Order[];
  isLoading: boolean;
  error: string | null;
  fetchOrders: (
    pageOverride?: number,
    limitOverride?: number,
    userIdOverride?: number,
    storeIdOverride?: number,
    statusFilterOverride?: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | '',
    searchTermOverride?: string,
    startDateOverride?: string,
    endDateOverride?: string,
  ) => Promise<void>;
  currentPage: number;
  totalPages: number;
  totalItems: number;
  limit: number;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  searchTerm: string;
  setSearchTerm: (searchTerm: string) => void;
  statusFilter: 'all' | 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  setStatusFilter: (status: 'all' | 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled') => void;
  storeIdFilter: number | null;
  setStoreIdFilter: (storeId: number | null) => void;
  startDate: string | undefined;
  setStartDate: (date: string | undefined) => void;
  endDate: string | undefined;
  setEndDate: (date: string | undefined) => void;
}

export const useOrders = (
  initialPage: number = 1,
  initialLimit: number = 10,
  initialStatusFilter: 'all' | 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' = 'all',
  initialSearchTerm: string = '',
  initialStoreIdFilter: number | null = null,
  initialStartDate: string | undefined = undefined,
  initialEndDate: string | undefined = undefined,
): UseOrdersResult => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(initialPage);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [limit, setLimit] = useState<number>(initialLimit);
  const [searchTerm, setSearchTerm] = useState<string>(initialSearchTerm);
  const [statusFilter, setStatusFilter] = useState<typeof initialStatusFilter>(initialStatusFilter);
  const [storeIdFilter, setStoreIdFilter] = useState<number | null>(initialStoreIdFilter);
  const [startDate, setStartDate] = useState<string | undefined>(initialStartDate);
  const [endDate, setEndDate] = useState<string | undefined>(initialEndDate);

  const { showToast } = useToast();
  const { user } = useAuth(); // Obtener el usuario autenticado

  const fetchOrders = useCallback(async (
    pageOverride?: number,
    limitOverride?: number,
    userIdOverride?: number,
    storeIdOverride?: number,
    statusFilterOverride?: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | '',
    searchTermOverride?: string,
    startDateOverride?: string,
    endDateOverride?: string,
  ) => {
    setIsLoading(true);
    setError(null);
    try {
      const pageToFetch = pageOverride ?? currentPage;
      const limitToFetch = limitOverride ?? limit;
      const currentSearchTerm = searchTermOverride ?? searchTerm;
      const determinedStatusFilter: 'all' | 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | '' = statusFilterOverride !== undefined ? statusFilterOverride : statusFilter;
      const apiStatusFilter: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | undefined = 
        (determinedStatusFilter === 'all' || determinedStatusFilter === '')
          ? undefined
          : determinedStatusFilter as Exclude<typeof determinedStatusFilter, 'all' | ''>;
      const currentStoreIdFilter = storeIdOverride ?? storeIdFilter;
      const currentStartDate = startDateOverride ?? startDate;
      const currentEndDate = endDateOverride ?? endDate;

      // Si el usuario es 'customer', filtrar por su propio userId
      const userToFetch = user?.role === 'customer' ? user.id : userIdOverride;

      const response: OrderListResponse = await getAllOrders(
        pageToFetch,
        limitToFetch,
        userToFetch, // Usar userToFetch aquí
        currentStoreIdFilter === null ? undefined : currentStoreIdFilter, // Convertir null a undefined
        apiStatusFilter, // Usar el filtro de estado compatible con la API
        currentSearchTerm,
        currentStartDate,
        currentEndDate,
      );

      setOrders(response.orders || []);
      setCurrentPage(response.pagination.currentPage);
      setTotalPages(response.pagination.totalPages);
      setTotalItems(response.pagination.totalItems);
      setLimit(response.pagination.limit);

    } catch (err) {
      const errorMessage = (err instanceof Error) ? err.message : 'Error desconocido al cargar órdenes';
      setError(errorMessage);
      setOrders([]);
      showToast('error', 'Error de carga', `No se pudieron cargar las órdenes: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  }, [
    currentPage, limit, searchTerm, statusFilter, storeIdFilter, startDate, endDate, // Añadir todos los filtros a las dependencias
    user, // Añadir user como dependencia para el filtrado por user.id
    showToast,
  ]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  return {
    orders,
    isLoading,
    error,
    fetchOrders: useCallback((p, l, uId, sId, sF, sT, sD, eD) => fetchOrders(p, l, uId, sId, sF, sT, sD, eD), [fetchOrders]),
    currentPage,
    totalPages,
    totalItems,
    limit,
    setPage: setCurrentPage,
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
  };
};
