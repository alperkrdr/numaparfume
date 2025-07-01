import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  base: '/', // Railway veya Netlify gibi ortamlarda kök dizine deploy için
  server: {
    host: true, // Allow external access
    allowedHosts: [
      'localhost',
      '.trycloudflare.com', // Allow all cloudflare tunnel subdomains
      'hostels-answered-lou-actions.trycloudflare.com' // Specific tunnel domain
    ]
  }
});
