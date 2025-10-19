// Base API URL - Updated to port 5000
const API_BASE_URL =
  process.env.REACT_APP_API_URL_ADMIN || "https://segunda-mana-api-1413b1b45a73.herokuapp.com/api/admin";

// Helper function for fetch requests
const fetchAPI = async (endpoint, options = {}) => {
  try {
    // Get auth token from session storage if it exists
    const token = sessionStorage.getItem("sg_admin_token");
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Something went wrong");
    }

    return data;
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
};

// Analytics API
export const getAnalytics = async () => {
  return fetchAPI("/analytics");
};

// Products API
export const getProducts = async () => {
  return fetchAPI("/products");
};

export const createProduct = async (productData) => {
  return fetchAPI("/products", {
    method: "POST",
    body: JSON.stringify(productData),
  });
};

export const updateProduct = async (id, productData) => {
  return fetchAPI(`/products/${id}`, {
    method: "PUT",
    body: JSON.stringify(productData),
  });
};

export const deleteProduct = async (id) => {
  return fetchAPI(`/products/${id}`, {
    method: "DELETE",
  });
};

// Orders API
export const getOrders = async () => {
  return fetchAPI("/orders");
};

export const updateOrderStatus = async (id, status) => {
  return fetchAPI(`/orders/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
};

// Beneficiaries API
export const getAllBeneficiaries = async () => {
  return fetchAPI("/beneficiaries");
};

export const addBeneficiary = async (beneficiaryData) => {
  return fetchAPI("/beneficiaries/add", {
    method: "POST",
    body: JSON.stringify(beneficiaryData),
  });
};

export const updateBeneficiaryStatus = async (id, status) => {
  return fetchAPI(`/beneficiaries/${id}/status`, {
    method: "POST",
    body: JSON.stringify({ status }),
  });
};

export const updateBeneficiaryDetails = async (id, payload) => {
  const response = await fetch(`https://segunda-mana-api-1413b1b45a73.herokuapp.com/api/admin/beneficiaries/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error("Failed to update beneficiary");
  return await response.json();
};

// User Messaging API
export const sendUserMessage = async (messageData) => {
  return fetchAPI("/messaging", {
    method: "POST",
    body: JSON.stringify(messageData),
  });
};

// Announcements API
export const getAnnouncements = async () => {
  return fetchAPI("/announcements");
};

export const createAnnouncement = async (announcementData) => {
  return fetchAPI("/announcements", {
    method: "POST",
    body: JSON.stringify(announcementData),
  });
};
