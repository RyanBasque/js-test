// In development the Vite proxy forwards /api/* to http://localhost:3000/api/*.
// In production, set VITE_API_URL to the backend origin (e.g. https://api.example.com).
export const API_BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : "/api";
