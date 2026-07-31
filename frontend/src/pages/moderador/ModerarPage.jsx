import { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar';
import { listarReportes, actualizarEstadoReporte, eliminarReporte } from '../../services/reporteService';

function ModerarPage() {
    const [reportes, setReportes] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState('');
    const [procesandoId, setProcesandoId] = useState(null);

    useEffect(() => {
        cargarReportes();
    }, []);

    const cargarReportes = async () => {
        setCargando(true);
        try {
            const data = await listarReportes();
            setReportes(data);
        } catch (err) {
            setError('No se pudieron cargar los reportes');
        } finally {
            setCargando(false);
        }
    };

    const cambiarEstado = async (id, nuevoEstado) => {
        setProcesandoId(id);
        setError('');
        try {
            await actualizarEstadoReporte(id, nuevoEstado);
            await cargarReportes();
        } catch (err) {
            if (err.response?.status === 403) {
                setError('No tienes permisos para esta acción');
            } else {
                setError('Ocurrió un error al actualizar el reporte');
            }
        } finally {
            setProcesandoId(null);
        }
    };

    const handleEliminar = async (id) => {
        if (!window.confirm('¿Seguro que quieres eliminar este reporte? Esta acción no se puede deshacer.')) {
            return;
        }
        setProcesandoId(id);
        try {
            await eliminarReporte(id);
            await cargarReportes();
        } catch (err) {
            setError('Ocurrió un error al eliminar el reporte');
        } finally {
            setProcesandoId(null);
        }
    };

    const badgeClase = (estado) => {
        if (estado === 'VERIFICADO') return 'badge badge-success';
        if (estado === 'RECHAZADO') return 'badge badge-danger';
        return 'badge badge-pending';
    };

    return (
        <div>
            <Navbar />
            <div style={{ padding: '20px', maxWidth: '900px', margin: '0 auto' }}>
                <h2>Panel de moderación</h2>
                <p>Revisa, verifica o rechaza los reportes enviados por los ciudadanos.</p>

                {error && <p className="error-message">{error}</p>}

                {cargando ? (
                    <p>Cargando reportes...</p>
                ) : reportes.length === 0 ? (
                    <p>No hay reportes registrados.</p>
                ) : (
                    reportes.map((reporte) => (
                        <div key={reporte.id} className="moderar-card">
                            <div className="moderar-header">
                                <strong>{reporte.categoriaNombre}</strong>
                                <span className={badgeClase(reporte.estado)}>{reporte.estado}</span>
                            </div>
                            <p>{reporte.descripcion}</p>
                            <small>
                                {reporte.distrito} · Reportado por {reporte.usuarioNombre} ·{' '}
                                {new Date(reporte.createdAt).toLocaleString('es-PE')}
                            </small>

                            <div className="moderar-actions">
                                <button
                                    onClick={() => cambiarEstado(reporte.id, 'VERIFICADO')}
                                    disabled={procesandoId === reporte.id || reporte.estado === 'VERIFICADO'}
                                    className="btn-verificar"
                                >
                                    Verificar
                                </button>
                                <button
                                    onClick={() => cambiarEstado(reporte.id, 'RECHAZADO')}
                                    disabled={procesandoId === reporte.id || reporte.estado === 'RECHAZADO'}
                                    className="btn-rechazar"
                                >
                                    Rechazar
                                </button>
                                <button
                                    onClick={() => handleEliminar(reporte.id)}
                                    disabled={procesandoId === reporte.id}
                                    className="btn-eliminar"
                                >
                                    Eliminar
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

export default ModerarPage;