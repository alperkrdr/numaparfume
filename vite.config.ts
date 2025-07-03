import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'firebase/app',
      'firebase/auth', 
      'firebase/firestore',
      'lucide-react'
    ]
  },
  base: '/', // Railway veya Netlify gibi ortamlarda kök dizine deploy için
  build: {
    target: 'es2015',
    minify: 'esbuild',
    cssMinify: true,
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks
          'vendor-react': ['react', 'react-dom'],
          'vendor-firebase': ['firebase/app', 'firebase/auth', 'firebase/firestore'],
          'vendor-ui': ['lucide-react', 'react-helmet-async'],
          
          // Feature chunks
          'admin': [
            'src/components/AdminPanel.tsx',
            'src/services/stockService.ts',
            'src/config/adminConfig.ts'
          ],
          'shop': [
            'src/components/ProductCard.tsx',
            'src/components/ProductDetail.tsx',
            'src/components/CartModal.tsx',
            'src/services/shopierService.ts'
          ],
          'forum': [
            'src/components/Forum.tsx',
            'src/services/forumService.ts',
            'src/hooks/useForum.ts'
          ]
        }
      }
    },
    chunkSizeWarningLimit: 1000
  },
  define: {
    global: 'globalThis', // Fix global is not defined error
    __DEV__: JSON.stringify(process.env.NODE_ENV === 'development')
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
    },
    port: 3000,
    open: true,
    cors: true
  },
  preview: {
    port: 3000,
    open: true
  }
});
