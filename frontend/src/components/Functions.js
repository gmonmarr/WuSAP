// src/components/Functions.js

import axios from 'axios';

export const handleLogin = async (email, password) => {
    try {
        const response = await axios.post(import.meta.env.VITE_API_SERVER, { email, password });
        return response.data;
    } catch (error) {
        console.error("Error during login:", error);
        throw error;
    }
}