import { defineConfig } from "vite";
import { resolve } from "path";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
      "@pages": resolve(__dirname, "./src/pages"),
      "@layouts": resolve(__dirname, "./src/layouts"),
      "@contexts": resolve(__dirname, "./src/contexts"),
    },
  },
});
