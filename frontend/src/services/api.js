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
      
      // Validación adicional de los datos requeridos
      const requiredFields = ['name', 'lastName', 'email', 'password', 'role', 'cellphone'];
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
      return response.data;
    } catch (error) {
      console.error('Error fetching all products:', error);
      throw error;
    }
  },

  // Get only active products
  getActiveProducts: async () => {
    try {
      const response = await api.get('/api/product/active');
      return response.data;
    } catch (error) {
      console.error('Error fetching active products:', error);
      throw error;
    }
  },

  // Create a new product
  createProduct: async (productData) => {
    try {
      const response = await api.post('/api/product/', productData);
      return response.data;
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  }
}; 