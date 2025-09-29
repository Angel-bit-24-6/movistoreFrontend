import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants'; // Importar Constants

// Acceder a la URL desde las propiedades "extra" del expo config
const API_BASE_URL = Constants.expoConfig?.extra?.apiUrl as string || 'http://localhost:5000/api/v1'; // Fallback por si acaso

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para añadir el token de autenticación a las peticiones
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('jwtToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores de respuesta (ej. 401 Unauthorized)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    // Si el error es 401 y no es una solicitud de login/registro (para evitar bucles infinitos)
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      // Aquí podrías implementar lógica para refrescar el token o redirigir al login
      // Por ahora, simplemente limpiar el token y redirigir al login (manejar esto en el AuthContext)
      await AsyncStorage.removeItem('jwtToken');
      // No redirigimos aquí directamente para que AuthContext maneje la navegación
    }
    return Promise.reject(error);
  }
);

export default api;
