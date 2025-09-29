export interface User {
  id: number;
  name: string;
  apellido_paterno: string;
  apellido_materno: string;
  email: string;
  role: 'customer' | 'admin';
  status: 'active' | 'archived';
  created_at: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  apellido_paterno: string;
  apellido_materno: string;
  email: string;
  password: string;
  role?: 'customer' | 'admin'; // Opcional, con valor por defecto en el backend
}

export interface ApiResponse<T> {
  status: string;
  message?: string;
  data: T;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  description?: string;
}

export interface ProductImage {
  id: number;
  product_id: number;
  secure_url: string;
  public_id: string;
  is_thumbnail: boolean;
  type: string;
  resource_type: string;
  created_at: string;
}

export interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  sku?: string;
  category_id: number | null; // MODIFICADO: Ahora puede ser null
  category_name?: string;
  total_stock: number; // Suma del stock en todas las tiendas
  status: 'active' | 'archived';
  created_at: string;
  updated_at: string;
  images?: ProductImage[]; // Imágenes asociadas al producto
  thumbnail_url?: string | null; // URL de la imagen en miniatura para la lista de productos
  stock_by_store?: ProductStockByStore[]; // Stock por tienda
  stock_in_selected_store?: number | null; // Stock para la tienda seleccionada (viene de getAllProducts/getProductById)
}

export interface ProductStockByStore {
  store_id: number;
  store_name: string;
  quantity: number;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
  status: 'active' | 'archived';
  created_at: string;
  updated_at: string;
}

export interface ImageUploadFile {
  uri: string;
  name: string;
  type: string;
}

export interface Store {
  id: number;
  name: string;
  address?: string;
  status: 'active' | 'archived';
  created_at: string;
  updated_at: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Order {
  id: number;
  user_id: number;
  store_id: number;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  created_at: string;
  user_name?: string; // Nombre del usuario, para admins
  store_name?: string; // Nombre de la tienda
  items?: OrderItem[]; // Productos en la orden
}

export interface OrderItem {
  order_id: number;
  product_id: number;
  quantity: number;
  unit_price: number;
  product_name?: string; // Nombre del producto
  product?: Product; // Detalles completos del producto si se cargan
}

// Nueva interfaz para la información de paginación
export interface PaginationResult {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  limit: number;
}

// Nueva interfaz para la respuesta de una lista paginada de productos
export interface ProductListResponse {
  products: Product[];
  pagination: PaginationResult;
}

export interface CategoryListResponse {
  categories: Category[];
  pagination: PaginationResult;
}

export interface StoreListResponse {
  stores: Store[];
  pagination: PaginationResult;
}

export interface OrderListResponse {
  orders: Order[];
  pagination: PaginationResult;
}