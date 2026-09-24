import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],

  resolve: {
    alias: [
      {
        find: "plotly.js/dist/plotly",
        replacement: path.resolve(
          __dirname,
          "node_modules/plotly.js-dist-min/plotly.min.js"
        ),
      },
    ],
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
