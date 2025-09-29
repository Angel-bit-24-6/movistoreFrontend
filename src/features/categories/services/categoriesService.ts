import api from '../../../../src/services/api';
import { ApiResponse, Category, CategoryListResponse } from '../../../../src/types'; // Importar CategoryListResponse

interface CreateCategoryData {
  name: string;
  description?: string;
}

interface UpdateCategoryData {
  name?: string;
  description?: string;
  status?: 'active' | 'archived';
}

export const getAllCategories = async (
  page: number = 1,
  limit: number = 10,
  includeArchived: boolean = false,
  searchTerm: string = ''
): Promise<CategoryListResponse> => {
  try {
    const response = await api.get<ApiResponse<{ categories: Category[]; pagination: { currentPage: number; totalPages: number; totalItems: number; limit: number; } }>>('/categories', {
      params: { page, limit, includeArchived, searchTerm },
    });
    return {
      categories: response.data.data.categories,
      pagination: {
        currentPage: response.data.data.pagination.currentPage,
        totalPages: response.data.data.pagination.totalPages,
        totalItems: response.data.data.pagination.totalItems,
        limit: response.data.data.pagination.limit,
      },
    };
  } catch (error) {
    // @ts-ignore
    throw new Error(error.response?.data?.message || 'Error al obtener las categorías.');
  }
};

export const createCategory = async (data: CreateCategoryData): Promise<Category> => {
  try {
    const response = await api.post<ApiResponse<Category>>('/categories', data);
    return response.data.data;
  } catch (error) {
    // @ts-ignore
    throw new Error(error.response?.data?.message || 'Error al crear la categoría.');
  }
};

export const updateCategory = async (id: number, data: UpdateCategoryData): Promise<Category> => {
  try {
    const response = await api.patch<ApiResponse<Category>>(`/categories/${id}`, data);
    return response.data.data;
  } catch (error) {
    // @ts-ignore
    throw new Error(error.response?.data?.message || 'Error al actualizar la categoría.');
  }
};

export const softDeleteCategory = async (id: number): Promise<void> => {
  try {
    await api.patch<ApiResponse<void>>(`/categories/${id}/soft-delete`);
  } catch (error) {
    // @ts-ignore
    throw new Error(error.response?.data?.message || 'Error al archivar la categoría.');
  }
};

export const restoreCategory = async (id: number): Promise<void> => {
  try {
    await api.patch<ApiResponse<void>>(`/categories/${id}/restore`);
  } catch (error) {
    // @ts-ignore
    throw new Error(error.response?.data?.message || 'Error al restaurar la categoría.');
  }
};
