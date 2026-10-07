import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig({
  plugins: [react(), tailwindcss()],

  resolve: {
    alias: [
      {
        find: "plotly.js/dist/plotly",
        replacement: path.resolve(
          __dirname,
          "node_modules/plotly.js-dist-min/plotly.min.js"
        ),
      },
      { find: "@", replacement: path.resolve(__dirname, "src") },
    ],
  },

  build: {
    rollupOptions: {
      output: {
        // Plotly num arquivo próprio: só é baixado ao abrir o dashboard.
        manualChunks: (id) => (id.includes("plotly") ? "plotly" : undefined),
      },
    },
  },

  server: {
    port: 5173,

    proxy: {
      "/api": {
        target: "http://127.0.0.1:8000",
        changeOrigin: true,
      },
    },
  },
});
