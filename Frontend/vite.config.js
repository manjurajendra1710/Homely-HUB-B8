import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],

  server: {
    proxy: {
      "/unsplash": {
        target: "https://images.unsplash.com",
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/unsplash/, "")
      },

      "/api": {
        target: "http://localhost:8080",
        changeOrigin: true,
        secure: false
      }
    }
  }
});