import React from 'react';
import { useAuth } from '../context/AuthContext'; // Necesitarás implementar useAuth
import { StackActions, useNavigation } from '@react-navigation/native';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { isAuthenticated, user } = useAuth();
  const navigation = useNavigation();

  // Si no está autenticado, redirigir a la pantalla de login
  if (!isAuthenticated) {
    navigation.dispatch(StackActions.replace('Auth')); // Asume que 'Auth' es el nombre de tu AuthNavigator
    return null;
  }

  // Si hay roles permitidos, verificar el rol del usuario
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    navigation.dispatch(StackActions.replace('Unauthorized')); // Redirigir a una pantalla de no autorizado o a Home
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
