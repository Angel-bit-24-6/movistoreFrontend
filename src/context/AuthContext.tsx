import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { loginUser, registerUser, getUserProfile } from '../../src/features/auth/services/authService'; // Necesitarás implementar estos servicios
import { User, LoginCredentials, RegisterData } from '../types'; // Necesitarás definir estos tipos
// import { StackActions, useNavigation } from '@react-navigation/native'; // Eliminado useNavigation
import { useToast } from './ToastContext'; // Necesitarás implementar ToastContext

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  // onAuthChange: (isAuthenticated: boolean) => void; // Podríamos necesitar un callback para AppNavigator
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  // const navigation = useNavigation(); // Eliminado
  const { showToast } = useToast();

  useEffect(() => {
    const loadAuthState = async () => {
      try {
        const token = await AsyncStorage.getItem('jwtToken');
        if (token) {
          const profile = await getUserProfile();
          setUser(profile);
          setIsAuthenticated(true);
        }
      } catch (error) {
        // --- INICIO DE MODIFICACIÓN ---
        console.error('Error al cargar el estado de autenticación:', error);
        await AsyncStorage.removeItem('jwtToken'); // Limpiar token inválido
        showToast('warning', 'Sesión Invalida', 'No se pudo comprobar la autenticacion de sesion.'); // Mostrar toast
        // --- FIN DE MODIFICACIÓN ---
      } finally {
        setIsLoading(false);
      }
    };

    loadAuthState();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    try {
      const { token, user: loggedInUser } = await loginUser(credentials);
      await AsyncStorage.setItem('jwtToken', token);
      setUser(loggedInUser);
      setIsAuthenticated(true);
      showToast('success', '¡Bienvenido!', 'Has iniciado sesión exitosamente.');
      // navigation.dispatch(StackActions.replace('Main')); // Eliminado
    } catch (error: any) {
      showToast('error', 'Error de inicio de sesión', error.response?.data?.message || 'Credenciales inválidas.');
      throw error; // Propagar el error para que los componentes puedan manejarlo
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterData) => {
    setIsLoading(true);
    try {
      const { token, user: registeredUser } = await registerUser(data);
      await AsyncStorage.setItem('jwtToken', token);
      setUser(registeredUser);
      setIsAuthenticated(true);
      showToast('success', '¡Registro exitoso!', 'Tu cuenta ha sido creada.');
      // navigation.dispatch(StackActions.replace('Main')); // Eliminado
    } catch (error: any) {
      showToast('error', 'Error de registro', error.response?.data?.message || 'Hubo un problema al registrarte.');
      throw error; // Propagar el error
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    await AsyncStorage.removeItem('jwtToken');
    setIsAuthenticated(false);
    setUser(null);
    showToast('info', 'Sesión cerrada', 'Has cerrado sesión exitosamente.');
    // navigation.dispatch(StackActions.replace('Auth')); // Eliminado
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};
