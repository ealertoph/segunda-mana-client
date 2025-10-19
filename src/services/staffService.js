const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://segunda-mana-api-1413b1b45a73.herokuapp.com';

// Helper function to get auth token
const getAuthToken = () => {
  return sessionStorage.getItem('sg_admin_token');
};

export const staffService = {
  // Get all staff accounts
  getAllStaff: async () => {
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/api/admin/staff`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('Error fetching staff:', error);
      return { success: false, error: error.message };
    }
  },

  // Get single staff account
  getStaffById: async (id) => {
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/api/admin/staff/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('Error fetching staff:', error);
      return { success: false, error: error.message };
    }
  },

  // Create new staff account
  createStaff: async (staffData) => {
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/api/admin/staff`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(staffData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('Error creating staff:', error);
      return { success: false, error: error.message };
    }
  },

  // Update staff account
  updateStaff: async (id, staffData) => {
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/api/admin/staff/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(staffData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('Error updating staff:', error);
      return { success: false, error: error.message };
    }
  },

  // Delete staff account
  deleteStaff: async (id) => {
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/api/admin/staff/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('Error deleting staff:', error);
      return { success: false, error: error.message };
    }
  },

  // Toggle staff status (active/inactive)
  toggleStaffStatus: async (id, status) => {
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/api/admin/staff/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('Error toggling staff status:', error);
      return { success: false, error: error.message };
    }
  }
};

