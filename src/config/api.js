// API Configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// API endpoints
export const API_ENDPOINTS = {
  ANNOUNCEMENTS: {
    GET_ALL: `${API_BASE_URL}/api/admin/announcements`,
    GET_PUBLIC: `${API_BASE_URL}/api/admin/announcements/public`,
    ADD: `${API_BASE_URL}/api/admin/announcements/add`,
    DELETE: (id) => `${API_BASE_URL}/api/admin/announcements/${id}`,
    TOGGLE_STATUS: (id) => `${API_BASE_URL}/api/admin/announcements/${id}/status`,
  }
};

// Helper function to get auth token from sessionStorage
export const getAuthToken = () => {
  return sessionStorage.getItem('sg_admin_token');
};

// Helper function to get default headers
export const getDefaultHeaders = () => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

export default API_BASE_URL;
