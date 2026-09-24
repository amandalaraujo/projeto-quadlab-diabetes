import axios from "axios";

// Em dev, o vite.config.js faz proxy de /api pro Django em :8000, então
// baseURL pode ficar relativo. Em produção, aponte pra URL real da API
// via variável de ambiente (VITE_API_URL) na hora do build.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
});

export default api;
