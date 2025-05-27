// src/services/api.js

import axios from 'axios';

// Create axios instance with base URL from environment variables
const api = axios.create({
  baseURL: import.meta.env.VITE_API_SERVER,
});

// Debug interceptors
api.interceptors.request.use(
  (config) => {
    console.log('Request:', config.method.toUpperCase(), config.url);
    console.log('Request Headers:', config.headers);
    console.log('Request Data:', config.data);
    return config;
  },
  (error) => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    console.log('Response:', response.status, response.statusText);
    console.log('Response Data:', response.data);
    return response;
  },
  (error) => {
    console.error('Response Error:', error.response ? {
      status: error.response.status,
      data: error.response.data
    } : error.message);
    return Promise.reject(error);
  }
);

// Authentication services
export const authService = {
  login: async (email, password) => {
    try {
      const response = await api.post('/api/auth/login', { email, password });
      
      // Si la petición es exitosa, guardar el token y datos de usuario en sessionStorage
      if (response.data && response.data.token) {
        sessionStorage.setItem('token', response.data.token);
        sessionStorage.setItem('user', JSON.stringify(response.data.user));
      }
      
      return response.data;
    } catch (error) {
      console.error('Error during login:', error);
      throw error;
    }
  },
  
  register: async (userData) => {
    try {
      const token = sessionStorage.getItem('token');
      
      if (!token) {
        throw new Error('No estás autorizado para realizar esta acción. Por favor, inicia sesión nuevamente.');
      }
      
      // Validate required fields - storeID is optional
      const requiredFields = ['name', 'lastname', 'email', 'password', 'role', 'cellphone'];
      const missingFields = requiredFields.filter(field => !userData[field]);
      
      if (missingFields.length > 0) {
        throw new Error(`Faltan campos requeridos: ${missingFields.join(', ')}`);
      }
      
      console.log("API Service - Sending data:", userData);
      
      const response = await api.post('/api/auth/register', userData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Error during user registration:', error);
      
      // Si es un error de axios con respuesta del servidor
      if (error.response) {
        console.error('Server response error:', error.response.data);
        throw error;
      }
      
      // Si es un error de red o un error propio
      throw error;
    }
  },
  
  logout: () => {
    // Eliminar token y datos de usuario de sessionStorage
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
  },
  
  getToken: () => {
    return sessionStorage.getItem('token');
  },
  
  getUser: () => {
    const userStr = sessionStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },
  
  isAuthenticated: () => {
    return !!sessionStorage.getItem('token');
  }
};

// Employee service
export const employeeService = {
  // Get all employees
  getAllEmployees: async () => {
    try {
      const response = await api.get('/api/employees');
      return response.data;
    } catch (error) {
      console.error('Error fetching employees:', error);
      throw error;
    }
  },
  
  // Update employee
  updateEmployee: async (employeeId, employeeData) => {
    try {
      const response = await api.put(`/api/employees/${employeeId}`, employeeData);
      return response.data;
    } catch (error) {
      console.error('Error updating employee:', error);
      throw error;
    }
  }
};

// Configure interceptor to add token to all requests
api.interceptors.request.use(
  (config) => {
    const token = authService.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Export the axios instance for direct use if needed
export default api;

// Product services
export const productService = {
  // Get all products
  getAllProducts: async () => {
    try {
      const response = await api.get('/api/product/');
      return response;
    } catch (error) {
      console.error('Error fetching all products:', error);
      throw error;
    }
  },

  // Get only active products
  getActiveProducts: async () => {
    try {
      const response = await api.get('/api/product/active');
      return response;
    } catch (error) {
      console.error('Error fetching active products:', error);
      throw error;
    }
  },

  // Create a new product
  createProduct: async (productData) => {
    try {
      const response = await api.post('/api/product/', productData);
      return response;
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  },

  // Update a product
  updateProduct: async (productId, productData) => {
    try {
      const response = await api.put(`/api/product/${productId}`, productData);
      return response;
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  },

  // Delete a product
  deleteProduct: async (productId) => {
    try {
      const response = await api.delete(`/api/product/${productId}`);
      return response;
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  }
};

// Location services
export const locationService = {
  // Get all locations
  getAllLocations: async () => {
    try {
      const response = await api.get('/api/locations');
      return response.data;
    } catch (error) {
      console.error('Error fetching locations:', error);
      throw error;
    }
  },

  // Get location by ID
  getLocationById: async (locationId) => {
    try {
      const response = await api.get(`/api/locations/${locationId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching location:', error);
      throw error;
    }
  },

  // Create a new location
  createLocation: async (locationData) => {
    try {
      const response = await api.post('/api/locations', locationData);
      return response.data;
    } catch (error) {
      console.error('Error creating location:', error);
      throw error;
    }
  },

  // Update location
  updateLocation: async (locationId, locationData) => {
    try {
      const response = await api.put(`/api/locations/${locationId}`, locationData);
      return response.data;
    } catch (error) {
      console.error('Error updating location:', error);
      throw error;
    }
  },

  // Delete location
  deleteLocation: async (locationId) => {
    try {
      const response = await api.delete(`/api/locations/${locationId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting location:', error);
      throw error;
    }
  }
};

// Inventory services
export const inventoryService = {
  // Get all inventory
  getAllInventory: async () => {
    try {
      const response = await api.get('/api/inventory/');
      return response;
    } catch (error) {
      console.error('Error fetching all inventory:', error);
      throw error;
    }
  },

  // Get inventory by store
  getStoreInventory: async (storeID = null) => {
    try {
      const response = await api.get('/api/inventory/store', {
        data: storeID ? { storeID } : {}
      });
      return response;
    } catch (error) {
      console.error('Error fetching store inventory:', error);
      throw error;
    }
  },

  // Get warehouse products (storeid = 1)
  getWarehouseProducts: async () => {
    try {
      const response = await api.get('/api/inventory/warehouse');
      return response;
    } catch (error) {
      console.error('Error fetching warehouse products:', error);
      throw error;
    }
  },

  // Assign/Update inventory to store
  assignInventoryToStore: async (productID, storeID, quantity) => {
    try {
      const response = await api.post('/api/inventory/', {
        productID,
        storeID,
        quantity
      });
      return response;
    } catch (error) {
      console.error('Error assigning inventory to store:', error);
      throw error;
    }
  }
}; 