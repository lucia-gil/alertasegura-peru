import api from './api';

// funciones simples que llaman a tus endpoints de auth ya construidos
export const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
};

export const register = async (nombre, email, password) => {
    const response = await api.post('/auth/register', { nombre, email, password });
    return response.data;
};