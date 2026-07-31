import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8080/api',
});

// El Interceptor agrega el JWT automáticamente a cada request si existe
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;