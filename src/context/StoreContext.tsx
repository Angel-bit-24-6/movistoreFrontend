import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { Store } from '../types';
import { useToast } from './ToastContext';
import { getAllStores } from '../features/stores/services/storesService';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface StoreContextType {
  stores: Store[];
  selectedStoreId: number | null;
  setSelectedStoreId: (id: number | null) => void;
  isLoadingStores: boolean;
  errorStores: string | null;
  fetchStores: () => Promise<void>; // Para refrescar la lista de tiendas
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

interface StoreProviderProps {
  children: React.ReactNode;
}

export const StoreProvider: React.FC<StoreProviderProps> = ({ children }) => {
  const [stores, setStores] = useState<Store[]>([]);
  const [selectedStoreId, internalSetSelectedStoreId] = useState<number | null>(null);
  const [isLoadingStores, setIsLoadingStores] = useState<boolean>(true);
  const [errorStores, setErrorStores] = useState<string | null>(null);
  const { showToast } = useToast();

  const STORE_ID_STORAGE_KEY = 'selectedStoreId';

  // Función para establecer la tienda seleccionada y guardarla en AsyncStorage
  const setSelectedStoreId = useCallback(async (id: number | null) => {
    internalSetSelectedStoreId(id);
    try {
      if (id !== null) {
        await AsyncStorage.setItem(STORE_ID_STORAGE_KEY, id.toString());
      } else {
        await AsyncStorage.removeItem(STORE_ID_STORAGE_KEY);
      }
    } catch (e) {
      console.error('Error saving selected store ID to AsyncStorage:', e);
      showToast('error', 'Error', 'No se pudo guardar la selección de tienda.');
    }
  }, [showToast]);

  const fetchStores = useCallback(async () => {
    setIsLoadingStores(true);
    setErrorStores(null);
    try {
      // Modificar la llamada a getAllStores para pasar los parámetros correctos
      const response = await getAllStores(1, 10, false, '', false); // page, limit, includeArchived, searchTerm, isAdmin
      setStores(response.stores);

      const storedStoreId = await AsyncStorage.getItem(STORE_ID_STORAGE_KEY);
      if (storedStoreId) {
        const parsedId = parseInt(storedStoreId, 10);
        if (response.stores.some(store => store.id === parsedId)) {
          internalSetSelectedStoreId(parsedId);
        } else if (response.stores.length > 0) {
          setSelectedStoreId(response.stores[0].id);
        }
      } else if (response.stores.length > 0) {
        setSelectedStoreId(response.stores[0].id);
      }
    } catch (err) {
      const errorMessage = (err instanceof Error) ? err.message : 'Error desconocido al cargar las tiendas.';
      setErrorStores(errorMessage);
      showToast('error', 'Error de carga', `No se pudieron cargar las tiendas: ${errorMessage}`);
    } finally {
      setIsLoadingStores(false);
    }
  }, [showToast, setSelectedStoreId]);

  useEffect(() => {
    fetchStores();
  }, [fetchStores]);

  const contextValue = React.useMemo(() => ({
    stores,
    selectedStoreId,
    setSelectedStoreId,
    isLoadingStores,
    errorStores,
    fetchStores,
  }), [stores, selectedStoreId, setSelectedStoreId, isLoadingStores, errorStores, fetchStores]);

  return <StoreContext.Provider value={contextValue}>{children}</StoreContext.Provider>;
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
