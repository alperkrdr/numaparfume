import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from './hooks/useAuth';
import App from './App.tsx';
import './index.css';

// Development için Shopier test fonksiyonlarını yükle
if (import.meta.env.DEV) {
  import('./utils/shopierTest');
}

createRoot(document.getElementById('root')!).render(
  <HelmetProvider>
    <AuthProvider>
      <App />
    </AuthProvider>
  </HelmetProvider>
);
