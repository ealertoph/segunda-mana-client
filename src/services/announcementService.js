import { API_ENDPOINTS, getDefaultHeaders } from '../config/api';

// Announcement API service
export const announcementService = {
  // Get all announcements (public)
  getPublicAnnouncements: async () => {
    try {
      const response = await fetch(API_ENDPOINTS.ANNOUNCEMENTS.GET_PUBLIC, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('Error fetching public announcements:', error);
      return { success: false, error: error.message };
    }
  },

  // Get all announcements (admin)
  getAllAnnouncements: async () => {
    try {
      const response = await fetch(API_ENDPOINTS.ANNOUNCEMENTS.GET_ALL, {
        method: 'GET',
        headers: getDefaultHeaders(),
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('Error fetching announcements:', error);
      return { success: false, error: error.message };
    }
  },

  // Add new announcement (supports single image upload)
  addAnnouncement: async (announcementData) => {
    try {
      let options = {
        method: 'POST',
        headers: getDefaultHeaders(),
        body: null,
      };

      // If announcementData is FormData (file included)
      if (announcementData instanceof FormData) {
        options.body = announcementData;
        // Do NOT set Content-Type; the browser will set multipart/form-data automatically
        delete options.headers['Content-Type'];
      } else {
        // JSON fallback
        options.body = JSON.stringify(announcementData);
      }

      const response = await fetch(API_ENDPOINTS.ANNOUNCEMENTS.ADD, options);

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('Error adding announcement:', error);
      return { success: false, error: error.message };
    }
  },

  // Delete announcement
  deleteAnnouncement: async (id) => {
    try {
      const response = await fetch(API_ENDPOINTS.ANNOUNCEMENTS.DELETE(id), {
        method: 'POST',
        headers: getDefaultHeaders(),
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('Error deleting announcement:', error);
      return { success: false, error: error.message };
    }
  },

  // Toggle announcement status (active/inactive)
  toggleAnnouncementStatus: async (id, active) => {
    try {
      const response = await fetch(API_ENDPOINTS.ANNOUNCEMENTS.TOGGLE_STATUS(id), {
        method: 'POST',
        headers: getDefaultHeaders(),
        body: JSON.stringify({ active }),
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('Error toggling announcement status:', error);
      return { success: false, error: error.message };
    }
  }
};
