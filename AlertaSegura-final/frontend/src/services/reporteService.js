import api from './api';
// funciones para listar/crear reportes y obtener categorías
export const listarReportes = async (distrito) => {
    const params = distrito ? { distrito } : {};
    const response = await api.get('/reportes', { params });
    return response.data;
};

export const crearReporte = async (reporteData) => {
    const response = await api.post('/reportes', reporteData);
    return response.data;
};

export const obtenerCategorias = async () => {
    const response = await api.get('/categorias');
    return response.data;
};

export const actualizarEstadoReporte = async (id, estado) => {
    const response = await api.put(`/reportes/${id}/estado`, { estado });
    return response.data;
};

export const eliminarReporte = async (id) => {
    await api.delete(`/reportes/${id}`);
};