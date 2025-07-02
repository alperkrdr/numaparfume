import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  base: '/', // Railway veya Netlify gibi ortamlarda kök dizine deploy için
  build: {
    rollupOptions: {
      input: 'index.html'
    },
    commonjsOptions: {
      transformMixedEsModules: true
    }
  },
  define: {
    global: 'globalThis', // Fix global is not defined error
  },
  server: {
    host: true, // Allow external access
    allowedHosts: [
      'localhost',
      '.trycloudflare.com', // Allow all cloudflare tunnel subdomains
      'hostels-answered-lou-actions.trycloudflare.com' // Specific tunnel domain
    ],
    proxy: {
      '/api/shopier': {
        target: 'https://api.shopier.com/v1',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/shopier/, ''),
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        }
      }
    }
  }
});
