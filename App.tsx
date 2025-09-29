import "./global.css";
import 'react-native-get-random-values';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, Text, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from './src/context/AuthContext'; // Importar useAuth
import AppContent from './src/AppContent'; // Importar el nuevo componente AppContent
import { ToastProvider } from './src/context/ToastContext';
import { CartProvider } from './src/context/CartContext'; // Importar el CartProvider
import { StoreProvider } from './src/context/StoreContext'; // Importar el StoreProvider
import ToastContainer from './src/components/Toast/ToastContainer';

export default function App() {
  return (
    <SafeAreaProvider>
      <ToastProvider>
        <AuthProvider>
          <CartProvider>
            <StoreProvider>{/* Envolver con StoreProvider */}
              <SafeAreaView className="flex-1 bg-white">
                <AppContent />{/* Renderizar el nuevo componente AppContent */}
                <ToastContainer />
                <StatusBar style="auto" />
              </SafeAreaView>
            </StoreProvider>
          </CartProvider>
        </AuthProvider>
      </ToastProvider>
    </SafeAreaProvider>
  );
}
