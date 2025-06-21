import { resolve } from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
      "@pages": resolve(__dirname, "./src/pages"),
      "@hooks": resolve(__dirname, "./src/hooks"),
      "@styles": resolve(__dirname, "./src/styles"),
      "@helpers": resolve(__dirname, "./src/helpers"),
      "@layouts": resolve(__dirname, "./src/layouts"),
      "@contexts": resolve(__dirname, "./src/contexts"),
      "@services": resolve(__dirname, "./src/services"),
      "@components": resolve(__dirname, "./src/components"),
    },
  },
});
