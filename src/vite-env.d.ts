/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GEMINI_API_KEY: string;
  readonly VITE_PEXELS_API_KEY: string;
  // Diğer ortam değişkenleri...
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
