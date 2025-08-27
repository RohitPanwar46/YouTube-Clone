// API Configuration and Utility Functions


// Backend API base URL - update this to match your backend
export const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URI;


// API endpoints
export const API_ENDPOINTS = {
  LOGIN: '/api/v1/users/login',
  REGISTER: '/api/v1/users/register',
  GETVIDEOS: '/api/v1/videos',
  REFRESH_ACCESS_TOKEN: '/api/v1/users/refresh-token',
  LOGOUT: '/api/v1/users/logout',
  CHANGE_PASSWORD: '/api/v1/users/change-password',
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

// Generic client-side version (works in plain React)
export const toggleVideoLike = async (url, videoId, accessToken, refreshToken) => {
  try {
    const fullUrl = `${BACKEND_URL}${url}/${videoId}`;

    const res = await fetch(fullUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': accessToken ? `Bearer ${accessToken}` : ''
      }
    });

    if (res.status === 401) {
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
        return; // stop further execution
      }
    }

    // Read body safely once
    const data = await res.json();
    if (!res.ok) {
      throw new Error((data && data.message) || `HTTP error! status: ${res.status}`);
    }

    return data;
  } catch (error) {
    console.error('Error toggling video like:', error);
    throw error;
  }
};

export const addView = async (videoId) => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/v1/videos/${videoId}`, {
      method: "POST",
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error adding view:", error);
    throw error;
  }
};

export const toggleSubscribe = async (channelId, accessToken) => {
  try {
    const res = await fetch(`${BACKEND_URL}/api/v1/subscriptions/c/${channelId}`,{
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
        'Authorization': accessToken ? `Bearer ${accessToken}` : ''
      }
    });

    if (res.status === 401) {
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
        return; // stop further execution
      }
    }
    const data = await res.json()
    return data.data;
  } catch (error) {
    console.error("Error toggling subscription:", error);
    throw error;
  }
}

export const getChannelSubscribers = async (channelId,userId) => {
  try {
    const res = await fetch(`${BACKEND_URL}/api/v1/subscriptions/c/${channelId}?userId=${userId}`,{
      method: "GET",
    });
    
    const data = await res.json();
    return data.data;
  } catch (error) {
    console.error("Error fethcing channel subscribers:", error);
    throw error;
  }
}
