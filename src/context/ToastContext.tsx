import React, { createContext, useState, useContext, ReactNode, useCallback } from 'react';
import { ToastMessage } from '../types'; // Importa la interfaz ToastMessage
import { v4 as uuidv4 } from 'uuid'; // Necesitarás instalar uuid

interface ToastContextType {
  toasts: ToastMessage[];
  showToast: (type: ToastMessage['type'], title: string, description?: string, duration?: number) => void;
  hideToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

interface ToastProviderProps {
  children: ReactNode;
}

export const ToastProvider = ({ children }: ToastProviderProps) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback((type: ToastMessage['type'], title: string, description?: string, duration: number = 3000) => {
    const id = uuidv4();
    const newToast: ToastMessage = { id, type, title, description };
    setToasts((prevToasts) => [...prevToasts, newToast]);

    setTimeout(() => {
      hideToast(id);
    }, duration);
  }, []);

  const hideToast = useCallback((id: string) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, showToast, hideToast }}>
      {children}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast debe ser usado dentro de un ToastProvider');
  }
  return context;
};
