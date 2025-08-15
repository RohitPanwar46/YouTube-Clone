// API Configuration and Utility Functions

// Backend API base URL - update this to match your backend
export const BACKEND_URL = process.env.BACKEND_URL || "https://project-youtube-backend-1.onrender.com";

// API endpoints
export const API_ENDPOINTS = {
  LOGIN: '/api/v1/users/login',
  REGISTER: '/api/v1/users/register',
  GETVIDEOS: '/api/v1/videos',
  REFRESH_ACCESS_TOKEN: '/api/v1/users/refresh-token',
  LOGOUT: '/api/v1/users/logout',
};

// Common fetch wrapper with error handling
export const apiRequest = async (endpoint, options = {}) => {
  try {
    const response = await fetch(`${BACKEND_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

// File upload helper
export const uploadFiles = async (endpoint, formData) => {
  try {
    const response = await fetch(`${BACKEND_URL}${endpoint}`, {
      method: 'POST',
      body: formData, // FormData ke liye Content-Type mat set karo
    });

    const contentType = response.headers.get('content-type');

    if (!response.ok) {
      let errorMessage;
      if (contentType && contentType.includes('application/json')) {
        const errorData = await response.json();
        errorMessage = errorData.message || `HTTP error! status: ${response.status}`;
      } else {
        const errorText = await response.text();
        errorMessage = `Server error: ${errorText}`;
      }
      throw new Error(errorMessage);
    }

    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    } else {
      return await response.text(); // Fallback for non-JSON responses
    }
  } catch (error) {
    console.error('File upload failed:', error);
    throw error;
  }
};

// custom api endpoints
