// ==============================
// API Configuration
// ==============================

/**
 * The base URL for API requests.
 *
 * Defaults to `http://localhost:5000/api`, which matches the FastAPI dev server when running manually.
 * 
 * For production (or Docker-based setups), the value is injected at build time via the
 * `VITE_API_BASE_URL` environment variable, typically set in the Docker Compose file.
 *
 * In that case, Nginx is configured to reverse-proxy `/api/` to the FastAPI backend container.
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

export { API_BASE_URL };