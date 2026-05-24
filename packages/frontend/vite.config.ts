import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    // Ouvir em 0.0.0.0 é obrigatório dentro de containers Docker
    host: true,
    port: 5173,
    watch: {
      // Polling necessário para detectar mudanças em volumes montados (Windows/macOS)
      usePolling: true,
    },
    proxy: {
      // Em Docker: VITE_BACKEND_URL=http://backend:3000 (nome do serviço no compose)
      // Localmente sem Docker: usa http://localhost:3000
      "/api": {
        target: process.env["VITE_BACKEND_URL"] ?? "http://localhost:3000",
        changeOrigin: true,
      },
    },
  },
});
