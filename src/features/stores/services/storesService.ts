import api from '../../../../src/services/api';
import { ApiResponse, Store, StoreListResponse } from '../../../../src/types'; // Importar StoreListResponse

interface CreateStoreData {
  name: string;
  address?: string | null;
}

interface UpdateStoreData {
  name?: string;
  address?: string | null;
  status?: 'active' | 'archived';
}

export const getAllStores = async (
  page: number = 1,
  limit: number = 10,
  includeArchived: boolean = false,
  searchTerm: string = '',
  isAdmin: boolean = false // Añadir isAdmin
): Promise<StoreListResponse> => {
  try {
    const params = { page, limit, includeArchived, searchTerm, isAdmin };
    console.log('Frontend - getAllStores params:', params); // <-- Añadir este console.log
    const response = await api.get<ApiResponse<{ stores: Store[]; pagination: { currentPage: number; totalPages: number; totalItems: number; limit: number; } }>>('/stores', {
      params: params,
    });
    return {
      stores: response.data.data.stores,
      pagination: {
        currentPage: response.data.data.pagination.currentPage,
        totalPages: response.data.data.pagination.totalPages,
        totalItems: response.data.data.pagination.totalItems,
        limit: response.data.data.pagination.limit,
      },
    };
  } catch (error) {
    // @ts-ignore
    throw new Error(error.response?.data?.message || 'Error al obtener las sucursales.');
  }
};

export const createStore = async (data: CreateStoreData): Promise<Store> => {
  try {
    const response = await api.post<ApiResponse<Store>>('/stores', data);
    return response.data.data;
  } catch (error) {
    // @ts-ignore
    throw new Error(error.response?.data?.message || 'Error al crear la sucursal.');
  }
};

export const updateStore = async (id: number, data: UpdateStoreData): Promise<Store> => {
  try {
    const response = await api.patch<ApiResponse<Store>>(`/stores/${id}`, data);
    return response.data.data;
  } catch (error) {
    // @ts-ignore
    throw new Error(error.response?.data?.message || 'Error al actualizar la sucursal.');
  }
};

export const softDeleteStore = async (id: number): Promise<void> => {
  try {
    await api.patch<ApiResponse<void>>(`/stores/${id}/soft-delete`);
  } catch (error) {
    // @ts-ignore
    throw new Error(error.response?.data?.message || 'Error al archivar la sucursal.');
  }
};

export const restoreStore = async (id: number): Promise<void> => {
  try {
    await api.patch<ApiResponse<void>>(`/stores/${id}/restore`);
  } catch (error) {
    // @ts-ignore
    throw new Error(error.response?.data?.message || 'Error al restaurar la sucursal.');
  }
};
