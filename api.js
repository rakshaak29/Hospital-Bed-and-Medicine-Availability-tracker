// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'

export const API_ENDPOINTS = {
  HEALTH: `${API_BASE_URL}/health`,
  HOSPITALS: `${API_BASE_URL}/hospitals`,
  MEDICINES: `${API_BASE_URL}/medicines`,
  ALERTS: `${API_BASE_URL}/alerts`,
  CRITICAL_ALERTS: `${API_BASE_URL}/alerts/critical`,
  SHORTAGE_TRENDS: `${API_BASE_URL}/trends/shortages`,
}

export default API_ENDPOINTS

