import api from '../../../services/api';
import { ApiResponse, Product, ImageUploadFile, ProductListResponse } from '../../../types'; // Asegúrate de importar ProductListResponse
import { CreateProductSchemaType, UpdateProductSchemaType, UpdateProductStockSchemaType } from '../schemas/productSchemas';

export const getAllProducts = async (
  page: number = 1, // Nuevo parámetro de paginación
  limit: number = 10, // Nuevo parámetro de paginación
  includeArchived: boolean = false,
  searchTerm?: string,
  storeId?: number | null,
  categoryId?: number | null
): Promise<ProductListResponse> => { // El tipo de retorno ahora es ProductListResponse
  try {
    const response = await api.get<ApiResponse<{ products: Product[]; pagination: { currentPage: number; totalPages: number; totalItems: number; limit: number; } }>>('/products', {
      params: { page, limit, includeArchived, searchTerm, storeId, categoryId }, // Pasar page y limit a los parámetros
    });
    // La API debe devolver un objeto con 'products' y 'pagination' dentro de 'data'
    return {
      products: response.data.data.products,
      pagination: {
        currentPage: response.data.data.pagination.currentPage,
        totalPages: response.data.data.pagination.totalPages,
        totalItems: response.data.data.pagination.totalItems,
        limit: response.data.data.pagination.limit,
      },
    };
  } catch (error) {
    // @ts-ignore
    throw new Error(error.response?.data?.message || 'Error al obtener los productos.');
  }
};

export const getProductById = async (id: number, storeId?: number | null, isAdmin: boolean = false): Promise<Product> => {
  try {
    const endpoint = isAdmin ? `/products/${id}/admin-detail` : `/products/${id}`;
    const response = await api.get<ApiResponse<{ product: Product }>>(endpoint, {
      params: { storeId }, // Solo pasar storeId, isAdmin no es un parámetro de la API
    });
    return response.data.data.product;
  } catch (error) {
    // @ts-ignore
    throw new Error(error.response?.data?.message || `Error al obtener el producto con ID ${id}.`);
  }
};

export const createProduct = async (productData: CreateProductSchemaType, images: ImageUploadFile[]): Promise<Product> => {
  try {
    const formData = new FormData();
    for (const key in productData) {
      if (Object.prototype.hasOwnProperty.call(productData, key)) {
        const value = productData[key as keyof CreateProductSchemaType];
        if (typeof value === 'object' && value !== null) {
          formData.append(key, JSON.stringify(value));
        } else {
          formData.append(key, String(value));
        }
      }
    }
    images.forEach((image) => {
      formData.append('images', { uri: image.uri, name: image.name, type: image.type } as any);
    });

    const response = await api.post<ApiResponse<Product>>('/products', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data;
  } catch (error) {
    // @ts-ignore
    throw new Error(error.response?.data?.message || 'Error al crear el producto.');
  }
};

export const updateProduct = async (id: number, productData: UpdateProductSchemaType, files: ImageUploadFile[] = []): Promise<Product> => {
  try {
    if (files.length > 0) {
      const formData = new FormData();
      for (const key in productData) {
        if (Object.prototype.hasOwnProperty.call(productData, key)) {
          const value = productData[key as keyof UpdateProductSchemaType];
          if (value !== undefined && value !== null) {
            // Si es un array de objetos (como initial_stock), lo serializamos a JSON
            if (Array.isArray(value) && value.every(item => typeof item === 'object' && item !== null)) {
              formData.append(key, JSON.stringify(value));
            } else {
              formData.append(key, String(value));
            }
          }
        }
      }
      files.forEach((file) => {
        formData.append('images', file as any);
      });
      const response = await api.patch<ApiResponse<{ product: Product }>>(`/products/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data.data.product;
    } else {
      const response = await api.patch<ApiResponse<{ product: Product }>>(`/products/${id}`, productData);
      return response.data.data.product;
    }
  } catch (error) {
    // @ts-ignore
    throw new Error(error.response?.data?.message || `Error al actualizar el producto con ID ${id}.`);
  }
};

export const softDeleteProduct = async (id: number): Promise<void> => {
  try {
    await api.patch<ApiResponse<void>>(`/products/${id}/soft-delete`);
  } catch (error) {
    // @ts-ignore
    throw new Error(error.response?.data?.message || `Error al archivar el producto con ID ${id}.`);
  }
};

export const restoreProduct = async (id: number): Promise<void> => {
  try {
    await api.patch<ApiResponse<void>>(`/products/${id}/restore`);
  } catch (error) {
    // @ts-ignore
    throw new Error(error.response?.data?.message || `Error al restaurar el producto con ID ${id}.`);
  }
};

export const addProductImage = async (productId: number, imageFile: ImageUploadFile, isThumbnail: boolean = false): Promise<Product> => {
  try {
    const formData = new FormData();
    formData.append('image', { uri: imageFile.uri, name: imageFile.name, type: imageFile.type } as any);
    formData.append('is_thumbnail', String(isThumbnail)); // Añadir el flag is_thumbnail

    const response = await api.post<ApiResponse<Product>>(`/products/${productId}/images`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data;
  } catch (error) {
    // @ts-ignore
    throw new Error(error.response?.data?.message || `Error al añadir imagen al producto ${productId}.`);
  }
};

export const removeProductImage = async (productId: number, imageId: number): Promise<void> => {
  try {
    await api.delete<ApiResponse<void>>(`/products/${productId}/images/${imageId}`);
  } catch (error) {
    // @ts-ignore
    throw new Error(error.response?.data?.message || `Error al eliminar la imagen ${imageId} del producto ${productId}.`);
  }
};

export const setProductThumbnail = async (productId: number, imageId: number): Promise<void> => {
  try {
    await api.patch<ApiResponse<void>>(`/products/${productId}/images/${imageId}/thumbnail`);
  } catch (error) {
    // @ts-ignore
    throw new Error(error.response?.data?.message || `Error al establecer la imagen ${imageId} como miniatura del producto ${productId}.`);
  }
};

export const updateProductStock = async (productId: number, stockData: UpdateProductStockSchemaType): Promise<Product> => {
  try {
    console.log('productsService - Sending PATCH /products/:id/stock with data:', { productId, stockData });
    const response = await api.patch<ApiResponse<Product>>(`/products/${productId}/stock`, stockData);
    return response.data.data;
  } catch (error) {
    // @ts-ignore
    throw new Error(error.response?.data?.message || `Error al actualizar el stock para el producto ${productId}.`);
  }
};
