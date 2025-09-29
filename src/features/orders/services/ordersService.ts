import api from '../../../../src/services/api';
import { ApiResponse, Order, OrderListResponse, PaginationResult } from '../../../../src/types'; // Importar OrderListResponse y PaginationResult
import { CreateOrderSchemaType, UpdateOrderStatusSchemaType } from '../schemas/orderSchemas';

export const createOrder = async (
  userId: number,
  storeId: number,
  items: { product_id: number; quantity: number; }[]
): Promise<Order> => {
  try {
    const response = await api.post<ApiResponse<{ order: Order }>>('/orders', {
      store_id: storeId,
      items,
    });
    return response.data.data.order; // Acceder directamente al objeto 'order'
  } catch (error) {
    // @ts-ignore
    throw new Error(error.response?.data?.message || 'Error al crear la orden.');
  }
};

export const getAllOrders = async (
  page: number = 1,
  limit: number = 10,
  userId?: number,
  storeId?: number,
  status?: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | '',
  searchTerm?: string,
  startDate?: string,
  endDate?: string,
): Promise<OrderListResponse> => {
  try {
    const response = await api.get<ApiResponse<{ orders: Order[]; pagination: PaginationResult }>>('/orders', {
      params: { page, limit, userId, storeId, status, searchTerm, startDate, endDate },
    });
    return {
      orders: response.data.data.orders,
      pagination: {
        currentPage: response.data.data.pagination.currentPage,
        totalPages: response.data.data.pagination.totalPages,
        totalItems: response.data.data.pagination.totalItems,
        limit: response.data.data.pagination.limit,
      },
    };
  } catch (error) {
    // @ts-ignore
    throw new Error(error.response?.data?.message || 'Error al obtener las órdenes.');
  }
};

export const getOrderById = async (id: number): Promise<Order> => {
  try {
    const response = await api.get<ApiResponse<{ order: Order }>>(`/orders/${id}`);
    return response.data.data.order;
  } catch (error) {
    // @ts-ignore
    throw new Error(error.response?.data?.message || `Error al obtener la orden con ID ${id}.`);
  }
};

export const updateOrderStatus = async (id: number, status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'): Promise<Order> => {
  try {
    const response = await api.patch<ApiResponse<Order>>(`/orders/${id}/status`, { status });
    return response.data.data;
  } catch (error) {
    // @ts-ignore
    throw new Error(error.response?.data?.message || `Error al actualizar el estado de la orden con ID ${id}.`);
  }
};
