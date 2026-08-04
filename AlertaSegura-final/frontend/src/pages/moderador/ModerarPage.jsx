import { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar';
import { listarReportes, actualizarEstadoReporte, eliminarReporte } from '../../services/reporteService';

const badgeEstado = (estado) => {
    if (estado === 'VERIFICADO') return 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400';
    if (estado === 'RECHAZADO') return 'bg-red-500/15 text-red-600 dark:text-red-400';
    return 'bg-amber-500/15 text-amber-600 dark:text-amber-400';
};

const TABS = [
    { key: 'PENDIENTE', label: 'Pendientes' },
    { key: 'VERIFICADO', label: 'Verificados' },
    { key: 'RECHAZADO', label: 'Rechazados' },
    { key: 'TODOS', label: 'Todos' },
];

function ModerarPage() {
    const [reportes, setReportes] = useState([]);
    const [tabActiva, setTabActiva] = useState('PENDIENTE');
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

    const conteo = (key) =>
        key === 'TODOS' ? reportes.length : reportes.filter((r) => r.estado === key).length;

    const reportesFiltrados =
        tabActiva === 'TODOS' ? reportes : reportes.filter((r) => r.estado === tabActiva);

    return (
        <div className="min-h-screen bg-surface-0 dark:bg-surface-dark-0">
            <Navbar />

            <div className="max-w-3xl mx-auto px-6 py-8">
                <h1 className="font-display text-2xl font-semibold text-gray-900 dark:text-gray-100">Panel de moderación</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 mb-6">
                    Revisa, verifica o rechaza los reportes enviados por los ciudadanos.
                </p>

                <div className="flex gap-1 bg-black/[0.04] dark:bg-white/[0.05] p-1 rounded-xl mb-6 w-fit">
                    {TABS.map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setTabActiva(tab.key)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition cursor-pointer ${
                                tabActiva === tab.key
                                    ? 'bg-surface-1 dark:bg-surface-dark-2 text-gray-900 dark:text-gray-100 shadow-sm'
                                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                            }`}
                        >
                            {tab.label}
                            <span
                                className={`text-xs px-1.5 py-0.5 rounded-full ${
                                    tabActiva === tab.key
                                        ? 'bg-marca-500/15 text-marca-600 dark:text-marca-300'
                                        : 'bg-black/[0.06] dark:bg-white/[0.08] text-gray-500 dark:text-gray-400'
                                }`}
                            >
                {conteo(tab.key)}
              </span>
                        </button>
                    ))}
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mb-4">
                        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                    </div>
                )}

                {cargando ? (
                    <p className="text-gray-400 dark:text-gray-500 text-sm">Cargando reportes...</p>
                ) : reportesFiltrados.length === 0 ? (
                    <p className="text-gray-400 dark:text-gray-500 text-sm">No hay reportes en esta categoría.</p>
                ) : (
                    <div className="space-y-4">
                        {reportesFiltrados.map((reporte) => (
                            <div key={reporte.id} className="bg-surface-1 dark:bg-surface-dark-1 border border-black/[0.06] dark:border-white/[0.08] rounded-2xl shadow-sm p-5">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="font-semibold text-gray-900 dark:text-gray-100">{reporte.categoriaNombre}</span>
                                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${badgeEstado(reporte.estado)}`}>
                    {reporte.estado}
                  </span>
                                </div>

                                <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">{reporte.descripcion}</p>

                                <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">
                                    {reporte.distrito} · Reportado por {reporte.usuarioNombre} ·{' '}
                                    {new Date(reporte.createdAt).toLocaleString('es-PE')}
                                </p>

                                <div className="flex gap-2">
                                    <button
                                        onClick={() => cambiarEstado(reporte.id, 'VERIFICADO')}
                                        disabled={procesandoId === reporte.id || reporte.estado === 'VERIFICADO'}
                                        className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-lg transition cursor-pointer"
                                    >
                                        Verificar
                                    </button>
                                    <button
                                        onClick={() => cambiarEstado(reporte.id, 'RECHAZADO')}
                                        disabled={procesandoId === reporte.id || reporte.estado === 'RECHAZADO'}
                                        className="px-4 py-1.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-lg transition cursor-pointer"
                                    >
                                        Rechazar
                                    </button>
                                    <button
                                        onClick={() => handleEliminar(reporte.id)}
                                        disabled={procesandoId === reporte.id}
                                        className="px-4 py-1.5 bg-red-500 hover:bg-red-600 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-lg transition cursor-pointer"
                                    >
                                        Eliminar
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default ModerarPage;
